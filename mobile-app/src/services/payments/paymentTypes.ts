import type {
  Product,
  ProductSubscription,
  Purchase,
  PurchaseError,
} from 'react-native-iap';

export type PaymentProduct = Product;
export type PaymentSubscription = ProductSubscription;
export type PaymentPurchase = Purchase;
export type PaymentError = PurchaseError;

export interface PaymentConfig {
  productIds: string[];
  subscriptionIds: string[];
  consumableProductIds?: string[];
  iosSharedSecret?: string;
  androidPackageName?: string;
  enableSandbox?: boolean;
}

export interface PaymentFetchResult {
  products: PaymentProduct[];
  subscriptions: PaymentSubscription[];
}

export interface PaymentValidationResult {
  isValid: boolean;
  platform: 'ios' | 'android' | 'unknown';
  statusCode?: number | null;
  raw?: unknown;
  reason?: string;
}

export interface TrialInfo {
  isTrialAvailable: boolean;
  trialPeriod?: string;
  trialPrice?: string;
  offerToken?: string;
}

export interface PaymentState {
  isConnected: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  isPurchasing: boolean;
  products: PaymentProduct[];
  subscriptions: PaymentSubscription[];
  purchases: PaymentPurchase[];
  lastPurchase: PaymentPurchase | null;
  lastValidation: PaymentValidationResult | null;
  error: PaymentError | null;
}
