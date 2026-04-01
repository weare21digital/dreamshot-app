# iOS In-App Purchase Integration - Status & Handoff

> **Last Updated:** February 4, 2026

## 🎯 Goal

Enable iOS In-App Purchase (IAP) functionality in `mobile-skeleton-app` for sandbox testing and eventually production.

---

## ✅ What's Been Completed

### App Code

- **IAP Service** implemented in `src/services/payments/paymentService.ts`
- **Premium Screen** UI at `src/features/payments/screens/PremiumScreen.tsx`
- **SKU Configuration** in `src/config/iap.ts`:
  ```typescript
  ios: {
    subscriptions: [],
    oneTime: ['app_lifetime'],  // Currently testing with this
  }
  ```
- **Backend verification** endpoint ready at `/api/payments/verify` and `/api/payments/user/status`
- **Database schema** updated with `platform` field for payments table
- **Logging** added to `paymentService.ts` for debugging product fetching

### App Store Connect

| Item           | Value                             | Status        |
| -------------- | --------------------------------- | ------------- |
| Bundle ID      | `com.mobileskeleton.app`          | ✅ Configured |
| IAP Product ID | `app_lifetime`                    | ✅ Created    |
| IAP Type       | Non-Consumable                    | ✅            |
| IAP Status     | Ready to Submit                   | ✅            |
| IAP Capability | Enabled in Apple Developer Portal | ✅            |

---

## ❌ Current Blocker

### Paid Apps Agreement NOT Active

The **Paid Apps Agreement** in App Store Connect is not yet active. This is blocking StoreKit from returning any products.

**Current Status:**

| Agreement               | Status                   |
| ----------------------- | ------------------------ |
| Free Apps Agreement     | ✅ Active                |
| **Paid Apps Agreement** | ⚠️ **Pending User Info** |

**Location:** [App Store Connect → Agreements, Tax, and Banking](https://appstoreconnect.apple.com/agreements)

### Required Actions to Resolve:

1. **Complete Bank Account Information**
   - Add bank details for receiving payments

2. **Complete Tax Forms**
   - W-8BEN for non-US developers
   - W-9 for US developers

3. **Wait for Apple Verification**
   - Usually instant, but can take up to 24-48 hours

> ⚠️ **IMPORTANT:** Until the Paid Apps Agreement status shows "Active", StoreKit will return empty products. This is 100% the reason IAP products aren't loading.

---

## 🧪 How to Test (After Agreements Become Active)

### Step 1: Create a Sandbox Tester Account

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Users and Access** → **Sandbox** → **Testers**
3. Click **+** to add a new sandbox tester
4. Use any email (doesn't need to be real, e.g., `sandbox-test@mailinator.com`)
5. Set password, name, and **App Store Territory** to your country

### Step 2: Sign into Sandbox on iOS Device

1. On your iOS device, go to: **Settings** → **App Store** → scroll down → **Sandbox Account**
2. Sign in with the sandbox tester credentials
3. ⚠️ **Don't sign out of your regular Apple ID** - Sandbox is a separate section

### Step 3: Run Development Build

```bash
cd mobile-app
npm run start
```

Open the development client on your iOS device (must be on the same WiFi network as your development machine).

### Step 4: Navigate to Premium Screen

1. In the app, go to the Premium/Plans screen
2. Check Metro console logs for:
   ```
   🧾 [Payments] Fetching products... {"productIds": ["app_lifetime"], "subscriptionIds": []}
   🧾 [Payments] Products fetched: {"products": [...], "productsCount": 1}
   ```
3. If products load successfully (`productsCount: 1`), tap to purchase
4. Sandbox payment sheet should appear

---

## 📁 Key Files Reference

| File                                                                | Purpose                                     |
| ------------------------------------------------------------------- | ------------------------------------------- |
| `src/config/iap.ts`                                                 | SKU configuration per platform              |
| `src/services/payments/paymentService.ts`                           | IAP service wrapper around react-native-iap |
| `src/services/payments/usePayments.ts`                              | React hook for payment state management     |
| `src/services/payments/paymentTypes.ts`                             | TypeScript types for payments               |
| `src/features/payments/screens/PremiumScreen.tsx`                   | Premium plans UI screen                     |
| `src/features/payments/hooks/useVerifyReceipt.ts`                   | Hook for backend receipt verification       |
| `src/features/payments/hooks/useRestorePurchases.ts`                | Hook for restoring previous purchases       |
| `backend/src/modules/payments/`                                     | Backend payment verification module         |
| `backend/src/modules/payments/interfaces/verification.interface.ts` | SKU allow-list and types                    |
| `.env`                                                              | API URLs (`EXPO_PUBLIC_API_URL_IOS`)        |

---

## 🔜 Remaining Work

### Immediate (After Agreements Active)

- [ ] Complete Paid Apps Agreement (current blocker)
- [ ] Test iOS sandbox purchase flow end-to-end
- [ ] Verify backend receipt verification works

### Short Term

- [ ] Create subscription products in App Store Connect:
  - `app_pro_monthly` (Auto-Renewable Subscription)
  - `app_pro_yearly` (Auto-Renewable Subscription)
- [ ] Update `src/config/iap.ts` with subscription SKUs
- [ ] Add subscription UI to PremiumScreen

### Android (Not Started)

- [ ] Create products in Google Play Console
- [ ] Configure Android SKUs in `src/config/iap.ts`
- [ ] Test Android sandbox flow
- [ ] Backend Google Play receipt verification

### Production

- [ ] Deploy backend to production server
- [ ] Configure production API URLs
- [ ] Submit app with IAP to App Store for review

---

## 🐛 Debugging Guide

### Products Not Loading (`productsCount: 0`)

Check Metro logs for `🧾 [Payments]` messages:

```
🧾 [Payments] Fetching products... {"productIds": ["app_lifetime"], "subscriptionIds": []}
🧾 [Payments] Products fetched: {"products": [], "productsCount": 0}
```

**If count is 0, verify:**

1. ✅ **Paid Apps Agreement is Active** (most common issue!)
   - App Store Connect → Agreements, Tax, and Banking

2. ✅ **Bundle ID matches exactly**
   - `app.json` → `ios.bundleIdentifier` = `com.mobileskeleton.app`
   - Must match App Store Connect

3. ✅ **Product ID matches exactly** (case-sensitive)
   - Code: `app_lifetime`
   - App Store Connect Product ID: `app_lifetime`

4. ✅ **IAP Status is "Ready to Submit"** or "Approved"
   - App Store Connect → Your App → In-App Purchases

5. ✅ **In-App Purchase capability enabled**
   - Apple Developer Portal → Identifiers → `com.mobileskeleton.app` → Capabilities → In-App Purchase ✓

6. ✅ **Development build has IAP capability**
   - Rebuild if capability was enabled after last build:
   ```bash
   eas build --platform ios --profile development --clear-cache
   ```

### Network Errors

If the app can't reach the backend:

1. Ensure device is on the **same WiFi network** as development machine
2. Check `.env` for correct IP:
   ```
   EXPO_PUBLIC_API_URL_IOS=http://YOUR_LOCAL_IP:3000/api
   ```
3. Verify backend is running: `npm run dev` in `backend/` directory

---

## 📚 Related Documentation

- [react-native-iap Documentation](https://react-native-iap.dooboolab.com/)
- [Apple In-App Purchase Configuration](https://developer.apple.com/in-app-purchase/)
- [App Store Connect Help - Agreements](https://help.apple.com/app-store-connect/#/devb6df5ee51)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

## 👤 Contact

For questions about this integration, check the commit history or reach out to the development team.
