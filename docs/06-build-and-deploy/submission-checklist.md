# Submission Checklist

Use this checklist before submitting to App Store or Google Play.

> This app uses native modules — test with `npx expo run:ios` / `npx expo run:android`, not Expo Go.

## Device Mode vs Backend Mode

**If using `authMode: 'device'` + `paymentMode: 'device'`** — you can skip the entire "Backend & Environment" section below. Device mode apps don't need a backend server.

**If using `authMode: 'backend'` or `paymentMode: 'backend'`** — complete all backend setup steps.

---

## App Identity
- [ ] `app.json` updated (name, slug, bundle ID, package)
- [ ] App icon, splash, and adaptive icon replaced
- [ ] Version + build numbers incremented
- [ ] `src/config/theme.ts` updated with brand colors
- [ ] `src/config/iap.ts` product IDs match App Store Connect / Play Console

## Backend & Environment (Backend Mode Only)

Skip this section if using device mode.

- [ ] Production backend deployed and accessible
- [ ] `.env` values updated for prod API URLs
- [ ] OAuth client IDs for prod configured (Google, Apple)
- [ ] Receipt verification endpoints enabled and tested
- [ ] Database migrations applied
- [ ] CORS configured for mobile app origins

## iOS (App Store)

### Pre-Build
- [ ] App Store Connect app created
- [ ] Bundle ID registered in Apple Developer Portal
- [ ] Capabilities enabled (Sign in with Apple, IAP)
- [ ] Paid Apps Agreement active (if using IAP)
- [ ] IAP products created and marked "Ready to Submit"
- [ ] Privacy policy URL ready (required for submission)

### Build & Upload
- [ ] `ExportOptions.plist` created with correct provisioning profile and signing identity
- [ ] IPA built via `xcodebuild archive` + `xcodebuild -exportArchive`
- [ ] IPA uploaded via **Transporter** app
- [ ] TestFlight build processed successfully (check App Store Connect → TestFlight)

**ExportOptions.plist template:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
```

Place this in `mobile-app/ios/ExportOptions.plist` and replace `YOUR_TEAM_ID` with your Apple Developer Team ID.

## Android (Play Console)
- [ ] Play Console app created
- [ ] App signing configured
- [ ] AAB uploaded to Internal/Production
- [ ] In‑app products active
- [ ] Data safety form completed

## QA
- [ ] Test purchases in sandbox
- [ ] Validate login flows (email/Google/Apple)
- [ ] Verify push notifications (if enabled)
- [ ] Verify backend connectivity on device

## Store Screenshot Automation

### iOS simulator screenshot command

```bash
xcrun simctl io booted screenshot ~/path/screenshot.png
```

### Required iOS screenshot targets

- **6.7" (iPhone 16 Pro Max):** 1290×2796
- **6.5" (iPhone 15 Plus):** 1242×2688

Use matching simulator devices before capturing, then resize if needed:

```bash
sips -z HEIGHT WIDTH input.png --out output.png
```

### Android screenshot command

```bash
adb exec-out screencap -p > screenshot.png
```

### Play Store feature graphic

- Required size: **1024×500**

## Assets
- [ ] Store screenshots (required sizes)
- [ ] Feature graphic (Android, 1024×500)
- [ ] App description + keywords

## Related Docs

- [iOS Builds](ios-build.md)
- [Android Builds](android-build.md)
- [App Store Connect](../03-platform-setup/app-store-connect.md)
- [Google Play Console](../03-platform-setup/google-play-console.md)
