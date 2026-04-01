import { Platform } from 'react-native';

export const IAP_CONFIG = {
  // 'device' = StoreKit 2 on-device verification (no backend needed)
  // 'backend' = verify receipts via backend API
  paymentMode: 'device' as 'device' | 'backend',
  // 'freemium' = free app with optional premium upgrade
  // 'paid' = free download + IAP gate before access
  // 'unlocked' = paid App Store download — everything unlocked, no IAP/ads
  accessMode: 'freemium' as 'freemium' | 'paid' | 'unlocked',
  ios: {
    subscriptions: [] as string[],
    oneTime: [
      'com.bvg.royalportrait.coins_100',
      'com.bvg.royalportrait.coins_500',
      'com.bvg.royalportrait.coins_1000',
    ],
  },
  android: {
    subscriptions: [] as string[],
    oneTime: [
      'com.bvg.royalportrait.coins_100',
      'com.bvg.royalportrait.coins_500',
      'com.bvg.royalportrait.coins_1000',
    ],
  },
} as const;

export interface IAPPlatformConfig {
  productIds: readonly string[];
  subscriptionIds: readonly string[];
}

export function getIAPConfig(): IAPPlatformConfig {
  return Platform.select({
    ios: {
      productIds: IAP_CONFIG.ios.oneTime,
      subscriptionIds: IAP_CONFIG.ios.subscriptions,
    },
    android: {
      productIds: IAP_CONFIG.android.oneTime,
      subscriptionIds: IAP_CONFIG.android.subscriptions,
    },
    default: {
      productIds: [] as readonly string[],
      subscriptionIds: [] as readonly string[],
    },
  });
}

/** Local SKU-to-features mapping for UI display */
export const SKU_FEATURES: Record<string, string[]> = {
  'com.bvg.royalportrait.coins_100': ['100 royal coins'],
  'com.bvg.royalportrait.coins_500': ['500 royal coins', 'Best value'],
  'com.bvg.royalportrait.coins_1000': ['1000 royal coins', 'Ultimate pack'],
};

/** SKU → coin amount mapping */
export const SKU_COINS: Record<string, number> = {
  'com.bvg.royalportrait.coins_100': 100,
  'com.bvg.royalportrait.coins_500': 500,
  'com.bvg.royalportrait.coins_1000': 1000,
};

/** Coin pack definitions — single source of truth for coins screen */
export type CoinPack = {
  sku: string;
  coins: number;
  label: string;
  fallbackPrice: string;
  icon: 'stars' | 'diamond' | 'workspace-premium';
  popular?: boolean;
};

export const COIN_PACKS: CoinPack[] = [
  { sku: 'com.bvg.royalportrait.coins_100', coins: 100, label: "The Squire's Pouch", fallbackPrice: '$1.99', icon: 'stars' },
  { sku: 'com.bvg.royalportrait.coins_500', coins: 500, label: "The Duke's Purse", fallbackPrice: '$7.99', icon: 'diamond', popular: true },
  { sku: 'com.bvg.royalportrait.coins_1000', coins: 1000, label: "The King's Treasury", fallbackPrice: '$12.99', icon: 'workspace-premium' },
];
