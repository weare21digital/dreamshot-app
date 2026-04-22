import { useCallback, useEffect, useRef, useState } from 'react';
import { useCoins } from '../../coins/hooks/useCoins';
import {
  cancelImageGeneration,
  getImageResult,
  getImageStatus,
  submitImageGeneration,
} from '../../profile/services/aiImageProviders';
import { cacheRemoteImage } from '../../../utils/imageCache';
import { ApiError } from '../../../lib/apiClient';
import { DreamshotImageAspect, DreamshotStylePreset } from '../types';
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
  aspect?: DreamshotImageAspect;
};

type UseGeneratePhotoResult = {
  isSubmitting: boolean;
  submitPhoto: (input: SubmitPhotoInput) => Promise<string>;
  cancelPhoto: (requestId: string) => Promise<void>;
};


type PolicyRejectionDetails = {
  category: string;
  code: string;
};

const POLICY_REJECTION_MESSAGE = 'This style or photo was blocked by content policy.';
const OPENAI_IMAGE_STYLES = new Set(['photoreal-pro']);

function parsePolicyRejection(error: unknown): PolicyRejectionDetails | null {
  const apiError = error instanceof ApiError ? error : null;
  const code = (apiError?.code ?? '').toString();
  const message = (apiError?.message ?? (typeof error === 'string' ? error : (error instanceof Error ? error.message : ''))).toString();
  const combined = `${code} ${message}`.toLowerCase();

  const matched =
    combined.includes('content policy') ||
    combined.includes('content_policy') ||
    combined.includes('moderation') ||
    combined.includes('safety') ||
    combined.includes('policy_violation') ||
    combined.includes('blocked_prompt');

  if (!matched) return null;

  const category =
    (message.match(/category[:=]\s*([a-z0-9_.-]+)/i)?.[1] ||
      code.match(/(?:content[_-]?policy|moderation|safety)[._-]?([a-z0-9_-]+)/i)?.[1] ||
      'unknown')
      .toLowerCase();

  return { category, code: code || 'UNKNOWN_POLICY_REJECTION' };
}

const getBalanceFromError = (error: unknown): number | undefined => {
  if (!(error instanceof ApiError) || !error.details || typeof error.details !== 'object') return undefined;
  const details = error.details as { balance?: unknown; error?: { balance?: unknown } };
  const value = typeof details.balance === 'number' ? details.balance : details.error?.balance;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

export function useGeneratePhoto(): UseGeneratePhotoResult {
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
        try { await cancelImageGeneration(requestId); } catch { /* best effort */ }
        await patchJob(jobId, {
          status: 'failed',
          errorMessage: 'Timed out waiting in queue.',
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
        const rejectionCategory = statusRes.rejectionCategory || statusRes.errorCode || statusRes.errorMessage || 'unknown';
        const policyRejected = parsePolicyRejection(statusRes.errorCode || statusRes.errorMessage) != null;

        if (policyRejected) {
          console.info('[DreamShotTelemetry] image_policy_rejection', {
            requestId,
            jobId,
            rejectionCategory,
          });
        }

        await patchJob(jobId, {
          status: 'failed',
          errorMessage: policyRejected
            ? POLICY_REJECTION_MESSAGE
            : 'Generation failed.',
        });
        return;
      }

      await patchJob(jobId, { status: mappedStatus, pollFailures: 0 });
    } catch (error) {
      const policyRejection = parsePolicyRejection(error);
      if (policyRejection) {
        console.info('[DreamShotTelemetry] image_policy_rejection', {
          requestId,
          jobId,
          rejectionCategory: policyRejection.category,
          errorCode: policyRejection.code,
        });

        await patchJob(jobId, {
          status: 'failed',
          errorMessage: POLICY_REJECTION_MESSAGE,
          pollFailures: 0,
        });
        return;
      }

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
  const submitPhoto = useCallback(async ({ imageUri, style, aspect }: SubmitPhotoInput): Promise<string> => {
    setIsSubmitting(true);

    try {
      const pipelineId = OPENAI_IMAGE_STYLES.has(style.id) ? 'openai-image' : 'fal-image';

      const submitted = await submitImageGeneration({
        imageUri,
        prompt: style.prompt,
        stylePreset: style.id,
        aspect,
        quality: style.imageQuality ?? 'medium',
        pipelineId,
      });

      await applyServerBalance(submitted.balance);

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
      if (error instanceof ApiError && error.status === 402) {
        await applyServerBalance(getBalanceFromError(error));
        throw new Error('Insufficient coins. Please top up and try again.');
      }

      const policyRejection = parsePolicyRejection(error);
      if (policyRejection) {
        console.info('[DreamShotTelemetry] image_policy_rejection', {
          styleId: style.id,
          styleTitle: style.title,
          rejectionCategory: policyRejection.category,
          errorCode: policyRejection.code,
          phase: 'submit',
        });

        throw new Error(POLICY_REJECTION_MESSAGE);
      }

      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [applyServerBalance, createJob, pollJob]);

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

    await patchJob(pendingPhotoJob.jobId, {
      status: 'failed',
      errorMessage: 'Cancelled by user.',
    });
  }, [patchJob, pendingJobs]);

  return {
    isSubmitting,
    submitPhoto,
    cancelPhoto,
  };
}
