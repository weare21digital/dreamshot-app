# Architecture Overview

> ⚠️ **Requires development builds**
> Native modules require **`npx expo run:ios`** / **`npx expo run:android`**. **Expo Go is not supported.**

This is a condensed version of `mobile-app/ARCHITECTURE.md`.

## Mobile App Structure

```
mobile-app/
├── app/                    # Routes (Expo Router)
│   ├── (main)/             # Main app screens
│   ├── auth/               # Auth screens
│   └── _layout.tsx
├── src/
│   ├── features/           # Business features (payments, ads, profile)
│   ├── components/         # UI components
│   │   ├── ui/             # Reusable themed components (11 components)
│   │   └── PaywallGate.tsx # IAP gate for 'paid' accessMode
│   ├── hooks/              # Shared hooks (auth, google, apple)
│   ├── services/           # Services (token, settings, payments)
│   ├── lib/                # Infrastructure (API client)
│   ├── config/             # Configuration
│   │   ├── app.ts          # authMode (device/backend)
│   │   ├── iap.ts          # paymentMode, accessMode, product IDs
│   │   └── theme.ts        # Brand colors, palettes, shapes
│   ├── contexts/           # React contexts (ThemeContext)
│   ├── utils/              # Utilities
│   └── types/              # Global types
```

## Organizational Principles

- **Features** live in `src/features/*` if they can be removed/toggled
- **Core** functionality stays in top‑level folders
- Avoid mixing business logic with UI

## Examples

- Payments → `features/payments/`
- Ads → `features/ads/`
- Auth → top‑level hooks/services (core)

## Related Docs

- [Feature Toggles](../02-configuration/feature-toggles.md)
