import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCoins } from '../../coins/hooks/useCoins';
import {
  cancelVideoGeneration,
  getVideoGenerationResult,
  getVideoGenerationStatus,
  submitVideoGeneration,
} from '../services/aiVideoProviders';

const VIDEO_JOBS_STORAGE_KEY = '@ai-video/jobs';
const POLL_INTERVAL_MS = 4000;
const QUEUE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const MAX_POLL_FAILURES = 3;

export type VideoJobLocalStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export type VideoDanceStyle = {
  id: string;
  label: string;
  prompt: string;
  icon: string;
};

export type VideoGenerationJob = {
  requestId: string;
  status: VideoJobLocalStatus;
  providerStatus: string;
  photoUri: string;
  danceStyleId: string;
  danceStyleLabel: string;
  prompt: string;
  coinsCost: number;
  coinsCharged: boolean;
  refunded: boolean;
  createdAt: number;
  updatedAt: number;
  error?: string;
  videoUrl?: string;
  pollFailures?: number;
  statusUrl?: string;
  responseUrl?: string;
};

type SubmitInput = {
  imageUri: string;
  danceStyle: VideoDanceStyle;
  coinsCost: number;
};

type UseVideoGenerationResult = {
  jobs: VideoGenerationJob[];
  isRestoring: boolean;
  isSubmitting: boolean;
  submit: (input: SubmitInput) => Promise<void>;
  cancel: (requestId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  hasPendingJobs: boolean;
  latestJob?: VideoGenerationJob;
};

const parseStoredJobs = (raw: string | null): VideoGenerationJob[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is VideoGenerationJob => {
      return !!item && typeof item === 'object' && 'requestId' in item && 'status' in item;
    });
  } catch {
    return [];
  }
};

export function useVideoGeneration(): UseVideoGenerationResult {
  const { hasEnough, spendCoins, addCoins } = useCoins();
  const [jobs, setJobs] = useState<VideoGenerationJob[]>([]);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const jobsRef = useRef<VideoGenerationJob[]>([]);

  const persistJobs = useCallback(async (nextJobs: VideoGenerationJob[]): Promise<void> => {
    jobsRef.current = nextJobs;
    setJobs(nextJobs);
    await AsyncStorage.setItem(VIDEO_JOBS_STORAGE_KEY, JSON.stringify(nextJobs));
  }, []);

  const updateJob = useCallback(async (requestId: string, updater: (job: VideoGenerationJob) => VideoGenerationJob): Promise<void> => {
    const next = jobsRef.current.map((job) => (job.requestId === requestId ? updater(job) : job));
    await persistJobs(next);
  }, [persistJobs]);

  const markFailureAndRefundIfNeeded = useCallback(async (requestId: string, errorMessage: string): Promise<void> => {
    const current = jobsRef.current.find((job) => job.requestId === requestId);
    if (!current) return;

    let refunded = current.refunded;
    if (current.coinsCharged && !current.refunded && current.coinsCost > 0) {
      await addCoins(current.coinsCost);
      refunded = true;
    }

    await updateJob(requestId, (job) => ({
      ...job,
      status: 'failed',
      providerStatus: 'FAILED',
      refunded,
      updatedAt: Date.now(),
      error: errorMessage,
    }));
  }, [addCoins, updateJob]);

  const cancelJob = useCallback(async (requestId: string): Promise<void> => {
    const job = jobsRef.current.find((j) => j.requestId === requestId);
    if (!job || (job.status !== 'pending' && job.status !== 'in_progress')) return;

    try {
      await cancelVideoGeneration(requestId);
    } catch {
      // Best effort cancel
    }

    await markFailureAndRefundIfNeeded(requestId, 'Cancelled by user.');
  }, [markFailureAndRefundIfNeeded]);

  const pollOneJob = useCallback(async (job: VideoGenerationJob): Promise<void> => {
    if (job.status !== 'pending' && job.status !== 'in_progress') return;

    // Auto-timeout: cancel if stuck in queue for too long
    if (job.status === 'pending' && (Date.now() - job.createdAt) > QUEUE_TIMEOUT_MS) {
      try {
        await cancelVideoGeneration(job.requestId);
      } catch {
        // Best effort
      }
      await markFailureAndRefundIfNeeded(job.requestId, 'Timed out waiting in queue. Coins refunded.');
      return;
    }

    try {
      const statusResult = await getVideoGenerationStatus(job.requestId, job.statusUrl);
      const providerStatus = statusResult.status;

      if (providerStatus === 'COMPLETED') {
        const result = await getVideoGenerationResult(job.requestId, job.responseUrl);
        await updateJob(job.requestId, (current) => ({
          ...current,
          status: 'completed',
          providerStatus,
          updatedAt: Date.now(),
          videoUrl: result.videoUrl,
          error: undefined,
        }));
        return;
      }

      if (providerStatus === 'FAILED' || providerStatus === 'CANCELED') {
        await markFailureAndRefundIfNeeded(job.requestId, `Generation ${providerStatus.toLowerCase()}.`);
        return;
      }

      await updateJob(job.requestId, (current) => ({
        ...current,
        status: providerStatus === 'IN_PROGRESS' ? 'in_progress' : 'pending',
        providerStatus,
        updatedAt: Date.now(),
      }));
    } catch (error) {
      const failures = (job.pollFailures || 0) + 1;
      if (failures >= MAX_POLL_FAILURES) {
        await markFailureAndRefundIfNeeded(
          job.requestId,
          error instanceof Error ? error.message : 'Unable to fetch generation status.'
        );
      } else {
        await updateJob(job.requestId, (current) => ({
          ...current,
          pollFailures: failures,
          updatedAt: Date.now(),
        }));
      }
    }
  }, [markFailureAndRefundIfNeeded, updateJob]);

  const pollPendingJobs = useCallback(async (): Promise<void> => {
    const pending = jobsRef.current.filter((job) => job.status === 'pending' || job.status === 'in_progress');
    if (pending.length === 0) return;

    await Promise.all(pending.map((job) => pollOneJob(job)));
  }, [pollOneJob]);

  useEffect(() => {
    let mounted = true;

    const restore = async (): Promise<void> => {
      const stored = await AsyncStorage.getItem(VIDEO_JOBS_STORAGE_KEY);
      const parsed = parseStoredJobs(stored).sort((a, b) => b.createdAt - a.createdAt);
      if (!mounted) return;

      // Expire any pending/in_progress jobs that are stale (>10min) or missing statusUrl (pre-fix jobs)
      const now = Date.now();
      const cleaned = parsed.map((job) => {
        if ((job.status === 'pending' || job.status === 'in_progress') && 
            ((now - job.createdAt) > 10 * 60 * 1000 || !job.statusUrl)) {
          return { ...job, status: 'failed' as VideoJobLocalStatus, error: 'Expired on restart.', updatedAt: now };
        }
        return job;
      });

      jobsRef.current = cleaned;
      setJobs(cleaned);
      await AsyncStorage.setItem(VIDEO_JOBS_STORAGE_KEY, JSON.stringify(cleaned));
      setIsRestoring(false);
    };

    restore().catch(() => {
      if (!mounted) return;
      jobsRef.current = [];
      setJobs([]);
      setIsRestoring(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isRestoring) return;

    void pollPendingJobs();

    const intervalId = setInterval(() => {
      void pollPendingJobs();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isRestoring, pollPendingJobs]);

  const submit = useCallback(async ({ imageUri, danceStyle, coinsCost }: SubmitInput): Promise<void> => {
    if (!(await hasEnough(coinsCost))) {
      throw new Error(`Not enough coins. You need ${coinsCost} coins.`);
    }

    setIsSubmitting(true);
    let coinsSpent = false;

    try {
      const spent = await spendCoins(coinsCost);
      if (!spent) {
        throw new Error('Not enough coins. Please top up and try again.');
      }
      coinsSpent = true;

      const submitted = await submitVideoGeneration({
        imageUri,
        prompt: danceStyle.prompt,
      });

      const now = Date.now();
      const newJob: VideoGenerationJob = {
        requestId: submitted.requestId,
        status: submitted.status === 'IN_PROGRESS' ? 'in_progress' : 'pending',
        providerStatus: submitted.status,
        photoUri: imageUri,
        danceStyleId: danceStyle.id,
        danceStyleLabel: danceStyle.label,
        prompt: danceStyle.prompt,
        coinsCost,
        coinsCharged: true,
        refunded: false,
        createdAt: now,
        updatedAt: now,
        statusUrl: submitted.statusUrl,
        responseUrl: submitted.responseUrl,
      };

      await persistJobs([newJob, ...jobsRef.current]);
      await pollOneJob(newJob);
    } catch (error) {
      if (coinsSpent && coinsCost > 0) {
        await addCoins(coinsCost);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [addCoins, hasEnough, persistJobs, pollOneJob, spendCoins]);

  const clearHistory = useCallback(async (): Promise<void> => {
    await AsyncStorage.removeItem(VIDEO_JOBS_STORAGE_KEY);
    jobsRef.current = [];
    setJobs([]);
  }, []);

  const hasPendingJobs = useMemo(
    () => jobs.some((job) => job.status === 'pending' || job.status === 'in_progress'),
    [jobs]
  );

  return {
    jobs,
    isRestoring,
    isSubmitting,
    submit,
    cancel: cancelJob,
    clearHistory,
    hasPendingJobs,
    latestJob: jobs[0],
  };
}
