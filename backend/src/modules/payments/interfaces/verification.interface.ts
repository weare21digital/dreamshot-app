import { PremiumStatus } from '../../../../generated/prisma';

export enum StorePlatform {
  IOS = 'ios',
  ANDROID = 'android',
}

export interface VerifyReceiptRequest {
  userId: string;
  platform: StorePlatform;
  productId: string;
  transactionId?: string;
  originalTransactionId?: string;
  purchaseToken?: string;
  receiptData?: string;
}

export interface VerificationResult {
  isValid: boolean;
  productId: string;
  purchaseDate: Date;
  expiryDate?: Date;
  premiumStatus: PremiumStatus;
  alreadyProcessed?: boolean;
}

export interface StoreVerificationResult {
  isValid: boolean;
  productId: string;
  purchaseDate: Date;
  expiryDate?: Date;
}

/** Backend SKU allow-list with product type mapping */
export const SKU_TYPE_MAP: Record<string, 'subscription' | 'one-time'> = {
  app_pro_monthly: 'subscription',
  app_pro_yearly: 'subscription',
  app_lifetime: 'one-time',
};

export function isKnownSku(productId: string): boolean {
  return productId in SKU_TYPE_MAP;
}

export function isSubscriptionSku(productId: string): boolean {
  return SKU_TYPE_MAP[productId] === 'subscription';
}
