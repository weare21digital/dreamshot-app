# Mobile Skeleton App Documentation

## 🚀 [Zero to App Store →](00-zero-to-store.md)

**The complete guide.** Design → spec → enrich → build → test → submit. Start here.

Contains copy-paste AI prompts for every step (spec generation, audit, enrichment, build).

## 📋 [App Specs →](../specs/README.md)

**Spec format reference.** Requirements → design → tasks. The AI reads these to know what to build.

---

> **Note:** This project uses native modules — `npx expo run:ios` / `npx expo run:android` required (Expo Go not supported).

## Quick Start: 3 Files to Customize

When forking for a new app, these three config files control everything:

| File | Controls |
|------|----------|
| `src/config/app.ts` | Auth mode (device/backend) |
| `src/config/iap.ts` | Payment mode, access mode, product IDs |
| `src/config/theme.ts` | Brand colors, light/dark palettes, shapes |
| `specs/<app-name>/` | App feature specs (requirements, design, tasks) |

Plus `app.json` for app name, bundle ID, and platform config. See [App Modes](02-configuration/app-modes.md) for details.

## Documentation Index

### 01. Getting Started
- [**Design Mockups**](01-getting-started/design-mockups.md) ← Start with design
- [Fork & Rename the App](01-getting-started/fork-and-rename.md)
- [Local Development Setup](01-getting-started/local-dev-setup.md)
- [Emulator Setup (iOS + Android)](01-getting-started/emulator-setup.md)

### 02. Configuration
- [**App Modes (authMode, paymentMode, accessMode)**](02-configuration/app-modes.md) ← Start here
- [App Config (app.json)](02-configuration/app-config.md)
- [Theming](02-configuration/theming.md)
- [UI Component Library](02-configuration/ui-components.md)
- [Payment Plans Configuration](02-configuration/payment-plans.md)
- [App Flow & Navigation Patterns](02-configuration/app-flow.md)
- [Feature Toggles](02-configuration/feature-toggles.md)
- [Dependency Versions](02-configuration/dependency-versions.md)

### 03. Platform Setup
- [Apple Developer Portal](03-platform-setup/apple-developer.md)
- [App Store Connect + Transporter](03-platform-setup/app-store-connect.md)
- [Google Play Console](03-platform-setup/google-play-console.md)
- [Android Config File (`google-services.json`)](03-platform-setup/android-config-file.md)

### 04. Authentication
- [Google OAuth (Native Sign-In)](04-authentication/google-oauth.md)
- [Apple Sign-In](04-authentication/apple-sign-in.md)
- [Email/Password Auth](04-authentication/email-auth.md)

### 05. Payments
- [**Payments Configuration**](05-payments/payments.md) ← Start here
- [IAP Overview](05-payments/iap-overview.md)
- [App Store IAP Setup](05-payments/app-store-iap.md)
- [Google Play IAP Setup](05-payments/google-play-iap.md)
- [Receipt Verification Flow](05-payments/receipt-verification.md)
- [StoreKit Testing Guide](05-payments/storekit-testing.md)
- [Local Payments v1 Guardrails](05-payments/local-v1-guardrails.md)

### 06. Build & Deploy
- [iOS Builds](06-build-and-deploy/ios-build.md)
- [Android Builds](06-build-and-deploy/android-build.md)
- [Android Signing](06-build-and-deploy/android-signing.md)
- [ExportOptions.plist Guide](06-build-and-deploy/export-options.md)
- [**Device Installation (iOS + Android)**](06-build-and-deploy/device-installation.md) ← WiFi & USB
- [Submission Checklist](06-build-and-deploy/submission-checklist.md)

### 07. Reference
- [Architecture Overview](07-reference/architecture.md)
- [**UX Patterns**](07-reference/ux-patterns.md) ← Dark theme, pickers, forms, accessibility
- [**Platform Gotchas**](07-reference/platform-gotchas.md) ← Hard-won lessons (Expo, RN, iOS, Android)
- [**Notifications**](07-reference/notifications.md) ← CALENDAR triggers, deterministic IDs, lifecycle
- [IAP Integration Status](07-reference/iap-integration-status.md)
- [Troubleshooting](07-reference/troubleshooting.md)
- [Network Setup](07-reference/network-setup.md)
