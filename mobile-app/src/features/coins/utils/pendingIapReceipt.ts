import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PaymentPurchase } from '../../../services/payments/paymentTypes';

const PENDING_IAP_RECEIPT_KEY = '@coins/pending-iap-receipt';

export type PendingIapReceipt = {
  productId: string;
  transactionId?: string;
  transactionReceipt?: string;
  purchaseToken?: string;
  originalJson?: string;
};

const toReceipt = (purchase: PaymentPurchase): PendingIapReceipt | null => {
  const productId = (purchase as { productId?: string | null }).productId?.trim() ?? '';
  if (!productId) {
    return null;
  }

  return {
    productId,
    transactionId: (purchase as { transactionId?: string | null }).transactionId ?? undefined,
    transactionReceipt:
      (purchase as { transactionReceipt?: string | null }).transactionReceipt ?? undefined,
    purchaseToken: (purchase as { purchaseToken?: string | null }).purchaseToken ?? undefined,
    originalJson: (purchase as { originalJson?: string | null }).originalJson ?? undefined,
  };
};

export const savePendingIapReceipt = async (purchase: PaymentPurchase): Promise<void> => {
  const receipt = toReceipt(purchase);
  if (!receipt) return;
  await AsyncStorage.setItem(PENDING_IAP_RECEIPT_KEY, JSON.stringify(receipt));
};

export const loadPendingIapReceipt = async (): Promise<PendingIapReceipt | null> => {
  try {
    const raw = await AsyncStorage.getItem(PENDING_IAP_RECEIPT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingIapReceipt;
    if (!parsed?.productId) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const clearPendingIapReceipt = async (): Promise<void> => {
  await AsyncStorage.removeItem(PENDING_IAP_RECEIPT_KEY);
};
