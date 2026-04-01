import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { Purchase } from 'react-native-iap';
import { paymentService } from '../../../services/payments/paymentService';
import { IAP_CONFIG } from '../../../config/iap';
import { useVerifyReceipt } from './useVerifyReceipt';
import { useDeviceVerifyReceipt } from './useDeviceVerifyReceipt';
import {
  loadPendingPurchases,
  removePendingPurchase,
} from '../utils/pendingVerificationQueue';
import type { ReceiptPayload } from '../utils/extractReceipt';

/**
 * Processes any pending (unverified) purchases on app launch
 * and when the app comes back to foreground.
 *
 * Call this once in the app's root or payments screen.
 */
export function usePendingVerifications(): void {
  const isDeviceMode = IAP_CONFIG.paymentMode === 'device';
  const backendVerify = useVerifyReceipt();
  const deviceVerify = useDeviceVerifyReceipt();
  const { mutateAsync: verifyReceipt } = isDeviceMode ? deviceVerify : backendVerify;
  const processingRef = useRef(false);

  const processPending = async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const pending = await loadPendingPurchases();
      if (pending.length === 0) return;

      // Fetch unfinished store transactions once for all pending receipts
      let availablePurchases: Purchase[] = [];
      try {
        availablePurchases = await paymentService.restorePurchases();
      } catch {
        // Non-fatal: we can still verify, just can't finish transactions
      }

      for (const receipt of pending) {
        await verifySingle(receipt, availablePurchases);
      }
    } finally {
      processingRef.current = false;
    }
  };

  const verifySingle = async (
    receipt: ReceiptPayload,
    availablePurchases: Purchase[],
  ) => {
    try {
      const result = await verifyReceipt(receipt);

      if (result.isValid || result.alreadyProcessed) {
        await removePendingPurchase(receipt);

        const match = availablePurchases.find(
          (p) =>
            p.transactionId === receipt.transactionId ||
            p.purchaseToken === receipt.purchaseToken,
        );
        if (match) {
          await paymentService.finishPurchase(match, false);
        }
      }
    } catch {
      // Keep in queue for next retry
    }
  };

  // Process on mount
  useEffect(() => {
    processPending();
  }, []);

  // Process when app comes to foreground
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        processPending();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, []);
}
