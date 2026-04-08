import { useCallback, useEffect, useRef, useState } from 'react';
import { useCoins } from '../../coins/hooks/useCoins';
import {
  cancelVideoGeneration,
  getVideoGenerationResult,
  getVideoGenerationStatus,
  submitVideoGeneration,
} from '../../profile/services/aiVideoProviders';
import { cacheRemoteImage } from '../../../utils/imageCache';
import { ANIMATION_STYLES } from '../../../config/styles';
import { DreamshotStylePreset } from '../types';
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

type SubmitVideoInput = {
  imageUri: string;
  style: DreamshotStylePreset;
  animStyleId?: string;
};

type UseGenerateVideoResult = {
  isSubmitting: boolean;
  submitVideo: (input: SubmitVideoInput) => Promise<string>;
  cancelVideo: (requestId: string) => Promise<void>;
};

export function useGenerateVideo(): UseGenerateVideoResult {
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
        try { await cancelVideoGeneration(requestId); } catch { /* best effort */ }
        const refunded = await refundIfNeeded(jobId);
        await patchJob(jobId, {
          status: 'failed',
          errorMessage: refunded ? 'Timed out waiting in queue. Coins refunded.' : 'Timed out waiting in queue.',
        });
        return;
      }
    }

    try {
      const statusRes = await getVideoGenerationStatus(requestId, statusUrl);
      const mappedStatus = mapProviderStatus(statusRes.status);

      if (mappedStatus === 'completed') {
        const result = await getVideoGenerationResult(requestId, responseUrl);
        const cachedUrl = await cacheRemoteImage(result.videoUrl, jobId);
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
  }, [patchJob, refundIfNeeded]);

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (isRestoring) return;

    const pendingVideoJobs = pendingJobs.filter((job) => job.kind === 'video');
    if (pendingVideoJobs.length === 0) return;

    const runPoll = () => Promise.all(pendingVideoJobs.map((job) => pollJob(job.requestId, job.jobId, job.statusUrl, job.responseUrl)));
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
  const submitVideo = useCallback(async ({ imageUri, style, animStyleId }: SubmitVideoInput): Promise<string> => {
    if (!(await hasEnough(style.videoCost))) {
      throw new Error(`Not enough coins. You need ${style.videoCost} coins.`);
    }

    setIsSubmitting(true);
    let coinsSpent = false;

    try {
      const spent = await spendCoins(style.videoCost);
      if (!spent) {
        throw new Error('Not enough coins. Please top up and try again.');
      }
      coinsSpent = true;

      const animStyle = animStyleId ? ANIMATION_STYLES.find((a) => a.id === animStyleId) : undefined;
      const themePrefix = `DreamShot image animation comes to life, cinematic atmosphere.`;
      const basePrompt = animStyle
        ? `${style.animationPrompt}. ${animStyle.promptSuffix}`
        : style.animationPrompt;
      const videoPrompt = `${themePrefix} ${basePrompt}. Maintain the painted image aesthetic and rich colors throughout the motion.`;

      const submitted = await submitVideoGeneration({ imageUri, prompt: videoPrompt });

      const job = await createJob({
        requestId: submitted.requestId,
        kind: 'video',
        styleId: style.id,
        styleTitle: style.title,
        status: 'processing',
        coinCost: style.videoCost,
        statusUrl: submitted.statusUrl,
        responseUrl: submitted.responseUrl,
      });

      await pollJob(submitted.requestId, job.jobId, submitted.statusUrl, submitted.responseUrl);

      return submitted.requestId;
    } catch (error) {
      if (coinsSpent && style.videoCost > 0) {
        await addCoins(style.videoCost);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [addCoins, createJob, hasEnough, pollJob, spendCoins]);

  const cancelVideo = useCallback(async (requestId: string): Promise<void> => {
    const pendingVideoJob = pendingJobs.find((job) => job.kind === 'video' && job.requestId === requestId);
    if (!pendingVideoJob) return;

    // Only allow cancel during queued (IN_QUEUE), not during processing (IN_PROGRESS)
    if (pendingVideoJob.status !== 'queued') return;

    try {
      await cancelVideoGeneration(requestId);
    } catch {
      // best effort
    }

    const refunded = await refundIfNeeded(pendingVideoJob.jobId);
    await patchJob(pendingVideoJob.jobId, {
      status: 'failed',
      errorMessage: refunded ? 'Cancelled by user. Coins refunded.' : 'Cancelled by user.',
    });
  }, [patchJob, pendingJobs, refundIfNeeded]);

  return {
    isSubmitting,
    submitVideo,
    cancelVideo,
  };
}
