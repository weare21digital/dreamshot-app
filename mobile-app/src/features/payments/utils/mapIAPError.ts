import type { PurchaseError } from 'react-native-iap';

export interface IAPErrorInfo {
  message: string | null;
  showRetry: boolean;
  showSupport: boolean;
  logLevel: 'info' | 'warn' | 'error';
}

const ERROR_MAP: Record<string, IAPErrorInfo> = {
  E_USER_CANCELLED: {
    message: null,
    showRetry: false,
    showSupport: false,
    logLevel: 'info',
  },
  E_NETWORK_ERROR: {
    message: 'Network error. Please check your connection and try again.',
    showRetry: true,
    showSupport: false,
    logLevel: 'warn',
  },
  E_SERVICE_ERROR: {
    message: 'Store is temporarily unavailable. Please try again later.',
    showRetry: true,
    showSupport: false,
    logLevel: 'warn',
  },
  E_ITEM_UNAVAILABLE: {
    message: 'This item is not available for purchase.',
    showRetry: false,
    showSupport: true,
    logLevel: 'error',
  },
  E_REMOTE_ERROR: {
    message: 'Store error. Please try again later.',
    showRetry: true,
    showSupport: false,
    logLevel: 'warn',
  },
  E_RECEIPT_FAILED: {
    message: 'Purchase verification failed. Please contact support.',
    showRetry: false,
    showSupport: true,
    logLevel: 'error',
  },
  E_ALREADY_OWNED: {
    message: 'You already own this item. Try restoring purchases.',
    showRetry: false,
    showSupport: false,
    logLevel: 'info',
  },
  E_PAYMENT_INVALID: {
    message: 'Payment method declined. Please update your payment method.',
    showRetry: true,
    showSupport: false,
    logLevel: 'warn',
  },
};

const DEFAULT_ERROR: IAPErrorInfo = {
  message: 'Purchase failed. Please try again or contact support.',
  showRetry: true,
  showSupport: true,
  logLevel: 'error',
};

export function mapIAPError(error: PurchaseError): IAPErrorInfo {
  return ERROR_MAP[error.code] ?? DEFAULT_ERROR;
}
