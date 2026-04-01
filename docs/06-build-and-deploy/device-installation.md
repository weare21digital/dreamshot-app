# Device Installation

Install development builds on physical iOS and Android devices connected via WiFi or USB cable.

## iOS Device

### Prerequisites

- Device paired with your Mac (Settings → General → VPN & Device Management, or via Xcode)
- Apple Developer account with the device registered
- `DEVELOPMENT_TEAM` set in `project.pbxproj` (all `buildSettings` sections)
- Trust the developer certificate on device: **Settings → General → VPN & Device Management**

### Find Your Device

```bash
xcrun devicectl list devices
```

Look for devices with status `available (paired)`. Note the UUID.

### WiFi vs Cable

Both work identically. WiFi pairing is set up once in Xcode:
1. Connect device via USB
2. Xcode → Window → Devices and Simulators
3. Check "Connect via network"
4. Disconnect cable — device stays available over WiFi

### Build and Install (One Step)

```bash
cd mobile-app
xcodebuild -workspace ios/<AppName>.xcworkspace \
  -scheme <AppName> \
  -configuration Debug \
  -destination 'id=<DEVICE_UUID>' \
  -allowProvisioningUpdates
```

This builds and installs in one step. The app appears on the home screen.

### Install Pre-built App

If you already have a `.app` bundle:

```bash
xcrun devicectl device install app \
  --device <DEVICE_UUID> \
  path/to/Build/Products/Debug-iphoneos/<AppName>.app
```

### Signing Setup

Inject `DEVELOPMENT_TEAM` into all build settings sections of `project.pbxproj`:

```bash
# Check current state
grep -c "DEVELOPMENT_TEAM" ios/<AppName>.xcodeproj/project.pbxproj

# Add to all buildSettings sections (replace TEAM_ID)
sed -i '' '/buildSettings = {/a\
\				DEVELOPMENT_TEAM = "TEAM_ID";
' ios/<AppName>.xcodeproj/project.pbxproj
```

> ⚠️ Be careful not to add duplicates. Check with `grep` first.

### First Launch Issues

- **"Untrusted Developer"**: Go to Settings → General → VPN & Device Management → trust the certificate
- **AccessibilityManager crash**: Known React Native issue on first clean build. Rebuild and launch again — second launch works fine
- **Provisioning errors**: Ensure device UDID is registered at developer.apple.com, or use `-allowProvisioningUpdates` flag

---

## Android Device

### Prerequisites

- USB debugging enabled (Settings → Developer Options → USB Debugging)
- `adb` available (usually at `~/Library/Android/sdk/platform-tools/adb`)
- `android/local.properties` with `sdk.dir` pointing to your Android SDK

### Find Your Device

```bash
# Add adb to PATH if not already there
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"

adb devices -l
```

### WiFi (Wireless ADB)

Android 11+ supports wireless debugging natively:

1. **Settings → Developer Options → Wireless Debugging → Enable**
2. Tap "Pair device with pairing code" — note the IP:port and code
3. On your Mac:
   ```bash
   adb pair <IP>:<PAIRING_PORT>
   # Enter the pairing code when prompted
   
   adb connect <IP>:<CONNECTION_PORT>
   ```
4. Verify: `adb devices -l` should show the device

> The pairing port and connection port are different. After pairing, use the port shown on the main Wireless Debugging screen.

### USB Cable

Just plug in and approve the debugging prompt on the device. `adb devices` should show it immediately.

### Build and Install (One Step)

```bash
cd mobile-app/android
./gradlew assembleDebug

# Install the APK
adb -s <DEVICE_SERIAL> install -r app/build/outputs/apk/debug/app-debug.apk
```

Or use the combined command:
```bash
./gradlew installDebug -PdeviceId=<DEVICE_SERIAL>
```

### Connect to Metro Bundler

After installing, the app needs to reach Metro (port 8081). For USB:
```bash
adb reverse tcp:8081 tcp:8081
```

For WiFi, the device must be on the same network. Shake the device → Dev Settings → set the debug server host to `<YOUR_MAC_IP>:8081`.

### Troubleshooting

- **`adb` not found**: Add to PATH: `export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"`
- **Device not showing**: Check USB debugging is enabled, re-authorize the connection prompt on the device
- **`INSTALL_FAILED_UPDATE_INCOMPATIBLE`**: Uninstall the old version first: `adb uninstall <bundle.id>`
- **`local.properties` missing**: Create it with `sdk.dir=/Users/<you>/Library/Android/sdk`

---

## Quick Reference

| Action | iOS | Android |
|--------|-----|---------|
| List devices | `xcrun devicectl list devices` | `adb devices -l` |
| Build + install | `xcodebuild -destination 'id=UUID'` | `./gradlew assembleDebug && adb install` |
| Install only | `xcrun devicectl device install app` | `adb install -r path.apk` |
| WiFi setup | Xcode → Devices → "Connect via network" | `adb pair` + `adb connect` |
| Metro bridge | Automatic | `adb reverse tcp:8081 tcp:8081` |
