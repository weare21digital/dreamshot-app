# ExportOptions.plist (iOS IPA Export)

Use `ExportOptions.plist` when exporting an archive to `.ipa` with `xcodebuild -exportArchive`.

## Where to place the file

Recommended path:

```text
mobile-app/ios/ExportOptions.plist
```

Then export with:

```bash
xcodebuild -exportArchive \
  -archivePath build/{appName}.xcarchive \
  -exportPath build/ipa \
  -exportOptionsPlist ExportOptions.plist
```

## Template: automatic signing (simple)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store</string>
  <key>teamID</key>
  <string>{teamId}</string>
</dict>
</plist>
```

Use this when Xcode automatic signing is configured and working.

## Template: manual signing

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store</string>
  <key>teamID</key>
  <string>{teamId}</string>
  <key>signingStyle</key>
  <string>manual</string>
  <key>provisioningProfiles</key>
  <dict>
    <key>{bundleId}</key>
    <string>{appStoreProvisioningProfileName}</string>
  </dict>
</dict>
</plist>
```

Use this when you must pin explicit provisioning profile names.

## How to find Team ID

1. Go to: `https://developer.apple.com/account/`
2. Click **Membership**.
3. Copy **Team ID**.

**Verify:** Team ID matches the team selected in Xcode Signing settings.

## How to find provisioning profile names

1. Go to: `https://developer.apple.com/account/resources/profiles/list`
2. Find the App Store profile for `{bundleId}`.
3. Copy the **Profile Name** exactly.

CLI alternative (installed profiles):
```bash
grep -R "<key>Name</key>" ~/Library/MobileDevice/Provisioning\ Profiles -n
```

## Related Docs

- [iOS Builds](ios-build.md)
- [Apple Developer Portal](../03-platform-setup/apple-developer.md)
