import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../../lib/apiClient';

const AI_CONFIG_CACHE_KEY = '@ai/config';
const AI_CONFIG_CACHE_TTL_MS = 15 * 60 * 1000;

type AiConfigResponse = {
  coinCosts?: Record<string, unknown>;
};

type CachedAiConfig = {
  fetchedAt: number;
  coinCosts: Record<string, number>;
};

const normalizeCoinCosts = (coinCosts: Record<string, unknown> | undefined): Record<string, number> => {
  if (!coinCosts || typeof coinCosts !== 'object') return {};

  const normalized: Record<string, number> = {};
  for (const [pipelineId, value] of Object.entries(coinCosts)) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      normalized[pipelineId] = Math.trunc(value);
    }
  }
  return normalized;
};

const readCachedCoinCosts = async (): Promise<Record<string, number> | null> => {
  try {
    const raw = await AsyncStorage.getItem(AI_CONFIG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedAiConfig;
    if (!parsed || typeof parsed.fetchedAt !== 'number' || typeof parsed.coinCosts !== 'object') return null;
    if (Date.now() - parsed.fetchedAt > AI_CONFIG_CACHE_TTL_MS) return null;
    return parsed.coinCosts;
  } catch {
    return null;
  }
};

const writeCachedCoinCosts = async (coinCosts: Record<string, number>): Promise<void> => {
  try {
    const payload: CachedAiConfig = {
      fetchedAt: Date.now(),
      coinCosts,
    };
    await AsyncStorage.setItem(AI_CONFIG_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // best effort
  }
};

let inFlightConfigRequest: Promise<Record<string, number> | null> | null = null;

export const getPipelineCost = async (pipelineId: string, fallbackCost: number): Promise<number> => {
  const cached = await readCachedCoinCosts();
  if (cached && typeof cached[pipelineId] === 'number') {
    return cached[pipelineId];
  }

  if (!inFlightConfigRequest) {
    inFlightConfigRequest = (async () => {
      try {
        const response = await apiClient.get('/generations/config') as AiConfigResponse;
        const coinCosts = normalizeCoinCosts(response?.coinCosts);
        await writeCachedCoinCosts(coinCosts);
        return coinCosts;
      } catch {
        return null;
      } finally {
        inFlightConfigRequest = null;
      }
    })();
  }

  const fresh = await inFlightConfigRequest;
  const fallback = Math.max(0, Math.trunc(fallbackCost));
  if (!fresh) return fallback;
  return typeof fresh[pipelineId] === 'number' ? fresh[pipelineId] : fallback;
};
