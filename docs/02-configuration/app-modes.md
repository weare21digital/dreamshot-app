# App Modes Configuration

The skeleton is controlled by **three mode settings** across two config files. These are the first things to set when forking a new app.

> Native modules require `npx expo run:ios` / `npx expo run:android` (Expo Go not supported).

## Overview

| Mode | File | Options | Default |
|------|------|---------|---------|
| `authMode` | `src/config/app.ts` | `'device'` · `'backend'` | `'device'` |
| `paymentMode` | `src/config/iap.ts` | `'device'` · `'backend'` | `'device'` |
| `accessMode` | `src/config/iap.ts` | `'freemium'` · `'paid'` · `'unlocked'` | `'freemium'` |

**Fully offline app** (no backend): `authMode: 'device'` + `paymentMode: 'device'`  
**Full backend app**: `authMode: 'backend'` + `paymentMode: 'backend'`

---

## Auth Mode (`src/config/app.ts`)

```ts
export const APP_CONFIG = {
  authMode: 'device',  // or 'backend'
};
```

### `'device'` — Local-only authentication
- Google/Apple sign-in stores user info in AsyncStorage (no API calls)
- Email login is **hidden** on WelcomeScreen (requires a backend to send codes)
- No JWT tokens, no refresh flow
- Logout just clears local storage
- **Use when:** App doesn't need a backend, or auth is just for personalization

### `'backend'` — Server-verified authentication
- Google idToken / Apple identityToken sent to your backend for verification
- Backend issues JWT access + refresh tokens
- Email magic-link login available (backend sends 6-char codes)
- Token refresh on 401 via `/auth/refresh-token` endpoint
- **Use when:** App needs server-side user accounts, synced data, or admin features

### What changes in device mode

| Feature | Device Mode | Backend Mode |
|---------|------------|--------------|
| Google Sign-In | ✅ Stores user locally | ✅ Sends idToken to backend |
| Apple Sign-In | ✅ Stores user locally | ✅ Sends identityToken to backend |
| Email Login | ❌ Hidden | ✅ Magic-link codes |
| Token Refresh | ❌ Skipped | ✅ Auto-refresh on 401 |
| Logout | Clears local storage | Calls API + clears storage |
| Profile Data | From AsyncStorage | From backend API |

---

## Payment Mode (`src/config/iap.ts`)

```ts
export const IAP_CONFIG = {
  paymentMode: 'device',  // or 'backend'
  // ...
};
```

### `'device'` — On-device StoreKit 2 verification
- Purchases verified locally using StoreKit 2's built-in cryptographic verification
- Premium status stored in AsyncStorage (`@iap_device_premium_status`)
- No backend needed for payments
- **Limitation:** Android doesn't have local crypto verification — use backend mode for Android

### `'backend'` — Server-side receipt verification
- Receipts sent to your backend API for verification
- Premium status stored in your database
- Required for subscription management, analytics, cross-platform sync

---

## Access Mode (`src/config/iap.ts`)

```ts
export const IAP_CONFIG = {
  accessMode: 'freemium',  // or 'paid' or 'unlocked'
  // ...
};
```

### `'freemium'` — Free app with optional premium
- App is fully usable for free
- Optional premium upgrade removes ads, unlocks features
- Premium button shown on ProfileScreen
- **Most common model** for consumer apps

### `'paid'` — Free download with IAP gate
- App downloaded free from App Store
- **PaywallGate** blocks access until user purchases premium
- User must buy before using the app
- Good for apps that can't offer a meaningful free tier

### `'unlocked'` — Paid App Store download
- App is a paid download on the App Store
- Everything unlocked from the start — no IAP, no ads
- `useDevicePremiumStatus` always returns `PREMIUM_LIFETIME`
- Premium buttons hidden on ProfileScreen
- **Simplest model** — no payment logic at all

---

## Common Configurations

### Simple offline app (no backend)
```ts
// src/config/app.ts
authMode: 'device'

// src/config/iap.ts
paymentMode: 'device'
accessMode: 'freemium'
```

### Paid app (no backend, no IAP)
```ts
// src/config/app.ts
authMode: 'device'

// src/config/iap.ts
accessMode: 'unlocked'
```

### Full-featured SaaS app
```ts
// src/config/app.ts
authMode: 'backend'

// src/config/iap.ts
paymentMode: 'backend'
accessMode: 'freemium'
```

---

## Related Docs
- [Payment Plans Configuration](payment-plans.md)
- [Payments Setup](../05-payments/payments.md)
- [Theming](theming.md)
- [Fork & Rename](../01-getting-started/fork-and-rename.md)
