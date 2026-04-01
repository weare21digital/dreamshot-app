# Dependency Versions

> **Policy: Pin to current working versions. No major upgrades unless required.**

## Why This Matters

Every app forked from the skeleton should **work immediately** with the exact dependency versions already tested and validated. Major version upgrades introduce breaking changes that can cost hours of debugging per app.

**Rules:**
1. Use `^` (caret) for dependencies — allows minor and patch updates within the same major version
2. Use `~` (tilde) for Expo packages — these are tightly coupled to the SDK version
3. **Never upgrade to a new major version** unless there's a specific blocker that requires it
4. When a major upgrade is needed, do it in the skeleton first, validate, then propagate

## Current Pinned Versions (as of Feb 2026)

### Core Platform

| Package | Version | Notes |
|---------|---------|-------|
| `expo` | `^54.0.8` | SDK 54 — do not upgrade to 55+ without testing all plugins |
| `react` | `^19.1.0` | React 19 |
| `react-native` | `^0.81.5` | Must match Expo SDK 54 |
| `react-dom` | `^19.1.0` | Must match react version |
| `typescript` | `~5.9.2` | |

### Expo Packages

All Expo packages use `~` (tilde) to stay within the SDK 54 compatible range:

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-router` | `~6.0.23` | File-based routing |
| `expo-notifications` | `~0.32.16` | Push notifications |
| `expo-apple-authentication` | `~8.0.8` | Apple Sign-In |
| `expo-auth-session` | `~7.0.10` | OAuth sessions |
| `expo-secure-store` | `~15.0.8` | Secure storage |
| `expo-crypto` | `~15.0.8` | Crypto utilities |
| `expo-local-authentication` | `~17.0.8` | Biometric auth |
| `expo-dev-client` | `~6.0.20` | Dev client builds |
| `expo-status-bar` | `~3.0.9` | Status bar control |
| `expo-web-browser` | `~15.0.10` | In-app browser |
| `expo-navigation-bar` | `~5.0.10` | Android nav bar |
| `expo-build-properties` | `^1.0.10` | Native build config |

### Native Modules (Critical — version-sensitive)

| Package | Version | Notes |
|---------|---------|-------|
| `react-native-iap` | `^14.7.7` | **Requires `newArchEnabled: true`** — uses NitroModules |
| `react-native-nitro-modules` | `^0.33.5` | Required by react-native-iap v14 |
| `@react-native-google-signin/google-signin` | `^16.1.1` | Native Google Sign-In |
| `react-native-screens` | `~4.16.0` | Navigation screens |
| `react-native-safe-area-context` | `~5.6.0` | Safe area handling |
| `react-native-paper` | `^5.14.5` | UI component library |
| `react-native-mmkv` | `^4.1.2` | Fast key-value storage |

### State & Data

| Package | Version |
|---------|---------|
| `@tanstack/react-query` | `^5.90.12` |
| `react-hook-form` | `^7.62.0` |
| `@hookform/resolvers` | `^5.2.1` |
| `yup` | `^1.7.0` |
| `axios` | `^1.13.2` |
| `@react-native-async-storage/async-storage` | `^2.2.0` |

### Backend (NestJS)

| Package | Version | Notes |
|---------|---------|-------|
| `@nestjs/core` | `^10.4.15` | NestJS 10 — do not upgrade to 11 |
| `@nestjs/common` | `^10.4.15` | |
| `@nestjs/platform-express` | `^10.4.15` | |
| `@nestjs/config` | `^3.3.0` | |
| `@nestjs/jwt` | `^10.2.0` | |
| `@nestjs/passport` | `^10.0.3` | |
| `@nestjs/schedule` | `^4.1.2` | |
| `@prisma/client` | `^6.19.2` | Prisma 6 |
| `prisma` | `^6.19.2` | |
| `zod` | `^4.1.13` | Config validation |
| `bcrypt` | `^6.0.0` | |
| `resend` | `^4.0.1` | Email service |
| `google-auth-library` | `^10.2.1` | Google token verification |
| `jsonwebtoken` | `^9.0.3` | JWT handling |
| `jwks-rsa` | `^3.2.2` | Apple JWKS verification |

## When Forking a New App

1. **Copy `package.json` as-is** — the `^` ranges will allow compatible updates automatically
2. Run `npm install` — this respects the version ranges in package.json
3. **Do not run `npm update --latest`** or manually bump major versions
4. `npx expo install --fix` is OK for aligning Expo packages to the current SDK
5. If a major version upgrade is needed, do it **in the skeleton first**, test, then propagate

## When to Upgrade

Only upgrade when:
- A **security vulnerability** requires it (check with `npm audit`)
- A **bug fix** in a newer version solves a specific problem you're hitting
- A **new feature** you need is only available in a newer version
- Apple/Google **store requirements** force a minimum SDK version

**Never upgrade because:**
- ❌ A new version just came out
- ❌ `npm outdated` shows updates available
- ❌ Someone on Stack Overflow said to use the latest

## Upgrade Process

1. Create a branch in the skeleton: `git checkout -b upgrade/package-name-vX`
2. Update the package version in `package.json`
3. Run `npm install`
4. Build for iOS: `npx expo run:ios`
5. Build for Android: `npx expo run:android`
6. Test all affected features (auth, payments, etc.)
7. If everything works, merge to main
8. Update this doc with the new version
9. Propagate to forked apps one at a time

## Known Compatibility Constraints

- **react-native-iap v14** requires `newArchEnabled: true` (NitroModules) — cannot use old arch
- **Expo SDK 54** requires React Native 0.81+ — don't downgrade RN
- **@react-native-google-signin v16** requires native builds — no Expo Go
- **expo-apple-authentication** requires iOS entitlements — simulator needs Apple ID signed in
- **Prisma 6** has breaking changes from Prisma 5 — don't mix versions between skeleton and forks

## Related Docs

- [App Config](app-config.md) — `app.json` settings including `newArchEnabled`
- [Feature Toggles](feature-toggles.md) — enable/disable features without removing dependencies
- [Troubleshooting](../07-reference/troubleshooting.md) — common version-related errors
