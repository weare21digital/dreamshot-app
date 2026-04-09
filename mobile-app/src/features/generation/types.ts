export type DreamshotGenerationKind = 'photo' | 'video';
export type DreamshotImageAspect = '16:9' | '1:1' | '9:16';
export type DreamshotImageQuality = 'low' | 'medium' | 'high' | 'auto';

export interface DreamshotStylePreset {
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
  imageQuality?: DreamshotImageQuality;
}

export interface DreamshotGenerationResult {
  id: string;
  kind: DreamshotGenerationKind;
  styleId: string;
  mediaUrl: string;
  createdAt: string;
}

export interface DreamshotGenerationJob {
  jobId: string;
  requestId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  kind: DreamshotGenerationKind;
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
