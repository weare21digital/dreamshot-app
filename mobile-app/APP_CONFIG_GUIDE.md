# App Configuration Guide

This guide explains the configurations in `app.json` and when you should modify them for your app.

## Essential Configurations to Change

### 1. App Identity

```json
{
  "name": "mobile-app", // ← Change to your app name
  "slug": "mobile-app", // ← Change to your app slug (lowercase, no spaces)
  "version": "1.0.0" // Update as you release new versions
}
```

### 2. Bundle Identifiers

**CRITICAL**: These must be unique and match your Firebase configuration.

```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.mobileapp" // ← Change to your reverse domain
  },
  "android": {
    "package": "com.yourcompany.mobileapp" // ← Must match iOS bundle ID format
  }
}
```

**Format**: `com.{company}.{appname}` (all lowercase, no spaces or special chars)

Examples:

- `com.acme.myawesomeapp`
- `com.startup.productname`
- `com.yourname.appname`

### 3. Firebase Configuration

**IMPORTANT**: These lines are NOT in the default `app.json`. You must add them AFTER downloading your Firebase config files.

After creating Firebase apps and downloading the config files to `mobile-app/` root, add these lines to `app.json`:

```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.mobileapp",
    "googleServicesFile": "./GoogleService-Info.plist",  // ← ADD THIS LINE
    "infoPlist": { ... }
  },
  "android": {
    "package": "com.yourcompany.mobileapp",
    "googleServicesFile": "./google-services.json"      // ← ADD THIS LINE
  }
}
```

**Steps**:

1. Download `google-services.json` from Firebase (for Android)
2. Download `GoogleService-Info.plist` from Firebase (for iOS)
3. Place both files in `mobile-app/` directory
4. Add the `googleServicesFile` lines to `app.json` as shown above

See the [Push Notifications Setup](#push-notifications-setup) section in README.md for complete Firebase setup instructions.

### 4. URL Scheme (Deep Linking)

```json
{
  "scheme": "mobile-app", // ← Change to your app's custom scheme
  "intentFilters": [
    {
      "data": [
        {
          "scheme": "mobile-app" // ← Must match the scheme above
        }
      ]
    }
  ]
}
```

This allows URLs like `mobile-app://some/path` to open your app.

## Pre-configured Plugins

The following plugins are included with sensible defaults. You can customize them or remove if not needed.

### expo-camera

For QR code scanning, photo/video capture.

```json
{
  "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
}
```

**Customize**: Update permission message to explain why your app needs camera access.

**Remove if**: Your app doesn't need camera access at all.

### expo-location

For location-based features (nearby places, weather, etc).

```json
{
  "locationWhenInUsePermission": "Allow $(PRODUCT_NAME) to access your location."
}
```

**Customize**:

- Update permission message to explain your specific use case
- Add `locationAlwaysAndWhenInUsePermission` if you need background location

**Remove if**: Your app doesn't use location services.

### expo-secure-store

For securely storing sensitive data (tokens, credentials, etc).

**No configuration needed** - works out of the box.

**Remove if**: You don't store any sensitive data locally (unlikely).

### expo-notifications

For push notifications.

```json
{
  "icon": "./assets/icon.png", // Notification icon
  "color": "#ffffff" // Notification color (Android)
}
```

**Customize**:

- `icon`: Path to your notification icon (Android uses a monochrome version)
- `color`: Your brand color for notification badge/accent

**Remove if**: Your app doesn't need push notifications (rare).

See [Push Notifications Setup](#push-notifications-setup) in README.md for complete setup.

## Optional Configurations

### Theme

```json
{
  "userInterfaceStyle": "light" // Options: "light", "dark", "automatic"
}
```

**Options**:

- `"light"`: Force light mode only
- `"dark"`: Force dark mode only
- `"automatic"`: Follow system theme

### Orientation

```json
{
  "orientation": "portrait" // Options: "portrait", "landscape", "default"
}
```

**Options**:

- `"portrait"`: Lock to portrait (recommended for most apps)
- `"landscape"`: Lock to landscape (games, video apps)
- `"default"`: Allow rotation

### New Architecture

```json
{
  "newArchEnabled": true // Enable React Native new architecture
}
```

**Recommended**: Keep `true` for better performance and future compatibility.

## iOS-Specific Configurations

### Export Compliance

```json
{
  "ios": {
    "infoPlist": {
      "ITSAppUsesNonExemptEncryption": false
    }
  }
}
```

**Required for App Store**: Declares whether your app uses encryption.

**Set to `false`** if:

- You only use standard iOS encryption (HTTPS, etc.)
- You don't implement custom encryption

**Set to `true`** and provide documentation if:

- You implement custom encryption algorithms
- You use end-to-end encryption

### Tablet Support

```json
{
  "ios": {
    "supportsTablet": true
  }
}
```

**Keep `true`**: Allows your app to run on iPads.

## Android-Specific Configurations

### Edge-to-Edge

```json
{
  "android": {
    "edgeToEdgeEnabled": true
  }
}
```

**Recommended**: Enables modern Android edge-to-edge display.

### Adaptive Icon

```json
{
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    }
  }
}
```

**Customize**: Set `backgroundColor` to your brand color or dominant icon color.

## Assets to Replace

Before publishing, replace these placeholder assets with your own:

```
assets/
├── icon.png                  # App icon (1024x1024)
├── adaptive-icon.png         # Android adaptive icon (1024x1024)
├── splash-icon.png          # Splash screen logo
└── favicon.png              # Web favicon
```

**Icon Guidelines**:

- **App Icon**: 1024x1024px, no transparency
- **Adaptive Icon**: 1024x1024px, keep important content in center 768x768px
- **Splash Icon**: Your logo on transparent background
- **Favicon**: 48x48px or larger

## Testing Your Configuration

After making changes:

1. **Validate JSON**: Ensure `app.json` is valid JSON
2. **Clear cache**: `npx expo start --clear`
3. **Rebuild**: Changes to plugins/native config require rebuild
   ```bash
   npx eas-cli build --profile development --platform all
   ```

## Common Mistakes

❌ **Bundle ID mismatch**: iOS `bundleIdentifier` ≠ Android `package`
✅ **Use same ID**: Both should be identical

❌ **Forgot to update scheme**: Still using `mobile-app://`
✅ **Custom scheme**: Use your app name, e.g., `myapp://`

❌ **Missing Firebase files**: Config files not in root directory
✅ **Correct placement**: Both files in `mobile-app/` directory

❌ **Vague permissions**: "Allow camera access"
✅ **Specific reason**: "Allow camera to scan QR codes for payments"

## Environment-Specific Configs

For different environments (dev/staging/prod), consider:

1. **Multiple Firebase Projects**: Create separate projects for each environment
2. **App Variants**: Use different bundle IDs like:
   - Dev: `com.company.app.dev`
   - Staging: `com.company.app.staging`
   - Prod: `com.company.app`
3. **EAS Build Profiles**: Configure in `eas.json`

## Additional Resources

- [Expo App Config Documentation](https://docs.expo.dev/workflow/configuration/)
- [iOS Info.plist Keys](https://developer.apple.com/documentation/bundleresources/information_property_list)
- [Android Manifest](https://docs.expo.dev/versions/latest/config/app/#android)
- [Firebase Setup Guide](./README.md#push-notifications-setup)
