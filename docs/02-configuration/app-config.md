# App Config (`app.json`)

> ⚠️ **Requires development builds**
> Native modules require **`npx expo run:ios`** / **`npx expo run:android`**. **Expo Go is not supported.**

This guide explains the most important settings in `mobile-app/app.json` and when to update them.

## Essential Identity Settings

```json
{
  "name": "mobile-app",
  "slug": "mobile-app",
  "version": "1.0.0"
}
```

- **name**: App display name (shown on device)
- **slug**: Expo project slug (lowercase, no spaces)
- **version**: Update with releases

## Bundle Identifiers

```json
{
  "ios": { "bundleIdentifier": "com.mobileskeleton.app" },
  "android": { "package": "com.mobileskeleton.app" }
}
```

- Must be **unique** and **match** across iOS and Android.
- Must match your Apple/Google platform registrations.


## Android `google-services.json` (build-time requirement)

Android builds use the Google Services Gradle plugin, so keep this in `app.json`:

```json
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

This is a build-time requirement for Android, not an iOS requirement.

## Deep Linking Scheme

```json
{
  "scheme": "mobile-app",
  "intentFilters": [
    {
      "action": "VIEW",
      "data": [{ "scheme": "mobile-app" }],
      "category": ["BROWSABLE", "DEFAULT"]
    }
  ]
}
```

Keep scheme in sync with `mobile-app/src/utils/deepLinking.ts` and backend email links.

## Required Plugins

These plugins are configured in `app.json`:

- `react-native-iap` — IAP support
- `@react-native-google-signin/google-signin` — Google Sign-In
- `expo-apple-authentication` — Apple Sign-In (iOS)
- `expo-notifications` — push notifications
- `expo-router` — file-based routing

When you change plugin config, **rebuild** the native app.

## New Architecture

```json
{ "newArchEnabled": true }
```

**Keep this enabled.** `react-native-iap` v14+ requires the new architecture (NitroModules).

## Common Customizations

- **Permissions**: update plugin permission strings for your use case
- **Icons**: update `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`
- **Orientation**: `portrait`, `landscape`, or `default`
- **Theme**: `userInterfaceStyle` to `light`, `dark`, or `automatic`

## After Editing `app.json`

Run a clean rebuild:
```bash
cd mobile-app
rm -rf ios android build
npx expo run:ios   # or npx expo run:android
```

## Related Docs

- [Google OAuth](../04-authentication/google-oauth.md)
- [Android Config File](../03-platform-setup/android-config-file.md)
