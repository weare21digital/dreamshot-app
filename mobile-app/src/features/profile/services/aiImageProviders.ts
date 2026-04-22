import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { apiClient } from '../../../lib/apiClient';

export type AiImageGenerationRequest = {
  imageUri: string;
  prompt: string;
  stylePreset: string;
  backgroundImageUrl?: string;
  aspect?: string;
  quality?: string;
  pipelineId?: 'openai-image' | 'fal-image';
  idempotencyKey?: string;
};

export type ImageSubmitResult = {
  requestId: string;
  status: string;
  statusUrl?: string;
  responseUrl?: string;
  balance?: number;
  ledgerVersion?: number;
  idempotencyKey: string;
};

const getMimeType = (imageUri: string): string => {
  const normalized = imageUri.toLowerCase();
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

/** Submit OpenAI image generation via unified backend */
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

  const pipelineId = request.pipelineId ?? 'openai-image';
  const idempotencyKey = request.idempotencyKey ?? Crypto.randomUUID();

  if (pipelineId === 'fal-image') {
    const response = await apiClient.post('/generations/fal', {
      prompt: request.prompt,
      pipelineId: 'fal-image',
      stylePreset: request.stylePreset,
      inputImageUrl: `data:${mimeType};base64,${imageBase64}`,
    }, { headers: { 'Idempotency-Key': idempotencyKey } }) as { id: string; status: string; outputUrl?: string; balance?: number; ledgerVersion?: number };

    if (!response?.id) {
      throw new Error('Backend did not return a generation ID');
    }

    return {
      requestId: response.id,
      status: response.status,
      responseUrl: response.outputUrl,
      balance: response.balance,
      ledgerVersion: response.ledgerVersion,
      idempotencyKey,
    };
  }

  const response = await apiClient.post('/generations/openai', {
    prompt: request.prompt,
    inputImageBase64: imageBase64,
  }, { headers: { 'Idempotency-Key': idempotencyKey } }) as { id: string; status: string; outputUrl?: string; balance?: number; ledgerVersion?: number };

  if (!response?.id) {
    throw new Error('Backend did not return a generation ID');
  }

  return {
    requestId: response.id,
    status: response.status,
    responseUrl: response.outputUrl,
    balance: response.balance,
    ledgerVersion: response.ledgerVersion,
    idempotencyKey,
  };
};

/** Poll image generation status */
export const getImageStatus = async (
  requestId: string,
  _statusUrl?: string,
): Promise<{ status: string; errorMessage?: string; outputUrl?: string; errorCode?: string; rejectionCategory?: string }> => {
  return apiClient.get(`/generations/${requestId}`) as Promise<{ status: string; errorMessage?: string; outputUrl?: string; errorCode?: string; rejectionCategory?: string }>;
};

/** Get completed image result */
export const getImageResult = async (
  requestId: string,
  _responseUrl?: string,
): Promise<{ imageUrl: string }> => {
  const generation = await apiClient.get(`/generations/${requestId}`) as { outputUrl?: string };
  if (!generation?.outputUrl) {
    throw new Error('Generation is not complete yet');
  }
  return { imageUrl: generation.outputUrl };
};

/** Cancel is not supported on unified generations API */
export const cancelImageGeneration = async (_requestId: string): Promise<{ cancelled: boolean }> => {
  return { cancelled: false };
};
