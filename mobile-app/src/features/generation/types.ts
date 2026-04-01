export type RoyalGenerationKind = 'photo' | 'video';

export interface RoyalStylePreset {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  prompt: string;
  animationPrompt: string;
  exampleImageUrl: string;
  photoCost: number;
  videoCost: number;
  tags: string[];
}

export interface RoyalGenerationResult {
  id: string;
  kind: RoyalGenerationKind;
  styleId: string;
  mediaUrl: string;
  createdAt: string;
}

export interface RoyalGenerationJob {
  jobId: string;
  requestId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  kind: RoyalGenerationKind;
  styleId: string;
  styleTitle?: string;
  createdAt: string;
  updatedAt: string;
  outputUrl?: string;
  errorMessage?: string;
  coinCost?: number;
  refundedAt?: string;
  statusUrl?: string;
  responseUrl?: string;
  pollFailures?: number;
  archivedAt?: string;
}
