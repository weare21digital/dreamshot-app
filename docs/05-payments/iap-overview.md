# In‑App Purchases Overview

> ⚠️ **Requires development builds**
> IAP uses native StoreKit/Billing modules (`react-native-iap`). **Expo Go is not supported.**
> Use **`npx expo run:ios`** / **`npx expo run:android`**.

This project uses **`react-native-iap`** for App Store and Google Play purchases.

## How `react-native-iap` Works

1. **Initialize connection** to the store
2. **Fetch products/subscriptions** by SKU
3. **Request purchase**
4. **Handle receipt / purchase token**
5. **Verify on backend** (recommended)
6. **Finish transaction**

## Sandbox vs Production

- **iOS**
  - Sandbox purchases use **App Store sandbox accounts**
  - Products won’t load until **a binary is uploaded** to App Store Connect

- **Android**
  - Use **license testers** in Play Console
  - Products available once created and activated

## Configuration in This Repo

- SKU lists live in `mobile-app/src/config/iap.ts`
- UI features map to `SKU_FEATURES`
- New architecture is required (`newArchEnabled: true` in `app.json`)

## Typical Flow (Pseudo)

```ts
await initConnection();
const products = await getProducts({ skus: productIds });
const purchase = await requestPurchase({ sku: 'app_lifetime' });
// Send receipt/token to backend
await finishTransaction({ purchase });
```

## Best Practices

- Always **verify purchases on the backend**
- Never grant premium access on device only
- Finish transactions to avoid duplicate purchases

## Related Docs

- [App Store IAP](app-store-iap.md)
- [Google Play IAP](google-play-iap.md)
- [Receipt Verification](receipt-verification.md)
