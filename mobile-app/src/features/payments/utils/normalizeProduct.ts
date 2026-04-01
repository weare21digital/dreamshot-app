import type { Product, ProductSubscription } from 'react-native-iap';

export interface UIProduct {
  sku: string;
  title: string;
  description: string;
  priceText: string;
  currency?: string;
  type: 'subscription' | 'one-time';
}

export function normalizeProduct(
  product: Product,
  type: UIProduct['type'],
): UIProduct {
  return {
    sku: product.id,
    title: product.title,
    description: product.description,
    priceText: product.displayPrice,
    currency: product.currency,
    type,
  };
}

export function normalizeSubscription(
  subscription: ProductSubscription,
): UIProduct {
  return {
    sku: subscription.id,
    title: subscription.title,
    description: subscription.description,
    priceText: subscription.displayPrice,
    currency: subscription.currency,
    type: 'subscription',
  };
}

export function isSubscription(
  product: Product | ProductSubscription,
): product is ProductSubscription {
  return product.type === 'subs';
}
