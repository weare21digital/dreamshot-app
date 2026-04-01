# Apple Developer Portal Setup

> ⚠️ **Requires development builds**
> Native modules require **`npx expo run:ios`** / **`npx expo run:android`**. **Expo Go is not supported.**

This guide is a browser-first, agent-friendly checklist for Apple setup: App ID, capabilities, certificates, devices, and provisioning profiles.

Use placeholders and keep values consistent across docs and config:
- `{bundleId}` (example: `com.company.app`)
- `{appName}`
- `{teamId}`

---

## 0) Sign in and confirm team access

1. Navigate to: `https://developer.apple.com/account/`
2. Sign in with your Apple Developer account.
3. In the left nav, click **Membership**.

**Verify:** You should see an active Apple Developer Program membership and your **Team ID** (save this as `{teamId}`).

---

## 1) Create App ID

1. Navigate to: `https://developer.apple.com/account/resources/identifiers/list`
2. Click the **+** button (top-right).
3. On "Register a new identifier", select **App IDs** → click **Continue**.
4. Select **App** (radio button) → click **Continue**.
5. Fill the form:
   - **Description**: `{appName}`
   - **Bundle ID**: select **Explicit** and enter `{bundleId}`
6. Click **Continue**.
7. On confirmation page, click **Register**.

**Verify:** You should return to Identifiers list and see `{bundleId}` in the table.

---

## 2) Enable capabilities on the App ID

1. Navigate to: `https://developer.apple.com/account/resources/identifiers/list`
2. Click the App ID row for `{bundleId}`.
3. In **Capabilities**, enable as needed:
   - **In-App Purchase** (checkbox)
   - **Sign In with Apple** (checkbox; required if Apple login is enabled)
   - **Push Notifications** (optional)
4. Click **Save**.

**Verify:** You should see those capabilities marked as enabled on the App ID detail page.

> Xcode auto-signing can configure entitlements for your target, but the App ID capability must still exist in Apple Developer.

---

## 3) Certificates (preferred: Xcode automatic signing)

### Preferred path (automatic)

1. Open `mobile-app/ios/{appName}.xcworkspace` in Xcode.
2. Select target → **Signing & Capabilities**.
3. Check **Automatically manage signing**.
4. Select your team from **Team** dropdown.

**Verify:** Signing status shows no red errors, and Xcode creates required development cert/profile automatically.

### Manual path (only if needed)

1. Navigate to: `https://developer.apple.com/account/resources/certificates/list`
2. Click **+**.
3. Create:
   - **Apple Development** certificate (local/dev builds)
   - **Apple Distribution** certificate (App Store distribution)
4. Follow CSR upload flow and download generated `.cer` files.
5. Install certs into Keychain.

**Verify:** Certificates list shows active development/distribution certs for your team.

---

## 4) Register test devices (for physical device installs)

1. Navigate to: `https://developer.apple.com/account/resources/devices/list`
2. Click **+**.
3. Fill:
   - **Platform**: iOS / iPadOS
   - **Device Name**: `{testerDeviceName}`
   - **UDID**: `{deviceUdid}`
4. Click **Continue** → **Register**.

**Verify:** Device appears in Devices list with status **Enabled**.

CLI helper to get device UDID on macOS:
```bash
xcrun devicectl list devices
```

---

## 5) Provisioning profiles

> If Xcode automatic signing works, you usually do **not** need to create these manually.

### 5a) Development profile (manual)

1. Navigate to: `https://developer.apple.com/account/resources/profiles/list`
2. Click **+**.
3. Select **iOS App Development** → **Continue**.
4. Select App ID `{bundleId}` → **Continue**.
5. Select development certificate(s) → **Continue**.
6. Select registered test devices → **Continue**.
7. **Provisioning Profile Name**: `{appName} Dev Profile` → **Generate**.
8. Download `.mobileprovision` and install.

**Verify:** Profile appears in list with type **iOS App Development** and status active.

### 5b) App Store profile (manual)

1. From Profiles page, click **+**.
2. Select **App Store Connect** (or **App Store**) distribution profile type → **Continue**.
3. Select App ID `{bundleId}`.
4. Select **Apple Distribution** certificate.
5. **Provisioning Profile Name**: `{appName} AppStore Profile` → **Generate**.

**Verify:** Profile appears in list with distribution type and correct `{bundleId}`.

---

## What Xcode handles automatically vs manual

| Task | Xcode Automatic Signing | Manual Portal Setup |
|---|---|---|
| Development certificate/profile | ✅ Usually automatic | ✅ Optional fallback |
| App ID creation | ❌ | ✅ Required |
| Capability switch on App ID | ⚠️ Sometimes prompts/assists | ✅ Reliable source of truth |
| Device registration | ❌ | ✅ Required for manual device flow |
| App Store distribution profile | ❌ Usually manual for CI/export | ✅ Required when exporting IPA manually |

## Related Docs

- [App Store Connect](app-store-connect.md)
- [Apple Sign‑In](../04-authentication/apple-sign-in.md)
- [iOS Builds](../06-build-and-deploy/ios-build.md)
- [Export Options](../06-build-and-deploy/export-options.md)
