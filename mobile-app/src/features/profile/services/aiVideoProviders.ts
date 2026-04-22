import * as FileSystem from 'expo-file-system/legacy';
import { apiClient } from '../../../lib/apiClient';

export type AiVideoProviderName = 'backend';

export type VideoGenerationRequest = {
  imageUri: string;
  prompt: string;
};

export type VideoGenerationSubmitResult = {
  requestId: string;
  status: string;
  statusUrl?: string;
  responseUrl?: string;
  cancelUrl?: string;
  balance?: number;
  ledgerVersion?: number;
};

export type VideoGenerationStatusResult = {
  status: string;
  outputUrl?: string;
};

export type VideoGenerationResult = {
  videoUrl: string;
};

const getMimeType = (imageUri: string): string => {
  const normalized = imageUri.toLowerCase();
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const toDataUri = async (imageUri: string): Promise<string> => {
  let localUri = imageUri;

  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    const ext = localUri.includes('.png') ? 'png' : 'jpg';
    const localPath = `${FileSystem.cacheDirectory}pipeline-input-${Date.now()}.${ext}`;
    const download = await FileSystem.downloadAsync(localUri, localPath);
    localUri = download.uri;
  }

  const mimeType = getMimeType(localUri);
  const imageBase64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return `data:${mimeType};base64,${imageBase64}`;
};

export type ImagePipelineVideoRequest = {
  imageUri: string;
  prompt: string;
  videoPrompt: string;
  stylePreset?: string;
};

export type ImagePipelineVideoSubmitResult = VideoGenerationSubmitResult & {
  imageUrl?: string;
};

/** Pipeline: OpenAI image → Wan video (backend handles both steps) */
export const submitImagePipelineVideoGeneration = async (
  request: ImagePipelineVideoRequest,
): Promise<ImagePipelineVideoSubmitResult> => {
  const inputImageUrl = await toDataUri(request.imageUri);

  const response = await apiClient.post('/generations/fal', {
    prompt: request.videoPrompt || request.prompt,
    pipelineId: 'openai-to-video',
    stylePreset: request.stylePreset,
    inputImageUrl,
  }) as { id: string; status: string; balance?: number; ledgerVersion?: number };

  return {
    requestId: response.id,
    status: response.status || 'QUEUED',
    balance: response.balance,
    ledgerVersion: response.ledgerVersion,
  };
};

// Backward-compatible aliases for in-flight callers during the rebrand transition.
export type DreamshotImagePipelineRequest = ImagePipelineVideoRequest;
export type DreamshotImagePipelineSubmitResult = VideoGenerationSubmitResult & {
  imageUrl?: string;
};

export const submitDreamshotImagePipeline = async (request: DreamshotImagePipelineRequest): Promise<DreamshotImagePipelineSubmitResult> => {
  const data = await submitImagePipelineVideoGeneration(request);
  return {
    ...data,
    imageUrl: data.imageUrl,
  };
};

/** Direct video from existing image (gallery animate flow) */
export const submitVideoGeneration = async (request: VideoGenerationRequest): Promise<VideoGenerationSubmitResult> => {
  const inputImageUrl = await toDataUri(request.imageUri);

  const response = await apiClient.post('/generations/fal', {
    prompt: request.prompt,
    pipelineId: 'openai-to-video',
    inputImageUrl,
  }) as { id: string; status: string; balance?: number; ledgerVersion?: number };

  return {
    requestId: response.id,
    status: response.status || 'QUEUED',
    balance: response.balance,
    ledgerVersion: response.ledgerVersion,
  };
};

export const getVideoGenerationStatus = async (requestId: string, _statusUrl?: string): Promise<VideoGenerationStatusResult> => {
  const response = await apiClient.get(`/generations/${requestId}`) as { status: string; outputUrl?: string };
  return { status: response.status, outputUrl: response.outputUrl };
};

export const getVideoGenerationResult = async (requestId: string, _responseUrl?: string): Promise<VideoGenerationResult> => {
  const response = await apiClient.get(`/generations/${requestId}`) as { outputUrl?: string };
  if (!response.outputUrl) {
    throw new Error('Generation is not complete yet');
  }
  return { videoUrl: response.outputUrl };
};

export const cancelVideoGeneration = async (_requestId: string): Promise<{ cancelled: boolean }> => {
  return { cancelled: false };
};

export const aiVideoProvidersRegistry = {} as Record<string, unknown>;
