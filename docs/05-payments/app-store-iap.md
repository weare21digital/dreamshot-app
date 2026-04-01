# App Store IAP Setup (iOS)

> ⚠️ **Requires development builds**
> IAP is a native module. **Expo Go is not supported.**
> Use **`npx expo run:ios`** for testing.

This guide expands the README section for App Store IAP configuration.

## Prerequisites

- Active **Apple Developer Program** membership
- App created in **App Store Connect**
- **Paid Apps Agreement** active

## 1) Paid Apps Agreement
1. Go to **App Store Connect → Business**
2. Activate **Paid Apps Agreement**
3. Provide banking + tax info

> ✅ StoreKit will **not** return products until this is active.

## 2) Create IAP Products
Go to **App Store Connect → Your App → In‑App Purchases**

Example for skeleton config:
- **Product ID**: `app_lifetime`
- **Type**: Non‑Consumable
- **Price**: set in price schedule
- **Localization**: display name + description
- **Review**: screenshot + notes

Status should show **Ready to Submit**.

## 3) Upload a Binary (Critical)
Products will not load on device until **one binary is uploaded**.

```bash
cd mobile-app/ios

xcodebuild -workspace mobileapp.xcworkspace -scheme mobileapp \
  -configuration Release -archivePath build/mobileapp.xcarchive archive \
  CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=YOUR_TEAM_ID
```

Export and upload using **Transporter** (Mac App Store).

## 4) Sandbox Testing
1. Create **Sandbox Tester** in App Store Connect
2. On device: **Settings → App Store → Sandbox Account**
3. Sign in with the sandbox account

## Troubleshooting

| Problem | Solution |
|---|---|
| Products return empty `[]` | Upload a binary and ensure Paid Apps Agreement is active |
| Products still empty | Wait 1–4 hours for propagation |
| `initConnection` fails | Enable IAP capability on the App ID |
| Purchase fails | Re‑login sandbox account, restart app |

## Related Docs

- [IAP Overview](iap-overview.md)
- [Receipt Verification](receipt-verification.md)
- [App Store Connect](../03-platform-setup/app-store-connect.md)
