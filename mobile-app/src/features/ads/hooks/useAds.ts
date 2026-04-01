import { useQuery, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../../lib/apiClient';
import { APP_CONFIG } from '../../../config/app';
import { IAP_CONFIG } from '../../../config/iap';
import { AdConfig, AdAnalyticsData, AdType, AdAction } from '../types';

// Shorter timeout for ad requests (2 seconds)
const AD_TIMEOUT = 2000;

// Sample ad configs for when backend is unavailable
const SAMPLE_ADS: Record<AdType, AdConfig> = {
  [AdType.BANNER]: {
    id: 'sample-banner-001',
    adType: AdType.BANNER,
    adNetworkId: 'sample-network-banner',
    displayFrequency: 1,
  },
  [AdType.INTERSTITIAL]: {
    id: 'sample-interstitial-001',
    adType: AdType.INTERSTITIAL,
    adNetworkId: 'sample-network-interstitial',
    displayFrequency: 1,
  },
};

type ProfilePayload =
  | { premiumStatus: string; premiumExpiry?: string }
  | { user: { premiumStatus: string; premiumExpiry?: string } };

const hasUserProfile = (
  payload: ProfilePayload
): payload is { user: { premiumStatus: string; premiumExpiry?: string } } => {
  return 'user' in payload;
};

const normalizeProfilePayload = (payload: ProfilePayload | AxiosResponse<ProfilePayload>): ProfilePayload => {
  if ('data' in payload) {
    return payload.data;
  }

  return payload;
};

const normalizeAdConfig = (payload: AdConfig | AxiosResponse<AdConfig | null> | null): AdConfig | null => {
  if (!payload) {
    return null;
  }

  if ('data' in payload) {
    return payload.data ?? null;
  }

  return payload;
};

/**
 * Hook to fetch an ad for serving
 */
export function useAd(adType: AdType, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['ads', 'serve', adType],
    queryFn: async () => {
      if (APP_CONFIG.authMode === 'device') {
        // No backend — use sample ads directly
        return SAMPLE_ADS[adType];
      }
      try {
        const rawAdConfig = await apiClient.get<AdConfig | null>(`/ads/serve/${adType}`, {
          timeout: AD_TIMEOUT,
        });
        const adConfig = normalizeAdConfig(rawAdConfig as AdConfig | AxiosResponse<AdConfig | null> | null);
        return adConfig || SAMPLE_ADS[adType];
      } catch {
        // Return sample ad when backend is unavailable
        return SAMPLE_ADS[adType];
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to track ad analytics
 * Silently no-ops in device mode (no backend to send analytics to)
 */
export function useTrackAdAnalytics() {
  return useMutation({
    mutationFn: async (data: AdAnalyticsData) => {
      if (APP_CONFIG.authMode === 'device') {
        // No backend — silently skip analytics
        return;
      }
      return apiClient.post('/ads/track', data, { timeout: AD_TIMEOUT });
    },
    onError: (error) => {
      console.error('Failed to track ad analytics:', error);
    },
  });
}

/**
 * Hook to check if user should see ads based on premium status
 */
export function useShouldShowAds() {
  return useQuery({
    queryKey: ['ads', 'shouldShow'],
    queryFn: async () => {
      // Unlocked mode: paid App Store download — never show ads
      if (IAP_CONFIG.accessMode === 'unlocked') {
        return false;
      }

      // In device mode, check local premium status (not backend)
      if (IAP_CONFIG.paymentMode === 'device') {
        const raw = await AsyncStorage.getItem('@iap_device_premium_status');
        if (raw) {
          const status = JSON.parse(raw);
          if (status.hasPremium) {
            return false;
          }
        }
        return true;
      }

      // Backend mode: check server profile
      try {
        const rawProfile = await apiClient.get<ProfilePayload>(
          '/users/profile',
          { timeout: AD_TIMEOUT }
        );

        const profile = normalizeProfilePayload(rawProfile as ProfilePayload | AxiosResponse<ProfilePayload>);
        const premiumUser = hasUserProfile(profile) ? profile.user : profile;

        if (premiumUser.premiumStatus === 'PREMIUM_LIFETIME') {
          return false;
        }

        if (premiumUser.premiumStatus === 'PREMIUM_SUBSCRIPTION') {
          if (premiumUser.premiumExpiry && new Date(premiumUser.premiumExpiry) > new Date()) {
            return false;
          }
        }

        return true;
      } catch {
        // Default to showing ads if there's an error
        return true;
      }
    },
  });
}

export interface AdDisplayState {
  isLoading: boolean;
  adConfig: AdConfig | null;
  error: string | null;
  shouldShow: boolean;
}

/**
 * Hook to manage ad display state with tracking
 * Replaces the adManager service
 */
export function useAdManager(adType: AdType) {
  const { data: shouldShowAds = true, isLoading: checkingPremium } = useShouldShowAds();
  const { data: adConfig, isLoading: loadingAd, error: adError } = useAd(adType, {
    enabled: shouldShowAds,
  });
  const { mutate: trackMutate } = useTrackAdAnalytics();

  const state: AdDisplayState = {
    isLoading: checkingPremium || loadingAd,
    adConfig: adConfig || null,
    error: adError?.message || null,
    shouldShow: shouldShowAds && !!adConfig,
  };

  const trackImpression = useCallback(() => {
    if (adConfig) {
      trackMutate({
        adType: adConfig.adType,
        action: AdAction.IMPRESSION,
        adNetworkId: adConfig.adNetworkId,
      });
    }
  }, [adConfig, trackMutate]);

  const trackClick = useCallback(() => {
    if (adConfig) {
      trackMutate({
        adType: adConfig.adType,
        action: AdAction.CLICK,
        adNetworkId: adConfig.adNetworkId,
      });
    }
  }, [adConfig, trackMutate]);

  const trackClose = useCallback(() => {
    if (adConfig) {
      trackMutate({
        adType: adConfig.adType,
        action: AdAction.CLOSE,
        adNetworkId: adConfig.adNetworkId,
      });
    }
  }, [adConfig, trackMutate]);

  const trackError = useCallback(
    (errorMessage: string) => {
      console.error('Ad error:', errorMessage);
      if (adConfig) {
        trackMutate({
          adType: adConfig.adType,
          action: AdAction.ERROR,
          adNetworkId: adConfig.adNetworkId,
        });
      }
    },
    [adConfig, trackMutate]
  );

  return {
    ...state,
    trackImpression,
    trackClick,
    trackClose,
    trackError,
  };
}
