import { useCallback, useEffect, useState } from 'react';
import { useCoins } from '../../coins/hooks/useCoins';
import {
  cancelImageGeneration,
  getImageResult,
  getImageStatus,
  submitImageGeneration,
} from '../../profile/services/aiImageProviders';
import { cacheRemoteImage } from '../../../utils/imageCache';
import { RoyalStylePreset } from '../types';
import { useGenerationJob } from './useGenerationJob';

const POLL_INTERVAL_MS = 5000;
const QUEUE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const MAX_POLL_FAILURES = 3;

const mapProviderStatus = (status: string): 'queued' | 'processing' | 'completed' | 'failed' => {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'FAILED' || status === 'CANCELED') return 'failed';
  if (status === 'IN_PROGRESS') return 'processing';
  return 'queued';
};

type SubmitPhotoInput = {
  imageUri: string;
  style: RoyalStylePreset;
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

  const refundIfNeeded = useCallback(async (jobId: string): Promise<boolean> => {
    const targetJob = jobs.find((job) => job.jobId === jobId);
    if (!targetJob || targetJob.refundedAt || !targetJob.coinCost || targetJob.coinCost <= 0) {
      return false;
    }

    await addCoins(targetJob.coinCost);
    await patchJob(jobId, { refundedAt: new Date().toISOString() });
    return true;
  }, [addCoins, jobs, patchJob]);

  const pollJob = useCallback(async (requestId: string, jobId: string, statusUrl?: string, responseUrl?: string): Promise<void> => {
    const job = jobs.find((j) => j.jobId === jobId);

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
    } catch (error) {
      const failures = ((job?.pollFailures) || 0) + 1;
      if (failures >= MAX_POLL_FAILURES) {
        const refunded = await refundIfNeeded(jobId);
        await patchJob(jobId, {
          status: 'failed',
          pollFailures: failures,
          errorMessage: refunded
            ? (error instanceof Error ? error.message : 'Unable to fetch status.') + ' Coins refunded.'
            : (error instanceof Error ? error.message : 'Unable to fetch status.'),
        });
      } else {
        await patchJob(jobId, { pollFailures: failures });
      }
    }
  }, [jobs, patchJob, refundIfNeeded]);

  useEffect(() => {
    if (isRestoring) return;
    const pendingPhotoJobs = pendingJobs.filter((job) => job.kind === 'photo');
    if (pendingPhotoJobs.length === 0) return;

    void Promise.all(pendingPhotoJobs.map((job) => pollJob(job.requestId, job.jobId, job.statusUrl, job.responseUrl)));

    const interval = setInterval(() => {
      void Promise.all(pendingPhotoJobs.map((job) => pollJob(job.requestId, job.jobId, job.statusUrl, job.responseUrl)));
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isRestoring, pendingJobs, pollJob]);

  const submitPhoto = useCallback(async ({ imageUri, style }: SubmitPhotoInput): Promise<string> => {
    if (!(await hasEnough(style.photoCost))) {
      throw new Error(`Not enough coins. You need ${style.photoCost} coins.`);
    }

    setIsSubmitting(true);
    let coinsSpent = false;

    try {
      const spent = await spendCoins(style.photoCost);
      if (!spent) {
        throw new Error('Not enough coins. Please top up and try again.');
      }
      coinsSpent = true;

      const submitted = await submitImageGeneration({
        imageUri,
        prompt: style.prompt,
        stylePreset: style.id,
      });

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
