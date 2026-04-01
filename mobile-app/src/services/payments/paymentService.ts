import { Platform } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  verifyPurchase,
} from 'react-native-iap';
import type {
  PaymentConfig,
  PaymentFetchResult,
  PaymentPurchase,
  PaymentValidationResult,
  TrialInfo,
} from './paymentTypes';
import type { EventSubscription, PurchaseError, Product, ProductSubscription } from 'react-native-iap';

export type PurchaseListener = (purchase: PaymentPurchase) => void;
export type PurchaseErrorListener = (error: PurchaseError) => void;

class PaymentService {
  private static instance: PaymentService;
  private initialized = false;
  private purchaseUpdateSubscription: EventSubscription | null = null;
  private purchaseErrorSubscription: EventSubscription | null = null;
  private purchaseListeners: Set<PurchaseListener> = new Set();
  private errorListeners: Set<PurchaseErrorListener> = new Set();

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🧾 [Payments] Already initialized, skipping');
      return;
    }

    try {
      console.log('🧾 [Payments] Calling initConnection...');
      const result = await initConnection();
      console.log('🧾 [Payments] initConnection result:', JSON.stringify(result));
    } catch (err) {
      console.error('🧾 [Payments] initConnection FAILED:', err);
      throw err;
    }

    this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
      this.purchaseListeners.forEach((listener) => listener(purchase));
    });

    this.purchaseErrorSubscription = purchaseErrorListener((error) => {
      this.errorListeners.forEach((listener) => listener(error));
    });

    this.initialized = true;
  }

  public async endConnection(): Promise<void> {
    this.purchaseUpdateSubscription?.remove();
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription?.remove();
    this.purchaseErrorSubscription = null;
    this.purchaseListeners.clear();
    this.errorListeners.clear();
    this.initialized = false;

    try {
      await endConnection();
    } catch (error) {
      console.warn('🧾 [Payments] Failed to end IAP connection', error);
    }
  }

  public onPurchaseUpdated(listener: PurchaseListener): () => void {
    this.purchaseListeners.add(listener);
    return () => this.purchaseListeners.delete(listener);
  }

  public onPurchaseError(listener: PurchaseErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  public async fetchProducts(
    productIds: string[],
    subscriptionIds: string[]
  ): Promise<PaymentFetchResult> {
    console.log('🧾 [Payments] Fetching products...', { productIds, subscriptionIds });
    
    try {
      const [products, subscriptions] = await Promise.all([
        productIds.length > 0
          ? fetchProducts({ skus: productIds, type: 'in-app' })
          : Promise.resolve([] as Product[]),
        subscriptionIds.length > 0
          ? fetchProducts({ skus: subscriptionIds, type: 'subs' })
          : Promise.resolve([] as ProductSubscription[]),
      ]);

      console.log('🧾 [Payments] Products fetched:', {
        productsCount: products?.length ?? 0,
        products: (products ?? []).map((p: any) => ({ id: p.productId ?? p.id, price: p.localizedPrice ?? p.displayPrice })),
        subscriptionsCount: subscriptions?.length ?? 0,
        subscriptions: (subscriptions ?? []).map((s: any) => ({ id: s.productId ?? s.id, price: s.localizedPrice ?? s.displayPrice })),
      });

      return {
        products: products as Product[],
        subscriptions: subscriptions as ProductSubscription[],
      };
    } catch (error) {
      console.error('🧾 [Payments] Error fetching products:', error);
      throw error;
    }
  }

  public async requestOneTimePurchase(productId: string): Promise<void> {
    await requestPurchase({
      request: {
        apple: { sku: productId },
        google: { skus: [productId] },
      },
      type: 'in-app',
    });
  }

  public async requestSubscriptionPurchase(
    subscriptionId: string,
    offerToken?: string
  ): Promise<void> {
    const googleRequest = offerToken
      ? { skus: [subscriptionId], subscriptionOffers: [{ sku: subscriptionId, offerToken }] }
      : { skus: [subscriptionId] };

    await requestPurchase({
      request: {
        apple: { sku: subscriptionId },
        google: googleRequest,
      },
      type: 'subs',
    });
  }

  public async restorePurchases(): Promise<PaymentPurchase[]> {
    const purchases = await getAvailablePurchases();
    return purchases as PaymentPurchase[];
  }

  public async finishPurchase(purchase: PaymentPurchase, isConsumable: boolean): Promise<void> {
    await finishTransaction({ purchase, isConsumable });
  }

  public async validateReceiptBasic(
    purchase: PaymentPurchase,
    config: PaymentConfig
  ): Promise<PaymentValidationResult> {
    void config;
    if (Platform.OS === 'ios') {
      const sku = purchase.productId ?? purchase.id ?? null;
      if (!sku) {
        return {
          isValid: false,
          platform: 'ios',
          reason: 'Missing iOS product identifier.',
        };
      }

      try {
        const response = await verifyPurchase({
          apple: { sku },
        });
        const isValid = Boolean(
          response && typeof response === 'object' && 'isValid' in response
            ? (response as { isValid?: boolean }).isValid
            : false
        );

        return {
          isValid,
          platform: 'ios',
          statusCode: null,
          raw: response,
        };
      } catch (error) {
        return {
          isValid: false,
          platform: 'ios',
          reason: error instanceof Error ? error.message : 'Receipt validation failed.',
        };
      }
    }

    if (Platform.OS === 'android') {
      const purchaseToken = (purchase as { purchaseToken?: string | null }).purchaseToken ?? null;

      return {
        isValid: Boolean(purchaseToken),
        platform: 'android',
        reason: purchaseToken ? undefined : 'Missing Android purchase token.',
      };
    }

    return {
      isValid: false,
      platform: 'unknown',
      reason: 'Unsupported platform.',
    };
  }

  public getTrialInfo(subscription: ProductSubscription): TrialInfo {
    if (Platform.OS === 'android') {
      const raw = subscription as unknown as {
        subscriptionOfferDetails?: Array<{
          offerToken?: string;
          pricingPhases?: {
            pricingPhaseList?: Array<{
              priceAmountMicros?: string;
              formattedPrice?: string;
              billingPeriod?: string;
            }>;
          };
        }>;
      };

      const offers = raw.subscriptionOfferDetails ?? [];
      for (const offer of offers) {
        const phases = offer.pricingPhases?.pricingPhaseList ?? [];
        const trialPhase = phases.find((phase) => phase.priceAmountMicros === '0');
        if (trialPhase) {
          return {
            isTrialAvailable: true,
            trialPeriod: trialPhase.billingPeriod,
            trialPrice: trialPhase.formattedPrice,
            offerToken: offer.offerToken,
          };
        }
      }

      return { isTrialAvailable: false };
    }

    if (Platform.OS === 'ios') {
      const raw = subscription as unknown as {
        introductoryPrice?: string;
        introductoryPriceSubscriptionPeriodIOS?: string;
        introductoryPricePaymentModeIOS?: string;
      };

      if (raw.introductoryPrice && raw.introductoryPricePaymentModeIOS === 'FREETRIAL') {
        return {
          isTrialAvailable: true,
          trialPrice: raw.introductoryPrice,
          trialPeriod: raw.introductoryPriceSubscriptionPeriodIOS,
        };
      }

      return { isTrialAvailable: false };
    }

    return { isTrialAvailable: false };
  }
}

export const paymentService = PaymentService.getInstance();
