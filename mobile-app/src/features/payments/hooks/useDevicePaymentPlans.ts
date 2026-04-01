import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../../services/payments/paymentService';
import { getIAPConfig, SKU_FEATURES } from '../../../config/iap';
import type { PaymentPlan } from '../types';

/**
 * Loads payment plans from StoreKit product info instead of backend API.
 * Drop-in replacement for `usePaymentPlans`.
 */
export function useDevicePaymentPlans() {
  const config = getIAPConfig();

  return useQuery<PaymentPlan[]>({
    queryKey: ['payments', 'plans'],
    queryFn: async () => {
      const { products, subscriptions } = await paymentService.fetchProducts(
        [...config.productIds],
        [...config.subscriptionIds],
      );

      const plans: PaymentPlan[] = [];

      for (const product of products) {
        const id = (product as any).productId ?? (product as any).id ?? '';
        const price = parseFloat((product as any).price ?? '0');
        const currency = (product as any).currency ?? 'USD';

        plans.push({
          id,
          type: 'one-time',
          price,
          currency,
          features: SKU_FEATURES[id] ?? [(product as any).title ?? id],
        });
      }

      for (const sub of subscriptions) {
        const id = (sub as any).productId ?? (sub as any).id ?? '';
        const price = parseFloat((sub as any).price ?? '0');
        const currency = (sub as any).currency ?? 'USD';
        const period = (sub as any).subscriptionPeriodUnitIOS ?? (sub as any).subscriptionPeriodAndroid ?? '';

        plans.push({
          id,
          type: 'subscription',
          price,
          currency,
          duration: period,
          features: SKU_FEATURES[id] ?? [(sub as any).title ?? id],
        });
      }

      return plans;
    },
  });
}
