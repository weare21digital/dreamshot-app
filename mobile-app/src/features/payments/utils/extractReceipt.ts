import { Platform } from 'react-native';
import type { Purchase, PurchaseIOS } from 'react-native-iap';

export interface ReceiptPayload {
  platform: 'ios' | 'android';
  productId: string;
  transactionId: string | null;
  originalTransactionId?: string | null;
  purchaseToken?: string | null;
  receiptData?: string | null;
}

export function extractReceipt(purchase: Purchase): ReceiptPayload {
  if (Platform.OS === 'ios') {
    const iosPurchase = purchase as PurchaseIOS;
    return {
      platform: 'ios',
      productId: purchase.productId,
      transactionId: purchase.transactionId ?? null,
      originalTransactionId: iosPurchase.originalTransactionIdentifierIOS ?? null,
      // StoreKit 2 JWS signed transaction — decoded server-side
      receiptData: purchase.purchaseToken ?? null,
    };
  }

  return {
    platform: 'android',
    productId: purchase.productId,
    transactionId: purchase.transactionId ?? null,
    purchaseToken: purchase.purchaseToken ?? null,
  };
}
