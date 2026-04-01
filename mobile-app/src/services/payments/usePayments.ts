import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  PaymentConfig,
  PaymentPurchase,
  PaymentSubscription,
  PaymentState,
  PaymentValidationResult,
  TrialInfo,
} from './paymentTypes';
import { paymentService } from './paymentService';
import { IAP_CONFIG } from '../../config/iap';
import type { PurchaseError } from 'react-native-iap';

const emptyState: PaymentState = {
  isConnected: false,
  isLoading: false,
  isRestoring: false,
  isPurchasing: false,
  products: [],
  subscriptions: [],
  purchases: [],
  lastPurchase: null,
  lastValidation: null,
  error: null,
};

const buildKey = (items: string[]) => items.slice().sort().join('|');

export const usePayments = (config: PaymentConfig) => {
  const [state, setState] = useState<PaymentState>(emptyState);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const productKey = useMemo(() => buildKey(config.productIds), [config.productIds]);
  const subscriptionKey = useMemo(
    () => buildKey(config.subscriptionIds),
    [config.subscriptionIds]
  );

  const refreshProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { products, subscriptions } = await paymentService.fetchProducts(
        configRef.current.productIds,
        configRef.current.subscriptionIds
      );
      setState((prev) => ({
        ...prev,
        products,
        subscriptions,
        isLoading: false,
      }));
      return { products, subscriptions };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as PurchaseError,
      }));
      throw error;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    setState((prev) => ({ ...prev, isRestoring: true, error: null }));
    try {
      const purchases = await paymentService.restorePurchases();
      setState((prev) => ({
        ...prev,
        purchases,
        isRestoring: false,
      }));
      return purchases;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isRestoring: false,
        error: error as PurchaseError,
      }));
      throw error;
    }
  }, []);

  const purchaseOneTime = useCallback(async (productId: string) => {
    setState((prev) => ({ ...prev, isPurchasing: true, error: null }));
    await paymentService.requestOneTimePurchase(productId);
  }, []);

  const purchaseSubscription = useCallback(
    async (subscriptionId: string, offerToken?: string) => {
      setState((prev) => ({ ...prev, isPurchasing: true, error: null }));
      await paymentService.requestSubscriptionPurchase(subscriptionId, offerToken);
    },
    []
  );

  const getTrialInfo = useCallback((subscription: PaymentSubscription): TrialInfo => {
    return paymentService.getTrialInfo(subscription);
  }, []);

  useEffect(() => {
    let mounted = true;

    const handlePurchase = async (purchase: PaymentPurchase) => {
      if (!mounted) {
        return;
      }

      let validation: PaymentValidationResult | null = null;
      try {
        if (IAP_CONFIG.paymentMode === 'device') {
          // In device mode, skip native receipt validation — StoreKit 2 transactions
          // are trusted locally. PremiumScreen handles verification via useDeviceVerifyReceipt.
          const productId = (purchase as { productId?: string | null }).productId ?? '';
          const isConsumable =
            configRef.current.consumableProductIds?.includes(productId) ?? false;
          await paymentService.finishPurchase(purchase, isConsumable);
          validation = { isValid: true, platform: 'ios' };
        } else {
          validation = await paymentService.validateReceiptBasic(purchase, configRef.current);

          if (validation.isValid) {
            const productId = (purchase as { productId?: string | null }).productId ?? '';
            const isConsumable =
              configRef.current.consumableProductIds?.includes(productId) ?? false;
            await paymentService.finishPurchase(purchase, isConsumable);
          }
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isPurchasing: false,
          error: error as PurchaseError,
          lastValidation: validation,
          lastPurchase: purchase,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isPurchasing: false,
        lastPurchase: purchase,
        lastValidation: validation,
        purchases: mergePurchase(prev.purchases, purchase),
      }));
    };

    const handleError = (error: PurchaseError) => {
      if (!mounted) {
        return;
      }
      setState((prev) => ({
        ...prev,
        isPurchasing: false,
        error,
      }));
    };

    const initialize = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await paymentService.initialize();
        if (!mounted) {
          return;
        }
        setState((prev) => ({ ...prev, isConnected: true }));
        await refreshProducts();
        await restorePurchases();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error as PurchaseError,
        }));
      }
    };

    const removePurchaseListener = paymentService.onPurchaseUpdated(handlePurchase);
    const removeErrorListener = paymentService.onPurchaseError(handleError);

    initialize();

    return () => {
      mounted = false;
      removePurchaseListener();
      removeErrorListener();
      paymentService.endConnection();
    };
  }, [productKey, subscriptionKey, refreshProducts, restorePurchases]);

  return {
    ...state,
    refreshProducts,
    restorePurchases,
    purchaseOneTime,
    purchaseSubscription,
    getTrialInfo,
  };
};

const mergePurchase = (existing: PaymentPurchase[], next: PaymentPurchase) => {
  const nextId = (next as { transactionId?: string | null }).transactionId ?? null;
  const nextProductId = (next as { productId?: string | null }).productId ?? null;

  const index = existing.findIndex((purchase) => {
    const transactionId = (purchase as { transactionId?: string | null }).transactionId ?? null;
    const productId = (purchase as { productId?: string | null }).productId ?? null;
    return (nextId && transactionId === nextId) || (nextProductId && productId === nextProductId);
  });

  if (index === -1) {
    return [...existing, next];
  }

  const copy = [...existing];
  copy[index] = next;
  return copy;
};
