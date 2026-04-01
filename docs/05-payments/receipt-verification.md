# Receipt Verification Flow

> ⚠️ **Requires development builds**
> Receipt verification depends on native IAP modules. **Expo Go is not supported.**
> Use **`npx expo run:ios`** / **`npx expo run:android`**.

This guide describes the recommended backend receipt verification flow for App Store and Google Play purchases.

## Why Verify on the Backend?

- Prevents client‑side spoofing
- Ensures premium access is granted only after valid receipts
- Centralizes entitlement logic

## Recommended Flow

1. **Client starts purchase** via `react-native-iap`
2. **Client receives receipt/purchase token**
3. **Client sends token to backend**
4. **Backend verifies** with Apple/Google servers
5. **Backend stores entitlement** (premium)
6. **Client refreshes profile**

## iOS Verification (StoreKit)

- Use Apple’s receipt verification endpoints
- Verify:
  - bundle ID
  - product ID
  - purchase status
  - expiration (for subscriptions)

## Android Verification (Google Play Developer API)

- Use purchase token from `react-native-iap`
- Verify product ID + purchase state
- Validate subscription status for recurring purchases

## Security Notes

- Never trust client‑side `isPremium` flags
- Store verified entitlement status in DB
- Re‑check subscription status periodically (cron)

## Related Docs

- [IAP Overview](iap-overview.md)
- [App Store IAP](app-store-iap.md)
- [Google Play IAP](google-play-iap.md)
