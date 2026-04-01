import { useState, useCallback } from 'react';
import type { Purchase } from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { paymentService } from '../../../services/payments/paymentService';
import { IAP_CONFIG } from '../../../config/iap';
import { useVerifyReceipt } from './useVerifyReceipt';
import { useDeviceVerifyReceipt } from './useDeviceVerifyReceipt';
import { extractReceipt } from '../utils/extractReceipt';

export interface RestoreResult {
  total: number;
  successful: number;
  failed: number;
}

export function useRestorePurchases() {
  const isDeviceMode = IAP_CONFIG.paymentMode === 'device';
  const backendVerify = useVerifyReceipt();
  const deviceVerify = useDeviceVerifyReceipt();
  const { mutateAsync: verifyReceipt } = isDeviceMode ? deviceVerify : backendVerify;
  const [isRestoring, setIsRestoring] = useState(false);
  const [result, setResult] = useState<RestoreResult | null>(null);

  const restore = useCallback(async (): Promise<RestoreResult> => {
    setIsRestoring(true);
    setResult(null);

    try {
      // Clear debug override so StoreKit check runs again
      await AsyncStorage.removeItem('@iap_debug_force_free');

      const purchases = await paymentService.restorePurchases();

      if (purchases.length === 0) {
        const empty: RestoreResult = { total: 0, successful: 0, failed: 0 };
        setResult(empty);
        return empty;
      }

      const results = await Promise.allSettled(
        purchases.map(async (purchase: Purchase) => {
          const receipt = extractReceipt(purchase);
          const verification = await verifyReceipt(receipt);

          if (verification.isValid || verification.alreadyProcessed) {
            await paymentService.finishPurchase(purchase, false);
          }

          return verification;
        }),
      );

      const successful = results.filter(
        (r) =>
          r.status === 'fulfilled' &&
          (r.value.isValid || r.value.alreadyProcessed),
      ).length;
      const failed = purchases.length - successful;

      const finalResult: RestoreResult = {
        total: purchases.length,
        successful,
        failed,
      };

      setResult(finalResult);
      return finalResult;
    } finally {
      setIsRestoring(false);
    }
  }, [verifyReceipt]);

  return { restore, isRestoring, result };
}
