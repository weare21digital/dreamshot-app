import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReceiptPayload } from './extractReceipt';

const STORAGE_KEY = '@iap_pending_verifications';

/**
 * Persists unverified purchases locally so they can be retried
 * on next app launch or when connectivity is restored.
 */
export async function loadPendingPurchases(): Promise<ReceiptPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReceiptPayload[]) : [];
  } catch {
    return [];
  }
}

export async function addPendingPurchase(
  receipt: ReceiptPayload,
): Promise<void> {
  const existing = await loadPendingPurchases();

  // Avoid duplicates based on transactionId or purchaseToken
  const isDuplicate = existing.some(
    (p) =>
      (p.transactionId && p.transactionId === receipt.transactionId) ||
      (p.purchaseToken && p.purchaseToken === receipt.purchaseToken),
  );

  if (isDuplicate) return;

  existing.push(receipt);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export async function removePendingPurchase(
  receipt: ReceiptPayload,
): Promise<void> {
  const existing = await loadPendingPurchases();
  const filtered = existing.filter(
    (p) =>
      p.transactionId !== receipt.transactionId &&
      p.purchaseToken !== receipt.purchaseToken,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function clearPendingPurchases(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
