# iOS Builds

This guide covers local iOS builds for development and release.

> Native modules require **`npx expo run:ios`** (Expo Go not supported).

## Prerequisites

- macOS with **Xcode 26+**
- CocoaPods (`gem install cocoapods`)
- Apple Developer account for device builds

## Development Build (Simulator)

```bash
cd mobile-app
rm -rf ios build
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
```

For a specific simulator:
```bash
xcrun simctl list devices available | grep iPhone
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios --device "<DEVICE_UUID>"
```

## Development Build (Physical Device)

Find your device:
```bash
xcrun devicectl list devices
```

Build and install:
```bash
cd mobile-app
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios --device
```

**First-time setup:**
- Xcode will prompt you to select a development team
- Your device must be registered in your Apple Developer account
- Trust the developer certificate on your device (Settings → General → VPN & Device Management)

**Known issue:** First launch after a clean rebuild may crash with "AccessibilityManager is nil" error. This is a known React Native issue — simply rebuild and launch again. Second launch works fine.

## Release Build (IPA)

```bash
cd mobile-app
npx expo prebuild --platform ios --clean
cd ios
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install

xcodebuild -workspace mobileapp.xcworkspace -scheme mobileapp \
  -configuration Release -sdk iphoneos \
  -archivePath build/mobileapp.xcarchive archive

xcodebuild -exportArchive \
  -archivePath build/mobileapp.xcarchive \
  -exportPath build/ipa \
  -exportOptionsPlist ExportOptions.plist
```

Upload the IPA with **Transporter**.

## EAS (Optional)

```bash
npm install -g eas-cli
cd mobile-app

npm run build:dev:ios
npm run build:prod:ios
```

## Troubleshooting

- **CocoaPods encoding errors** → set `LANG` and `LC_ALL`
- **NitroModules not found** → ensure `newArchEnabled: true` and clean build
- **Stale builds** → `rm -rf ios build` and rebuild
