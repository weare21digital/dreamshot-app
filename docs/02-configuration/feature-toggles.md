# Feature Toggles

> ⚠️ **Requires development builds**
> Native modules require **`npx expo run:ios`** / **`npx expo run:android`**. **Expo Go is not supported.**

This project supports **config‑driven feature toggles** so you can enable/disable modules without deleting code.

## Existing Config Files

The skeleton already has three central config files that control major features:

| File | What it controls |
|------|-----------------|
| `src/config/app.ts` | `authMode` (device/backend) |
| `src/config/iap.ts` | `paymentMode`, `accessMode`, product IDs, SKU features |
| `src/config/theme.ts` | Brand colors, palettes, shapes, typography |

See [App Modes](app-modes.md) for full documentation of these modes.

## Adding Custom Feature Flags

For app-specific toggles (e.g., ads, notifications, biometrics), create `src/config/features.ts`:

```ts
// src/config/features.ts
export const APP_FEATURES = {
  pushNotifications: true,
  ads: false,
  biometricLock: true,
  i18n: { languages: ['en'], default: 'en' },
};
```

## How to Use

### 1) Guard UI entry points
Hide screens, tabs, and buttons when a feature is disabled:

```tsx
import { APP_FEATURES } from '@/config/features';

{APP_FEATURES.payments.enabled && (
  <PremiumButton />
)}
```

### 2) Guard hooks/services
Prevent network calls or side effects when disabled:

```ts
if (!APP_FEATURES.pushNotifications) {
  return;
}
```

### 3) Keep logic consistent
Always guard **both** the UI and the underlying service calls.

## Suggested Toggle Areas

- **Auth**: `email`, `google`, `apple`
- **Payments**: enable/disable payments entirely, configure plan types
- **Push Notifications**: disable on startup, enable when the app actually needs them
- **Ads**: banner, interstitial
- **Biometrics / Face ID**: not every app needs this — disable for simple apps
- **Security settings**: auto-lock, biometric auth screen
- **i18n** (allowed languages)

## Settings Screen

The Settings screen (`src/features/profile/screens/SettingsScreen.tsx`) should **only show options for enabled features**. When forking:

1. Review every section in the Settings screen
2. Remove or hide sections for features your app doesn't use
3. Common sections to remove for simple apps:
   - **Security Settings** (biometric/Face ID) — not needed for most consumer apps
   - **Notification Settings** — hide until you actually implement push notifications
   - **Auto-lock** — only relevant for apps with sensitive data

Example — conditionally showing settings sections:

```tsx
import { APP_FEATURES } from '@/config/features';

{/* Only show security settings if biometric lock is enabled */}
{APP_FEATURES.biometricLock && (
  <List.Item
    title="Security Settings"
    description="Face ID and auto-lock"
    onPress={navigateToSecuritySettings}
  />
)}

{/* Only show notification settings if push notifications are enabled */}
{APP_FEATURES.pushNotifications && (
  <List.Item
    title="Notifications"
    description="Manage push notifications"
    onPress={navigateToNotificationsSettings}
  />
)}
```

**Rule:** If a feature is disabled in `features.ts`, its settings entry should not appear. Users shouldn't see options for things the app doesn't support.

## Testing Strategy

- Add tests for features that are optional
- Validate UI hides when toggles are `false`
- Ensure no background side effects run when disabled

## Related Docs

- [Payment Plans](payment-plans.md)
- [IAP Overview](../05-payments/iap-overview.md)
