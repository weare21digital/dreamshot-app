# Troubleshooting

Common issues in **Error Pattern → Diagnostic Command → Fix Command** format.

---

## 1) iOS first launch crash after clean build

**Error pattern**
- `AccessibilityManager is nil`

**Diagnostic command**
```bash
# Confirm this happened right after clean/prebuild
ls -la mobile-app/ios
```

**Fix command**
```bash
cd mobile-app
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
# If it crashes once, run it again (second launch typically works)
```

---

## 2) CocoaPods locale/encoding failure

**Error pattern**
- `invalid byte sequence in UTF-8`
- `Encoding::CompatibilityError`

**Diagnostic command**
```bash
ruby -v
locale
```

**Fix command**
```bash
cd mobile-app/ios
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install
```

Fallback (Ruby 3.3+ edge cases):
```bash
cat > /tmp/fix_encoding.rb << 'RUBY'
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8
RUBY
RUBYOPT="-r/tmp/fix_encoding.rb" pod install
```

---

## 3) NitroModules / new architecture errors

**Error pattern**
- `NitroModules not found`
- `react-native-iap ... requires new architecture`

**Diagnostic command**
```bash
grep -n "newArchEnabled" mobile-app/app.json
```

**Fix command**
```bash
cd mobile-app
rm -rf ios android build
npx expo prebuild --clean
npx expo run:ios
# or npx expo run:android
```

---

## 4) Xcode signing/provisioning failure

**Error pattern**
- `No profiles for '...{bundleId}...' were found`
- `Signing for "..." requires a development team`

**Diagnostic command**
```bash
xcodebuild -showBuildSettings -workspace mobile-app/ios/mobileapp.xcworkspace -scheme mobileapp | grep -E "DEVELOPMENT_TEAM|PRODUCT_BUNDLE_IDENTIFIER"
```

**Fix command**
```bash
# Preferred: open Xcode and enable Automatic Signing for your team
open mobile-app/ios/mobileapp.xcworkspace
```

---

## 5) Expo dev launcher appears instead of app UI

**Error pattern**
- App opens to Expo dev menu/launcher, not your routes

**Diagnostic command**
```bash
lsof -i :8081
```

**Fix command**
```bash
cd mobile-app
npx expo start --dev-client
xcrun simctl terminate booted {bundleId}
xcrun simctl launch booted {bundleId}
```

---

## 6) Blank screen or wrong initial route

**Error pattern**
- White screen with no obvious Metro error
- App always redirects to `/auth/welcome`

**Diagnostic command**
```bash
sed -n '1,120p' mobile-app/app/index.tsx
```

**Fix command**
```bash
# For non-auth apps, redirect directly to main tabs in app/index.tsx
# then rebuild
cd mobile-app
npx expo run:ios
```

---

## 7) Metro port already in use

**Error pattern**
- `Port 8081 is already in use`

**Diagnostic command**
```bash
lsof -i :8081
```

**Fix command**
```bash
npx expo start --port 8082 --clear
```

---

## 8) Google Sign-In Android `DEVELOPER_ERROR`

**Error pattern**
- `DEVELOPER_ERROR`

**Diagnostic command**
```bash
# debug keystore SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android | grep SHA1
```

**Fix command**
```bash
# Update SHA-1 in Google Cloud Console OAuth Android client,
# then rebuild app
cd mobile-app
npx expo run:android
```

---

## 9) Google Sign-In iOS URL scheme mismatch

**Error pattern**
- `Your app is missing support for the following URL schemes`

**Diagnostic command**
```bash
grep -n "iosUrlScheme" mobile-app/app.json
```

**Fix command**
```bash
# Set iosUrlScheme to reversed iOS client ID, then rebuild
cd mobile-app
npx expo run:ios
```

---

## 10) IAP products return empty array

**Error pattern**
- `getProducts` returns `[]`

**Diagnostic command**
```bash
grep -n "oneTime\|subscriptions" mobile-app/src/config/iap.ts
```

**Fix command**
```bash
# iOS:
# 1) Ensure Paid Apps Agreement is active
# 2) Ensure product IDs match exactly
# 3) Upload at least one binary to App Store Connect

# Android:
# 1) Activate products in Play Console
# 2) Add license testers
# 3) Upload internal test build
```

---

## 11) `adb` command not found

**Error pattern**
- `adb: command not found`

**Diagnostic command**
```bash
ls "$HOME/Library/Android/sdk/platform-tools/adb"
```

**Fix command**
```bash
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
adb devices
```
