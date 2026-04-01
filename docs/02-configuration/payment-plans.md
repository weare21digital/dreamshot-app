# Payment Plans Configuration

> ⚠️ **Requires development builds**
> In‑app purchases rely on native modules. **Expo Go is not supported.**
> Use **`npx expo run:ios`** / **`npx expo run:android`** for testing.

This guide explains how to define and align payment plan types between the mobile app, store consoles, and backend.

> **See also:** [App Modes](app-modes.md) for `paymentMode` (device vs backend verification) and `accessMode` (freemium, paid gate, unlocked).

## Plan Types

Typical plan types:

- **One‑time (non‑consumable)** — e.g., lifetime unlock
- **Subscription** — monthly / yearly recurring

## Mobile App Config

### 1) Store SKUs (`src/config/iap.ts`)
```ts
export const IAP_CONFIG = {
  ios: {
    subscriptions: [],
    oneTime: ['app_lifetime'],
  },
  android: {
    subscriptions: ['app_pro_monthly', 'app_pro_yearly'],
    oneTime: ['app_lifetime'],
  },
} as const;
```

These IDs must match product IDs created in App Store Connect / Google Play Console.

### 2) Feature/Plan Metadata (`src/config/features.ts`)
Use this to drive UI labels and pricing:

```ts
export const APP_FEATURES = {
  payments: {
    enabled: true,
    plans: [
      { id: 'app_lifetime', type: 'one-time', price: 6.99 },
    ],
  },
};
```

## Backend Considerations

- Backend should map SKU → entitlements (premium access)
- Store receipts should be verified server‑side
- Store plan type should match backend logic (subscription vs one‑time)

## Best Practices

- Keep **plan IDs stable** once published
- Avoid changing pricing or plan type without a migration strategy
- Ensure UI labels (monthly/yearly) match store metadata

## Related Docs

- [IAP Overview](../05-payments/iap-overview.md)
- [App Store IAP](../05-payments/app-store-iap.md)
- [Google Play IAP](../05-payments/google-play-iap.md)
