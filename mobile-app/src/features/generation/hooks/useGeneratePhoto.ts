import { useCallback, useEffect, useRef, useState } from 'react';
import { useCoins } from '../../coins/hooks/useCoins';
import {
  cancelImageGeneration,
  getImageResult,
  getImageStatus,
  submitImageGeneration,
} from '../../profile/services/aiImageProviders';
import { cacheRemoteImage } from '../../../utils/imageCache';
import { DreamshotStylePreset } from '../types';
import { useGenerationJob } from './useGenerationJob';

const POLL_INTERVAL_MS = 5000;
const QUEUE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const mapProviderStatus = (status: string): 'queued' | 'processing' | 'completed' | 'failed' => {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'FAILED' || status === 'CANCELED') return 'failed';
  if (status === 'IN_PROGRESS') return 'processing';
  return 'queued';
};

type SubmitPhotoInput = {
  imageUri: string;
  style: DreamshotStylePreset;
};

type UseGeneratePhotoResult = {
  isSubmitting: boolean;
  submitPhoto: (input: SubmitPhotoInput) => Promise<string>;
  cancelPhoto: (requestId: string) => Promise<void>;
};

export function useGeneratePhoto(): UseGeneratePhotoResult {
  const { hasEnough, spendCoins, addCoins } = useCoins();
  const { jobs, pendingJobs, createJob, patchJob, isRestoring } = useGenerationJob();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const jobsRef = useRef(jobs);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  const refundIfNeeded = useCallback(async (jobId: string): Promise<boolean> => {
    const targetJob = jobsRef.current.find((job) => job.jobId === jobId);
    if (!targetJob || targetJob.refundedAt || !targetJob.coinCost || targetJob.coinCost <= 0) {
      return false;
    }

    await addCoins(targetJob.coinCost);
    await patchJob(jobId, { refundedAt: new Date().toISOString() });
    return true;
  }, [addCoins, patchJob]);

  const pollJob = useCallback(async (requestId: string, jobId: string, statusUrl?: string, responseUrl?: string): Promise<void> => {
    const job = jobsRef.current.find((j) => j.jobId === jobId);

    // Auto-timeout: if stuck in queue for too long
    if (job && job.status === 'queued') {
      const createdMs = new Date(job.createdAt).getTime();
      if (Date.now() - createdMs > QUEUE_TIMEOUT_MS) {
        try { await cancelImageGeneration(requestId); } catch { /* best effort */ }
        const refunded = await refundIfNeeded(jobId);
        await patchJob(jobId, {
          status: 'failed',
          errorMessage: refunded ? 'Timed out waiting in queue. Coins refunded.' : 'Timed out waiting in queue.',
        });
        return;
      }
    }

    try {
      const statusRes = await getImageStatus(requestId, statusUrl);
      const mappedStatus = mapProviderStatus(statusRes.status);

      if (mappedStatus === 'completed') {
        const result = await getImageResult(requestId, responseUrl);
        const cachedUrl = await cacheRemoteImage(result.imageUrl, jobId);
        await patchJob(jobId, {
          status: 'completed',
          outputUrl: cachedUrl,
          errorMessage: undefined,
          pollFailures: 0,
        });
        return;
      }

      if (mappedStatus === 'failed') {
        const refunded = await refundIfNeeded(jobId);
        await patchJob(jobId, {
          status: 'failed',
          errorMessage: refunded ? 'Generation failed. Coins refunded.' : 'Generation failed.',
        });
        return;
      }

      await patchJob(jobId, { status: mappedStatus, pollFailures: 0 });
    } catch {
      const failures = ((job?.pollFailures) || 0) + 1;
      await patchJob(jobId, { pollFailures: failures });
    }
  }, [patchJob, refundIfNeeded]);

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (isRestoring) return;

    const pendingPhotoJobs = pendingJobs.filter((job) => job.kind === 'photo');
    if (pendingPhotoJobs.length === 0) return;

    const runPoll = () => Promise.all(pendingPhotoJobs.map((job) => pollJob(job.requestId, job.jobId, job.statusUrl, job.responseUrl)));
    void runPoll();

    pollIntervalRef.current = setInterval(() => {
      void runPoll();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isRestoring, pendingJobs, pollJob]);
  const submitPhoto = useCallback(async ({ imageUri, style }: SubmitPhotoInput): Promise<string> => {
    if (!(await hasEnough(style.photoCost))) {
      throw new Error(`Not enough coins. You need ${style.photoCost} coins.`);
    }

    setIsSubmitting(true);
    let coinsSpent = false;

    try {
      const submitted = await submitImageGeneration({
        imageUri,
        prompt: style.prompt,
        stylePreset: style.id,
      });

      const spent = await spendCoins(style.photoCost);
      if (!spent) {
        try {
          await cancelImageGeneration(submitted.requestId);
        } catch {
          // best effort
        }
        throw new Error('Not enough coins. Please top up and try again.');
      }
      coinsSpent = true;

      const job = await createJob({
        requestId: submitted.requestId,
        kind: 'photo',
        styleId: style.id,
        styleTitle: style.title,
        status: 'processing',
        coinCost: style.photoCost,
        statusUrl: submitted.statusUrl,
        responseUrl: submitted.responseUrl,
      });

      await pollJob(submitted.requestId, job.jobId, submitted.statusUrl, submitted.responseUrl);

      return submitted.requestId;
    } catch (error) {
      if (coinsSpent && style.photoCost > 0) {
        await addCoins(style.photoCost);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [addCoins, createJob, hasEnough, pollJob, spendCoins]);

  const cancelPhoto = useCallback(async (requestId: string): Promise<void> => {
    const pendingPhotoJob = pendingJobs.find((job) => job.kind === 'photo' && job.requestId === requestId);
    if (!pendingPhotoJob) return;

    // Only allow cancel during queued (IN_QUEUE), not during processing
    if (pendingPhotoJob.status !== 'queued') return;

    try {
      await cancelImageGeneration(requestId);
    } catch {
      // best effort
    }

    const refunded = await refundIfNeeded(pendingPhotoJob.jobId);
    await patchJob(pendingPhotoJob.jobId, {
      status: 'failed',
      errorMessage: refunded ? 'Cancelled by user. Coins refunded.' : 'Cancelled by user.',
    });
  }, [patchJob, pendingJobs, refundIfNeeded]);

  return {
    isSubmitting,
    submitPhoto,
    cancelPhoto,
  };
}
