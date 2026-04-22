import { Platform } from 'react-native';
import type { PaymentPurchase } from '../../../services/payments/paymentTypes';
import { apiClient } from '../../../lib/apiClient';

type RedeemResponse = {
  balance: number;
  ledgerVersion: number;
};

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};


const normalizeProductId = (productId: string): string => {
  const trimmed = productId.trim();
  if (!trimmed.includes('.')) {
    return trimmed;
  }

  const lastSegment = trimmed.split('.').pop();
  return lastSegment && lastSegment.length > 0 ? lastSegment : trimmed;
};

const extractReceipt = (purchase: PaymentPurchase): string | null => {
  const transactionReceipt = toNonEmptyString((purchase as { transactionReceipt?: unknown }).transactionReceipt);
  if (transactionReceipt) return transactionReceipt;

  const purchaseToken = toNonEmptyString((purchase as { purchaseToken?: unknown }).purchaseToken);
  if (purchaseToken) return purchaseToken;

  const originalJson = toNonEmptyString((purchase as { originalJson?: unknown }).originalJson);
  if (originalJson) return originalJson;

  return null;
};

export const redeemIapPurchase = async (
  productId: string,
  purchase: PaymentPurchase,
): Promise<RedeemResponse> => {
  const receipt = extractReceipt(purchase);
  if (!receipt) {
    throw new Error('Missing purchase receipt data');
  }

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';

  return apiClient.post('/coins/iap/redeem', {
    platform,
    productId: normalizeProductId(productId),
    receipt,
  }) as Promise<RedeemResponse>;
};
