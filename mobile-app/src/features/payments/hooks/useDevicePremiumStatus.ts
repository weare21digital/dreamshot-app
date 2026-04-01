import { useEffect, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { paymentService } from '../../../services/payments/paymentService';
import { getIAPConfig, IAP_CONFIG } from '../../../config/iap';
import type { PremiumStatusData } from './usePremiumStatus';

const PREMIUM_STATUS_KEY = '@iap_device_premium_status';
const DEBUG_OVERRIDE_KEY = '@iap_debug_force_free';

async function loadStoredStatus(): Promise<PremiumStatusData | null> {
  try {
    const raw = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
    return raw ? (JSON.parse(raw) as PremiumStatusData) : null;
  } catch {
    return null;
  }
}

export async function saveDevicePremiumStatus(status: PremiumStatusData): Promise<void> {
  await AsyncStorage.setItem(PREMIUM_STATUS_KEY, JSON.stringify(status));
}

const FREE_STATUS: PremiumStatusData = {
  hasPremium: false,
  premiumStatus: 'FREE',
  activePayments: [],
};

/**
 * On-device premium status hook.
 * Uses `getAvailablePurchases()` to check entitlements and stores in AsyncStorage.
 * Drop-in replacement for `usePremiumStatus`.
 */
export function useDevicePremiumStatus() {
  const queryClient = useQueryClient();
  const config = getIAPConfig();
  const allSkus = [...config.productIds, ...config.subscriptionIds];

  const checkEntitlements = useCallback(async (): Promise<PremiumStatusData> => {
    try {
      // Unlocked mode: paid App Store download — always premium
      if (IAP_CONFIG.accessMode === 'unlocked') {
        return {
          hasPremium: true,
          premiumStatus: 'PREMIUM_LIFETIME',
          activePayments: [],
        };
      }

      // Debug override: skip StoreKit check entirely
      const debugOverride = await AsyncStorage.getItem(DEBUG_OVERRIDE_KEY);
      if (debugOverride === 'true') {
        return FREE_STATUS;
      }

      await paymentService.initialize();
      const purchases = await paymentService.restorePurchases();
      const entitled = purchases.filter((p) => allSkus.includes(p.productId));

      if (entitled.length > 0) {
        // Determine if it's a subscription or lifetime
        const hasLifetime = entitled.some((p) =>
          [...config.productIds].includes(p.productId),
        );
        const status: PremiumStatusData = {
          hasPremium: true,
          premiumStatus: hasLifetime ? 'PREMIUM_LIFETIME' : 'PREMIUM_SUBSCRIPTION',
          activePayments: entitled,
        };
        await saveDevicePremiumStatus(status);
        return status;
      }

      // No entitlements found
      await saveDevicePremiumStatus(FREE_STATUS);
      return FREE_STATUS;
    } catch {
      // On error, fall back to stored status
      const stored = await loadStoredStatus();
      return stored ?? FREE_STATUS;
    }
  }, [allSkus, config.productIds]);

  const query = useQuery<PremiumStatusData>({
    queryKey: ['payments', 'status'],
    queryFn: checkEntitlements,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    // Use stored value as placeholder while checking store
    placeholderData: FREE_STATUS,
  });

  // Refresh when app comes to foreground
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        queryClient.invalidateQueries({ queryKey: ['payments', 'status'] });
        queryClient.invalidateQueries({ queryKey: ['ads', 'shouldShow'] });
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [queryClient]);

  return query;
}
