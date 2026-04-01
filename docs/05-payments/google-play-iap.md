# Google Play IAP Setup (Android)

> ⚠️ **Requires development builds**
> Google Play Billing uses native modules. **Expo Go is not supported.**
> Use **`npx expo run:android`** for testing.

This guide covers setting up Google Play Billing products to match the app’s SKU configuration.

## 1) Create Products

Go to **Play Console → Monetize → Products**.

### One‑Time Products (Non‑Consumable)
- Product ID: `app_lifetime`
- Status: Active

### Subscriptions
- Product IDs: `app_pro_monthly`, `app_pro_yearly`
- Add **Base Plans** (monthly/yearly)
- Set pricing and availability

> IDs must match `mobile-app/src/config/iap.ts` exactly.

## 2) Activate Products
Products must be **Active** to show up in the billing API.

## 3) License Testing
1. **Setup → License Testing**
2. Add tester Gmail accounts
3. Use these accounts on test devices

## 4) Upload a Build
Create and upload at least one AAB so testing is fully enabled:
```bash
cd mobile-app
npx expo prebuild --platform android --clean
cd android
./gradlew bundleRelease
```

Upload in **Release → Internal Testing**.

## Troubleshooting

| Problem | Solution |
|---|---|
| Products not returned | Ensure product is **Active** and IDs match |
| Purchases fail | Ensure tester account is in License Testing |
| Billing not available | Use a Google Play enabled emulator or real device |

## Related Docs

- [IAP Overview](iap-overview.md)
- [Receipt Verification](receipt-verification.md)
- [Google Play Console](../03-platform-setup/google-play-console.md)
