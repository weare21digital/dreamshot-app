# Google OAuth Setup Guide

Google Sign-In uses the **native SDK** (`@react-native-google-signin/google-signin`), not browser-based OAuth. This requires native builds (EAS or local), not Expo Go.

## 1. Google Cloud Console

### Create Project & Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services → OAuth consent screen**
4. Configure External consent screen with scopes: `email`, `profile`, `openid`

### Create OAuth 2.0 Client IDs

Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**:

| Client Type | Used For | Key Config |
|-------------|----------|-----------|
| **Web application** | Backend token verification + web client ID for native SDK | Authorized origins: `http://localhost:8081` |
| **Android** | Android native sign-in | Package: `com.mobileskeleton.app`, SHA-1 fingerprint |
| **iOS** | iOS native sign-in | Bundle ID: `com.mobileskeleton.app` |

### Get SHA-1 Fingerprint (Android)

```bash
# From EAS (recommended)
eas credentials -p android

# From local debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android
```

## 2. Firebase Setup (for service config files)

The native Google Sign-In SDK needs `google-services.json` (Android) and `GoogleService-Info.plist` (iOS).

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project **linked to the same Google Cloud project**
3. Add an **Android app** (package: `com.mobileskeleton.app`) → download `google-services.json`
4. Add an **iOS app** (bundle ID: `com.mobileskeleton.app`) → download `GoogleService-Info.plist`
5. Place both files in `mobile-app/` (already referenced in `app.json`)

## 3. Configuration

### Backend (`backend/.env`)
```env
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

### Mobile (`mobile-app/.env`)
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

### Plugin Config (`mobile-app/app.json`)

Update the `iosUrlScheme` in the Google Sign-In plugin to your iOS client's reversed client ID:
```json
["@react-native-google-signin/google-signin", {
  "iosUrlScheme": "com.googleusercontent.apps.YOUR-IOS-CLIENT-ID"
}]
```
Find this value in `GoogleService-Info.plist` as `REVERSED_CLIENT_ID`.

## 4. How It Works

1. Mobile app calls `GoogleSignin.signIn()` → native Google UI
2. User authenticates → SDK returns an `idToken`
3. Mobile sends `idToken` to `POST /auth/google`
4. Backend verifies token with `google-auth-library` using `GOOGLE_CLIENT_ID`
5. Backend creates/links user account, returns JWT tokens

**Important**: The `webClientId` is used on **both** Android and iOS to request an `idToken` suitable for backend verification. The `iosClientId` is additionally needed on iOS for the correct URL scheme.

## 5. Testing

Google Sign-In **does not work in Expo Go** — you need a development build:

```bash
cd mobile-app
npm run build:dev:android   # or build:dev:ios
```

## 6. Troubleshooting

| Issue | Solution |
|-------|---------|
| "DEVELOPER_ERROR" (Android) | Wrong SHA-1 fingerprint. Check `eas credentials -p android` and update in Google Cloud |
| "Invalid client ID" | Verify the Web client ID matches in backend `.env` and mobile `.env` |
| No `idToken` returned | Ensure `webClientId` is set (it's the Web client ID, not Android/iOS) |
| "Google Play Services not available" | Use a real device or Google Play-enabled emulator |
| Sign-in cancelled | Normal user behavior — app handles this gracefully |
