# Android Builds

> ⚠️ **Requires development builds**
> Native modules require **`npx expo run:android`**. **Expo Go is not supported.**

This guide covers local Android builds and release output.

## Prerequisites

- Android Studio + SDK
- Emulator or device with USB debugging

## Development Build (Local)

```bash
cd mobile-app
rm -rf android build
npx expo run:android
```

For a specific device:
```bash
npx expo run:android --device "<DEVICE_NAME>"
```

## Release Build (AAB)

```bash
cd mobile-app
npx expo prebuild --platform android --clean
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## EAS (Optional)

```bash
npm install -g eas-cli
cd mobile-app

npm run build:dev:android
npm run build:prod:android
```

## Troubleshooting

- **`adb` not found** → add `platform-tools` to PATH
- **NitroModules errors** → ensure `newArchEnabled: true`, clean build
- **Stale builds** → `rm -rf android build` then rebuild
