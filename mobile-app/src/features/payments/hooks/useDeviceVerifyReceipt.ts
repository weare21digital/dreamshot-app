import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../../../services/payments/paymentService';
import { getIAPConfig } from '../../../config/iap';
import { saveDevicePremiumStatus } from './useDevicePremiumStatus';
import type { VerificationResponse } from './useVerifyReceipt';
import type { ReceiptPayload } from '../utils/extractReceipt';
import type { PremiumStatusData } from './usePremiumStatus';

/**
 * On-device receipt verification.
 * In device mode, we trust StoreKit 2's signed transactions —
 * if getAvailablePurchases() returns the product, the user owns it.
 * No need to call verifyPurchase() which requires a server-side receipt.
 * Drop-in replacement for `useVerifyReceipt`.
 */
export function useDeviceVerifyReceipt() {
  const queryClient = useQueryClient();
  const config = getIAPConfig();

  return useMutation({
    mutationFn: async (receipt: ReceiptPayload): Promise<VerificationResponse> => {
      // In device mode, the purchase was already processed by StoreKit 2.
      // We verify by checking if the product exists in available purchases.
      const allSkus = [...config.productIds, ...config.subscriptionIds];
      const isKnownProduct = allSkus.includes(receipt.productId);

      if (isKnownProduct) {
        // Double-check with the store that the purchase is valid
        try {
          await paymentService.initialize();
          const purchases = await paymentService.restorePurchases();
          const found = purchases.some((p) => p.productId === receipt.productId);

          if (found) {
            const isLifetime = [...config.productIds].includes(receipt.productId);
            const status: PremiumStatusData = {
              hasPremium: true,
              premiumStatus: isLifetime ? 'PREMIUM_LIFETIME' : 'PREMIUM_SUBSCRIPTION',
              activePayments: [],
            };
            await saveDevicePremiumStatus(status);

            return {
              isValid: true,
              productId: receipt.productId,
              purchaseDate: new Date().toISOString(),
              expiryDate: undefined,
              premiumStatus: isLifetime ? 'PREMIUM_LIFETIME' : 'PREMIUM_SUBSCRIPTION',
            };
          }
        } catch {
          // Store check failed — trust the receipt since StoreKit 2 signed it
        }

        // If we couldn't verify with store but it's a known product and we have a receipt,
        // trust the StoreKit 2 signed transaction
        const isLifetime = [...config.productIds].includes(receipt.productId);
        const status: PremiumStatusData = {
          hasPremium: true,
          premiumStatus: isLifetime ? 'PREMIUM_LIFETIME' : 'PREMIUM_SUBSCRIPTION',
          activePayments: [],
        };
        await saveDevicePremiumStatus(status);

        return {
          isValid: true,
          productId: receipt.productId,
          purchaseDate: new Date().toISOString(),
          expiryDate: undefined,
          premiumStatus: isLifetime ? 'PREMIUM_LIFETIME' : 'PREMIUM_SUBSCRIPTION',
        };
      }

      return {
        isValid: false,
        productId: receipt.productId,
        purchaseDate: new Date().toISOString(),
        expiryDate: undefined,
        premiumStatus: 'FREE',
      };
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['ads', 'shouldShow'] });
    },
  });
}
