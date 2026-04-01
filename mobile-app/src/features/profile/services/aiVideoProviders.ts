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
};

export type VideoGenerationStatusResult = {
  status: string;
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

export type ImagePipelineVideoRequest = {
  imageUri: string;
  prompt: string;
  videoPrompt: string;
  stylePreset?: string;
};

export type ImagePipelineVideoSubmitResult = VideoGenerationSubmitResult & {
  imageUrl?: string;
};

/** Pipeline: PuLID image generation → Wan video (backend handles both steps) */
export const submitImagePipelineVideoGeneration = async (
  request: ImagePipelineVideoRequest,
): Promise<ImagePipelineVideoSubmitResult> => {
  let localUri = request.imageUri;

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

  const response = await apiClient.post('/ai/video/image-pipeline', {
    imageBase64,
    prompt: request.prompt,
    videoPrompt: request.videoPrompt,
    mimeType,
    stylePreset: request.stylePreset,
  });

  const data = response as unknown as ImagePipelineVideoSubmitResult;

  return {
    requestId: data.requestId,
    status: data.status || 'IN_QUEUE',
    statusUrl: data.statusUrl,
    responseUrl: data.responseUrl,
    imageUrl: data.imageUrl,
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
  let localUri = request.imageUri;

  // If it's a remote URL, download to a local cache file first
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    const ext = localUri.includes('.png') ? 'png' : 'jpg';
    const localPath = `${FileSystem.cacheDirectory}video-input-${Date.now()}.${ext}`;
    const download = await FileSystem.downloadAsync(localUri, localPath);
    localUri = download.uri;
  }

  const mimeType = getMimeType(localUri);
  const imageBase64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await apiClient.post('/ai/video/submit', {
    imageBase64,
    prompt: request.prompt,
    mimeType,
  });

  const data = response as unknown as { requestId: string; status: string; statusUrl?: string; responseUrl?: string; cancelUrl?: string };

  return {
    requestId: data.requestId,
    status: data.status || 'IN_QUEUE',
    statusUrl: data.statusUrl,
    responseUrl: data.responseUrl,
    cancelUrl: data.cancelUrl,
  };
};

export const getVideoGenerationStatus = async (requestId: string, statusUrl?: string): Promise<VideoGenerationStatusResult> => {
  const params = statusUrl ? `?statusUrl=${encodeURIComponent(statusUrl)}` : '';
  const response = await apiClient.get(`/ai/video/status/${requestId}${params}`);
  const data = response as unknown as { status: string };
  return { status: data.status };
};

export const getVideoGenerationResult = async (requestId: string, responseUrl?: string): Promise<VideoGenerationResult> => {
  const params = responseUrl ? `?responseUrl=${encodeURIComponent(responseUrl)}` : '';
  const response = await apiClient.get(`/ai/video/result/${requestId}${params}`);
  const data = response as unknown as { videoUrl: string };
  return { videoUrl: data.videoUrl };
};

export const cancelVideoGeneration = async (requestId: string): Promise<{ cancelled: boolean }> => {
  const response = await apiClient.put(`/ai/video/cancel/${requestId}`);
  const data = response as unknown as { cancelled: boolean };
  return { cancelled: data.cancelled };
};

export const aiVideoProvidersRegistry = {} as Record<string, unknown>;
