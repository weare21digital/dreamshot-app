import { useCallback, useEffect, useRef, useState } from 'react';
import { useCoins } from '../../coins/hooks/useCoins';
import {
  cancelVideoGeneration,
  getVideoGenerationResult,
  getVideoGenerationStatus,
  submitVideoGeneration,
} from '../../profile/services/aiVideoProviders';
import { cacheRemoteImage } from '../../../utils/imageCache';
import { ApiError } from '../../../lib/apiClient';
import { ANIMATION_STYLES } from '../../../config/styles';import { DreamshotStylePreset } from '../types';
import { useGenerationJob } from './useGenerationJob';

const POLL_INTERVAL_MS = 5000;
const QUEUE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

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

const getBalanceFromError = (error: unknown): number | undefined => {
  if (!(error instanceof ApiError) || !error.details || typeof error.details !== 'object') return undefined;
  const details = error.details as { balance?: unknown; error?: { balance?: unknown } };
  const value = typeof details.balance === 'number' ? details.balance : details.error?.balance;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

export function useGenerateVideo(): UseGenerateVideoResult {
  const { applyServerBalance } = useCoins();
  const { jobs, pendingJobs, createJob, patchJob, isRestoring } = useGenerationJob();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const jobsRef = useRef(jobs);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);


  const pollJob = useCallback(async (requestId: string, jobId: string, statusUrl?: string, responseUrl?: string): Promise<void> => {
    const job = jobsRef.current.find((j) => j.jobId === jobId);

    // Auto-timeout: if stuck in queue for too long
    if (job && job.status === 'queued') {
      const createdMs = new Date(job.createdAt).getTime();
      if (Date.now() - createdMs > QUEUE_TIMEOUT_MS) {
        try { await cancelVideoGeneration(requestId); } catch { /* best effort */ }
        await patchJob(jobId, {
          status: 'failed',
          errorMessage: 'Timed out waiting in queue.',
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
        await patchJob(jobId, {
          status: 'failed',
          errorMessage: 'Generation failed.',
        });
        return;
      }

      await patchJob(jobId, { status: mappedStatus, pollFailures: 0 });
    } catch {
      const failures = ((job?.pollFailures) || 0) + 1;
      await patchJob(jobId, { pollFailures: failures });
    }
  }, [patchJob]);

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
    setIsSubmitting(true);

    try {

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

      await applyServerBalance(submitted.balance);
      await pollJob(submitted.requestId, job.jobId, submitted.statusUrl, submitted.responseUrl);

      return submitted.requestId;
    } catch (error) {
      if (error instanceof ApiError && error.status === 402) {
        await applyServerBalance(getBalanceFromError(error));
        throw new Error('Insufficient coins. Please top up and try again.');
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [applyServerBalance, createJob, pollJob]);

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

    await patchJob(pendingVideoJob.jobId, {
      status: 'failed',
      errorMessage: 'Cancelled by user.',
    });
  }, [patchJob, pendingJobs]);

  return {
    isSubmitting,
    submitVideo,
    cancelVideo,
  };
}
