# Apple Sign‑In

> ⚠️ **Requires development builds**
> Apple Sign‑In uses native modules. **Expo Go is not supported.**
> Use **`npx expo run:ios`** for testing.

Apple Sign‑In is available on **iOS only** via `expo-apple-authentication`.

> **Device mode note:** When `authMode: 'device'` (in `src/config/app.ts`), Apple Sign-In stores user info locally — no backend verification needed. The identity token is not sent anywhere. See [App Modes](../02-configuration/app-modes.md).

## 1) Apple Developer Setup
1. Go to https://developer.apple.com/account/resources/
2. Select your **App ID** (matching your bundle identifier)
3. Enable **Sign in with Apple** capability

## 2) Mobile Configuration
- `expo-apple-authentication` plugin is already configured in `app.json`
- Apple Sign‑In button hides automatically on Android/Web

## 3) Backend Verification
Backend verifies Apple identity tokens by:
- Fetching Apple’s JWKS public keys
- Verifying the `idToken`
- Creating or linking user accounts

**Important:** The backend audience must match your bundle ID.
Update if you change bundle identifier:
- `backend/src/modules/auth` (apple auth service)

## 4) Test on Device/Simulator
Apple Sign‑In works on:
- Real iOS devices
- iOS simulator **with an Apple ID signed in**

```bash
cd mobile-app
npx expo run:ios
```

## Troubleshooting

- **Button not showing** → only available on iOS
- **Token verification fails** → mismatch in bundle ID/audience
- **Simulator sign‑in fails** → sign in to Apple ID in Simulator settings

## Related Docs

- [Apple Developer Portal](../03-platform-setup/apple-developer.md)
- [iOS Builds](../06-build-and-deploy/ios-build.md)
