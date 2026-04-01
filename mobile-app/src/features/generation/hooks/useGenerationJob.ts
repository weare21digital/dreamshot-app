import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DreamshotGenerationJob, DreamshotGenerationKind } from '../types';
import { cacheRemoteImage } from '../../../utils/imageCache';

const STORAGE_KEY = 'dreamshot_gallery_items';
const ARCHIVE_KEY = '@dreamshot/generation-jobs-archive';
const ARCHIVE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type GenerationJobStatus = DreamshotGenerationJob['status'];

type CreateJobInput = {
  requestId: string;
  kind: DreamshotGenerationKind;
  styleId: string;
  styleTitle?: string;
  status?: GenerationJobStatus;
  coinCost?: number;
  statusUrl?: string;
  responseUrl?: string;
};

type PatchJobInput = {
  status?: GenerationJobStatus;
  outputUrl?: string;
  errorMessage?: string;
  refundedAt?: string;
  pollFailures?: number;
};

type UseGenerationJobResult = {
  jobs: DreamshotGenerationJob[];
  archivedJobs: DreamshotGenerationJob[];
  isRestoring: boolean;
  createJob: (input: CreateJobInput) => Promise<DreamshotGenerationJob>;
  patchJob: (jobId: string, patch: PatchJobInput) => Promise<DreamshotGenerationJob | undefined>;
  removeJob: (jobId: string) => Promise<void>;
  archiveJob: (jobId: string) => Promise<void>;
  restoreJob: (jobId: string) => Promise<void>;
  pendingJobs: DreamshotGenerationJob[];
  latestJob?: DreamshotGenerationJob;
};

function isValidStatus(status: unknown): status is GenerationJobStatus {
  return status === 'queued' || status === 'processing' || status === 'completed' || status === 'failed';
}

function normalizeStoredJobs(raw: string | null): DreamshotGenerationJob[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is DreamshotGenerationJob => {
        if (!item || typeof item !== 'object') return false;
        const job = item as DreamshotGenerationJob;

        return (
          typeof job.jobId === 'string' &&
          typeof job.requestId === 'string' &&
          typeof job.styleId === 'string' &&
          (job.kind === 'photo' || job.kind === 'video') &&
          isValidStatus(job.status) &&
          typeof job.createdAt === 'string' &&
          typeof job.updatedAt === 'string'
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

let storeJobs: DreamshotGenerationJob[] = [];
let storeArchive: DreamshotGenerationJob[] = [];
let storeIsRestoring = true;
let restorePromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

async function persist(nextJobs: DreamshotGenerationJob[]): Promise<void> {
  storeJobs = nextJobs;
  notify();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextJobs));
}

async function persistArchive(nextArchive: DreamshotGenerationJob[]): Promise<void> {
  storeArchive = nextArchive;
  notify();
  await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(nextArchive));
}

/** Purge archived items older than 7 days */
function purgeExpiredArchive(archive: DreamshotGenerationJob[]): DreamshotGenerationJob[] {
  const now = Date.now();
  return archive.filter((job) => {
    if (!job.archivedAt) return false;
    return now - new Date(job.archivedAt).getTime() < ARCHIVE_TTL_MS;
  });
}

/** Cache any remote outputUrls to local files (background, non-blocking) */
async function cacheRemoteOutputUrls(): Promise<void> {
  let changed = false;
  const updated = await Promise.all(
    storeJobs.map(async (job) => {
      if (job.outputUrl && job.outputUrl.startsWith('http')) {
        const cached = await cacheRemoteImage(job.outputUrl, job.jobId);
        if (cached !== job.outputUrl) {
          changed = true;
          return { ...job, outputUrl: cached };
        }
      }
      return job;
    }),
  );
  if (changed) {
    await persist(updated);
  }
}

async function ensureRestored(): Promise<void> {
  if (!storeIsRestoring) return;
  if (restorePromise) {
    await restorePromise;
    return;
  }

  restorePromise = (async () => {
    try {
      const [stored, storedArchive] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(ARCHIVE_KEY),
      ]);
      storeJobs = normalizeStoredJobs(stored);
      const rawArchive = normalizeStoredJobs(storedArchive);
      const purged = purgeExpiredArchive(rawArchive);
      storeArchive = purged;
      // Persist purge if items were removed
      if (purged.length !== rawArchive.length) {
        await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(purged));
      }
    } catch {
      storeJobs = [];
      storeArchive = [];
    } finally {
      storeIsRestoring = false;
      notify();
      restorePromise = null;
    }

    // Background: cache any remote outputUrls to local files
    void cacheRemoteOutputUrls();
  })();

  await restorePromise;
}

export function useGenerationJob(): UseGenerationJobResult {
  const [jobs, setJobs] = useState<DreamshotGenerationJob[]>(storeJobs);
  const [archivedJobs, setArchivedJobs] = useState<DreamshotGenerationJob[]>(storeArchive);
  const [isRestoring, setIsRestoring] = useState(storeIsRestoring);

  useEffect(() => {
    const listener = (): void => {
      setJobs(storeJobs);
      setArchivedJobs(storeArchive);
      setIsRestoring(storeIsRestoring);
    };

    listeners.add(listener);
    void ensureRestored();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const createJob = useCallback(async ({ requestId, kind, styleId, styleTitle, status = 'queued', coinCost, statusUrl, responseUrl }: CreateJobInput): Promise<DreamshotGenerationJob> => {
    await ensureRestored();

    const nowIso = new Date().toISOString();
    const job: DreamshotGenerationJob = {
      jobId: `${kind}-${requestId}`,
      requestId,
      status,
      kind,
      styleId,
      styleTitle,
      coinCost,
      statusUrl,
      responseUrl,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await persist([job, ...storeJobs]);
    return job;
  }, []);

  const patchJob = useCallback(async (jobId: string, patch: PatchJobInput): Promise<DreamshotGenerationJob | undefined> => {
    await ensureRestored();

    let updatedJob: DreamshotGenerationJob | undefined;

    const nextJobs = storeJobs.map((job) => {
      if (job.jobId !== jobId) return job;
      updatedJob = {
        ...job,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      return updatedJob;
    });

    if (!updatedJob) {
      return undefined;
    }

    await persist(nextJobs);
    return updatedJob;
  }, []);

  const removeJob = useCallback(async (jobId: string): Promise<void> => {
    await ensureRestored();
    const next = storeJobs.filter((job) => job.jobId !== jobId);
    await persist(next);
  }, []);

  const archiveJob = useCallback(async (jobId: string): Promise<void> => {
    await ensureRestored();
    const job = storeJobs.find((j) => j.jobId === jobId);
    if (!job) return;
    const archivedJob: DreamshotGenerationJob = { ...job, archivedAt: new Date().toISOString() };
    await persist(storeJobs.filter((j) => j.jobId !== jobId));
    await persistArchive([archivedJob, ...storeArchive]);
  }, []);

  const restoreJob = useCallback(async (jobId: string): Promise<void> => {
    await ensureRestored();
    const job = storeArchive.find((j) => j.jobId === jobId);
    if (!job) return;
    const restoredJob: DreamshotGenerationJob = { ...job, archivedAt: undefined };
    await persistArchive(storeArchive.filter((j) => j.jobId !== jobId));
    await persist([restoredJob, ...storeJobs]);
  }, []);

  const pendingJobs = useMemo(
    () => jobs.filter((job) => job.status === 'queued' || job.status === 'processing'),
    [jobs]
  );

  return {
    jobs,
    archivedJobs,
    isRestoring,
    createJob,
    patchJob,
    removeJob,
    archiveJob,
    restoreJob,
    pendingJobs,
    latestJob: jobs[0],
  };
}
