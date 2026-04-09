import * as FileSystem from 'expo-file-system/legacy';
import { apiClient } from '../../../lib/apiClient';

export type AiImageGenerationRequest = {
  imageUri: string;
  prompt: string;
  stylePreset: string;
  backgroundImageUrl?: string;
};

export type ImageSubmitResult = {
  requestId: string;
  status: string;
  statusUrl?: string;
  responseUrl?: string;
};

const getMimeType = (imageUri: string): string => {
  const normalized = imageUri.toLowerCase();
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

/** Submit image generation to the queue — returns job metadata for polling */
export const submitImageGeneration = async (request: AiImageGenerationRequest): Promise<ImageSubmitResult> => {
  let localUri = request.imageUri;

  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    const ext = localUri.includes('.png') ? 'png' : 'jpg';
    const localPath = `${FileSystem.cacheDirectory}image-input-${Date.now()}.${ext}`;
    const download = await FileSystem.downloadAsync(localUri, localPath);
    localUri = download.uri;
  }

  const mimeType = getMimeType(localUri);
  const imageBase64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await apiClient.post('/ai/image/submit', {
    imageBase64,
    prompt: request.prompt,
    mimeType,
    stylePreset: request.stylePreset,
    backgroundImageUrl: request.backgroundImageUrl,
  }) as ImageSubmitResult;

  if (!response?.requestId) {
    throw new Error('Backend did not return a request ID');
  }

  return response;
};

/** Poll image generation status */
export const getImageStatus = async (
  requestId: string,
  statusUrl?: string,
): Promise<{ status: string; errorMessage?: string; errorCode?: string; rejectionCategory?: string }> => {
  const params = statusUrl ? `?statusUrl=${encodeURIComponent(statusUrl)}` : '';
  return apiClient.get(`/ai/image/status/${requestId}${params}`) as Promise<{ status: string; errorMessage?: string; errorCode?: string; rejectionCategory?: string }>;
};

/** Get completed image result */
export const getImageResult = async (
  requestId: string,
  responseUrl?: string,
): Promise<{ imageUrl: string }> => {
  const params = responseUrl ? `?responseUrl=${encodeURIComponent(responseUrl)}` : '';
  return apiClient.get(`/ai/image/result/${requestId}${params}`) as Promise<{ imageUrl: string }>;
};

/** Cancel a queued image generation */
export const cancelImageGeneration = async (requestId: string): Promise<{ cancelled: boolean }> => {
  return apiClient.put(`/ai/image/cancel/${requestId}`) as Promise<{ cancelled: boolean }>;
};
