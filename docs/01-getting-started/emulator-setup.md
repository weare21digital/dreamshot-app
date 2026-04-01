# Emulator Setup (iOS Simulator + Android Emulator)

> ⚠️ **Requires development builds**
> Native modules require **`npx expo run:ios`** / **`npx expo run:android`**. **Expo Go is not supported.**

This guide walks you through setting up iOS Simulator and Android Emulator for local development.

## iOS Simulator (macOS)

### 1) Install Xcode
- Install **Xcode 26+** from the Mac App Store.
- Open Xcode once to accept licenses.

### 2) Install Xcode Command Line Tools
```bash
xcode-select --install
```

### 3) Open Simulator
You can launch it via:
```bash
open -a Simulator
```

### 4) Create/Select a Device
In Simulator:
- **File → Open Simulator → iPhone 16 Pro** (or any device)

List devices from CLI:
```bash
xcrun simctl list devices available | grep iPhone
```

### 5) Build & Run
```bash
cd mobile-app
npx expo run:ios
```

For a specific device:
```bash
npx expo run:ios --device "<DEVICE_UUID>"
```

### Troubleshooting iOS
- **CocoaPods encoding errors**:
  ```bash
  export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
  ```
- **Stale builds**:
  ```bash
  rm -rf ios build
  npx expo run:ios --no-build-cache
  ```

---

## Android Emulator (macOS/Windows/Linux)

### 1) Install Android Studio
- Download from https://developer.android.com/studio
- Install **Android SDK**, **Platform Tools**, and **Android Emulator**

### 2) Configure SDK
Open **Android Studio → Settings → Android SDK**:
- Install the latest Android SDK platform
- Install **Android Emulator** + **Google Play system images**

### 3) Create an AVD
Open **Tools → Device Manager → Create Device**:
- Choose a Pixel device (e.g., Pixel 8)
- Select a **Google Play** image (required for Google Sign‑In)
- Finish and start the emulator

### 4) Set Environment Variables (optional)
Ensure `ANDROID_HOME` is set and platform tools are on PATH:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

### 5) Build & Run
```bash
cd mobile-app
npx expo run:android
```

### Troubleshooting Android
- **`adb` not found**: verify `platform-tools` are in PATH
- **Google Sign‑In fails**: use a **Google Play** system image
- **Stale builds**:
  ```bash
  rm -rf android build
  npx expo run:android
  ```

---

## Recommended Workflow

1. Start backend: `cd backend && npm run dev`
2. Start emulator/simulator
3. Run `npx expo run:ios` or `npx expo run:android`
4. Keep Metro bundler running in a separate terminal
