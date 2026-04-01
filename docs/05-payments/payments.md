# Payments Configuration

## Overview

The skeleton supports two payment verification modes:

- **Device mode** (`'device'`) — StoreKit 2 on-device verification. No backend needed. Default.
- **Backend mode** (`'backend'`) — Receipts sent to your backend API for server-side verification.

Both modes use `react-native-iap` under the hood for the actual purchase flow. The difference is how purchases are verified and where premium status is stored.

## Quick Setup

### 1. Set your product IDs

Edit `src/config/iap.ts`:

```ts
export const IAP_CONFIG = {
  paymentMode: 'device',  // or 'backend'
  ios: {
    subscriptions: [],
    oneTime: ['com.yourapp.lifetime'],  // Your App Store Connect product ID
  },
  android: {
    subscriptions: ['com.yourapp.monthly', 'com.yourapp.yearly'],
    oneTime: ['com.yourapp.lifetime'],
  },
};
```

### 2. Set feature descriptions

Update `SKU_FEATURES` in the same file — these are shown on the Premium screen:

```ts
export const SKU_FEATURES: Record<string, string[]> = {
  'com.yourapp.lifetime': [
    'Ad-free experience',
    'All premium features',
    'Lifetime access',
  ],
};
```

### 3. Create the product in App Store Connect

1. Go to App Store Connect → Your App → In-App Purchases
2. Create a **Non-Consumable** product with the same ID as in `iap.ts`
3. Set the price tier
4. Add a review screenshot (required for submission)
5. Submit for review

That's it for device mode. No backend configuration needed.

## Payment Modes Explained

### Device Mode (Recommended for Simple Apps)

```
User taps Buy → StoreKit 2 payment sheet → Apple processes payment
→ App receives signed Transaction → Local crypto verification
→ Premium status saved to AsyncStorage → Done
```

**How it works:**
- Purchases are verified locally using StoreKit 2's cryptographically signed transactions
- Premium status is persisted in AsyncStorage (`@iap_device_premium_status`)
- On app launch and foreground, `getAvailablePurchases()` re-checks entitlements with Apple
- Restore purchases works via the same mechanism

**When to use:**
- iOS-only apps (or iOS first, Android later)
- Apps that don't need a backend
- Lifetime / one-time purchases
- Simple subscriptions

**Limitations:**
- No server-side purchase records (analytics via App Store Connect only)
- Refund detection requires polling Apple's API (not implemented)
- Android doesn't have equivalent local crypto verification — use backend mode for Android

### Backend Mode

```
User taps Buy → StoreKit 2 payment sheet → Apple processes payment
→ App sends receipt to backend → Backend verifies with Apple's API
→ Backend stores purchase → Premium status returned → Done
```

**When to use:**
- Apps that already have a backend
- When you need server-side purchase records
- Multi-platform (iOS + Android)
- When you need refund webhooks, analytics, or entitlement management

**Required backend endpoints:**
- `POST /payments/verify-receipt` — Validate receipt and store purchase
- `GET /payments/user/status` — Return user's premium status
- `GET /payments/plans` — Return available payment plans

The skeleton's NestJS backend already implements these.

## How Premium Status is Checked

### Device Mode
```
App launch → getAvailablePurchases() → Apple returns entitlements
→ Match against IAP_CONFIG product IDs → Update AsyncStorage
```

The `useDevicePremiumStatus` hook:
1. Calls `getAvailablePurchases()` to get all purchases for the Apple ID
2. Matches them against your configured product IDs
3. Returns `PREMIUM_LIFETIME`, `PREMIUM_SUBSCRIPTION`, or `FREE`
4. Persists to AsyncStorage for fast offline access
5. Re-checks when app comes to foreground

### Backend Mode
```
App launch → GET /payments/user/status → Backend returns status
```

The `usePremiumStatus` hook calls your backend API.

## Switching Modes

Change one line in `src/config/iap.ts`:

```ts
paymentMode: 'device',   // On-device verification
paymentMode: 'backend',  // Backend API verification
```

All hooks automatically use the correct implementation. No other code changes needed.

## Testing

### Option A: StoreKit Configuration File (Recommended for Development)

This lets you test purchases locally without App Store Connect:

1. In Xcode, go to **File → New → File → StoreKit Configuration File**
2. Add your product IDs with prices
3. In your scheme settings (**Product → Scheme → Edit Scheme**), set the StoreKit Configuration
4. Run the app — purchases will use the local sandbox

Benefits: Works in simulator, no Apple ID needed, instant transactions.

### Option B: Sandbox Testing (Closer to Production)

1. Create a **Sandbox Apple ID** in App Store Connect → Users and Access → Sandbox Testers
2. On your physical device: **Settings → App Store → Sandbox Account** — sign in with the sandbox ID
3. Run the app via `npx expo run:ios`
4. Purchase dialogs will show "[Environment: Sandbox]"

### What to Test

1. **Purchase flow** — Tap "Buy Lifetime Access", confirm in the payment sheet
2. **Premium status** — After purchase, Premium screen shows "You have Premium Access!"
3. **Profile badge** — Profile screen shows premium status chip
4. **Restore** — Delete the app, reinstall, tap "Restore Purchases"
5. **Persistence** — Kill the app, reopen — premium status should persist
6. **Dark mode** — Check premium screen in both light and dark themes

## Checking Premium Status in Your Code

Use the `usePremiumStatus` hook (works in both modes):

```tsx
import { usePremiumStatus } from '../features/payments/hooks/usePremiumStatus';
// or in device mode, it's automatically routed

function MyFeature() {
  const { data: status } = usePremiumStatus();
  
  if (status?.hasPremium) {
    return <PremiumContent />;
  }
  return <FreeContent />;
}
```

Or check directly from AsyncStorage in device mode:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const raw = await AsyncStorage.getItem('@iap_device_premium_status');
const status = raw ? JSON.parse(raw) : null;
const isPremium = status?.hasPremium ?? false;
```

## For New Apps (Fork Checklist)

1. ✅ Set `paymentMode` in `src/config/iap.ts`
2. ✅ Update product IDs to match your App Store Connect products
3. ✅ Update `SKU_FEATURES` with your feature descriptions
4. ✅ Create the IAP product in App Store Connect
5. ✅ Test with StoreKit Configuration File or Sandbox
6. ✅ Update privacy policy and terms URLs in `PremiumScreen.tsx` (`SubscriptionDisclosures` component)

## Architecture

```
src/config/iap.ts                    ← Product IDs + payment mode
src/services/payments/
  paymentService.ts                  ← react-native-iap wrapper (shared)
  paymentTypes.ts                    ← Type definitions
  usePayments.ts                     ← Core purchase flow hook
src/features/payments/
  hooks/
    usePremiumStatus.ts              ← Backend premium status
    useDevicePremiumStatus.ts        ← Device premium status
    useVerifyReceipt.ts              ← Backend receipt verification
    useDeviceVerifyReceipt.ts        ← Device receipt verification
    usePayment.ts                    ← Backend payment plans
    useDevicePaymentPlans.ts         ← Device payment plans
    useRestorePurchases.ts           ← Restore (auto-selects mode)
    usePendingVerifications.ts       ← Retry queue (auto-selects mode)
  screens/
    PremiumScreen.tsx                ← Payment UI (auto-selects mode)
  utils/
    extractReceipt.ts                ← Receipt data extraction
    pendingVerificationQueue.ts      ← Offline retry queue
```
