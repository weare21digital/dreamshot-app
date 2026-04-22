import { Platform } from 'react-native';

export const IAP_CONFIG = {
  // 'device' = StoreKit 2 on-device verification (no backend needed)
  // 'backend' = verify receipts via backend API
  paymentMode: 'backend' as 'device' | 'backend',
  // 'freemium' = free app with optional premium upgrade
  // 'paid' = free download + IAP gate before access
  // 'unlocked' = paid App Store download — everything unlocked, no IAP/ads
  accessMode: 'freemium' as 'freemium' | 'paid' | 'unlocked',
  ios: {
    subscriptions: [] as string[],
    oneTime: [
      'com.bvg.dreamshot.coins_100',
      'com.bvg.dreamshot.coins_500',
      'com.bvg.dreamshot.coins_1000',
    ],
  },
  android: {
    subscriptions: [] as string[],
    oneTime: [
      'com.bvg.dreamshot.coins_100',
      'com.bvg.dreamshot.coins_500',
      'com.bvg.dreamshot.coins_1000',
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
  'com.bvg.dreamshot.coins_100': ['180 dreamshot coins'],
  'com.bvg.dreamshot.coins_500': ['1000 dreamshot coins', 'Best value'],
  'com.bvg.dreamshot.coins_1000': ['2200 dreamshot coins', 'Ultimate pack'],
};

/** SKU → coin amount mapping */
export const SKU_COINS: Record<string, number> = {
  'com.bvg.dreamshot.coins_100': 180,
  'com.bvg.dreamshot.coins_500': 1000,
  'com.bvg.dreamshot.coins_1000': 2200,
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
  { sku: 'com.bvg.dreamshot.coins_100', coins: 180, label: 'Starter Pack', fallbackPrice: '$1.99', icon: 'stars' },
  { sku: 'com.bvg.dreamshot.coins_500', coins: 1000, label: 'Pro Pack', fallbackPrice: '$7.99', icon: 'diamond', popular: true },
  { sku: 'com.bvg.dreamshot.coins_1000', coins: 2200, label: 'Ultimate Pack', fallbackPrice: '$12.99', icon: 'workspace-premium' },
];
