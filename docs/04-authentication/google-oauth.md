# Google OAuth (Native Sign‑In)

> ⚠️ **Requires development builds**
> Google Sign‑In uses the native SDK (`@react-native-google-signin/google-signin`). **Expo Go is not supported.**
> Use **`npx expo run:ios`** / **`npx expo run:android`** or EAS dev builds.

This app uses **native Google Sign‑In** configured via **Google Cloud Console**.

## Important Platform Difference

- **iOS:** No Firebase config file is needed. Use your iOS OAuth Client ID from Google Cloud in `.env`.
- **Android:** `google-services.json` is still required at build time because Gradle applies `com.google.gms.google-services`.

Firebase is used **only** to generate/download `google-services.json` for Android builds. No Firebase SDK/services are required at runtime for auth.

---

## Step 1: Create or Select a Google Cloud Project

### CLI path (if `gcloud` is installed)

```bash
# Create project
gcloud projects create {project-id} --name="{App Name}"

# Set as active
gcloud config set project {project-id}

# Enable required API
gcloud services enable people.googleapis.com
```

### Browser path

1. Navigate to: `https://console.cloud.google.com/projectcreate`
2. Fill in:
   - **Project name:** `{App Name}`
   - **Project ID:** `{project-id}` (auto-generated, or customize)
   - **Organization / Location:** leave default unless you have an org
3. Click **"Create"**
4. Wait for the notification banner: _"Your new project is ready"_
5. Click **"SELECT PROJECT"** in the notification (or navigate to it from the project dropdown)

**Verify:** The page header should show your project name in the top-left project selector.

---

## Step 2: Configure OAuth Consent Screen

### Browser path (no CLI available)

1. Navigate to: `https://console.cloud.google.com/apis/credentials/consent?project={project-id}`
2. If prompted to choose user type:
   - Select **"External"** (unless you have a Google Workspace org and want internal-only)
   - Click **"Create"**
3. Fill in the **"OAuth consent screen"** form:
   - **App name:** `{App Name}`
   - **User support email:** select your email from dropdown
   - **Developer contact information:** enter your email
   - Leave all other fields empty/default
4. Click **"Save and Continue"**
5. **Scopes page:** Click **"Add or Remove Scopes"**
   - Search for and check: `email`, `profile`, `openid`
   - Or manually add: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
   - Click **"Update"**
   - Click **"Save and Continue"**
6. **Test users page:** Click **"Save and Continue"** (skip unless needed)
7. **Summary page:** Click **"Back to Dashboard"**

**Verify:** The consent screen status should show **"Testing"** with your app name listed.

---

## Step 3: Create OAuth Client IDs

There is no `gcloud` CLI command for creating OAuth 2.0 client IDs. Use the browser.

### Navigate to credentials page

Go to: `https://console.cloud.google.com/apis/credentials?project={project-id}`

---

### 3a: iOS Client ID

1. Click **"+ Create Credentials"** (top of page) → **"OAuth client ID"**
2. Fill in:
   - **Application type:** select **"iOS"**
   - **Name:** `{App Name} iOS` (descriptive, for your reference only)
   - **Bundle ID:** `{bundleId}` (must match `app.json` → `expo.ios.bundleIdentifier`)
3. Click **"Create"**
4. A dialog appears with your client ID. **Copy the "Client ID"** — looks like: `123456789-abcdef.apps.googleusercontent.com`
5. Click **"OK"** to close

**Save this value as:** `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` in `mobile-app/.env`

**Also note the reversed client ID** for the URL scheme — it's the client ID segments reversed, e.g.: `com.googleusercontent.apps.123456789-abcdef`

You can find it later by clicking the client ID in the credentials list → look for **"iOS URL scheme"**.

---

### 3b: Android Client ID

1. **First, get your SHA-1 fingerprint:**

   ```bash
   # From debug keystore (local dev):
   keytool -list -v -keystore mobile-app/keystores/debug.keystore -alias androiddebugkey -storepass android 2>/dev/null | grep SHA1

   # Or from EAS:
   eas credentials -p android
   ```

   Copy the SHA-1 value (format: `AA:BB:CC:DD:...`)

2. Back in GCP Console credentials page, click **"+ Create Credentials"** → **"OAuth client ID"**
3. Fill in:
   - **Application type:** select **"Android"**
   - **Name:** `{App Name} Android`
   - **Package name:** `{packageName}` (must match `app.json` → `expo.android.package`)
   - **SHA-1 certificate fingerprint:** paste the SHA-1 from step 1
4. Click **"Create"**
5. Copy the **Client ID** from the dialog
6. Click **"OK"**

**Save this value as:** `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` in `mobile-app/.env`

> **Note:** You'll need additional Android client IDs for release builds (different SHA-1). When you upload to Play Store, add the Play App Signing SHA-1 from Play Console → Setup → App signing.

---

### 3c: Web Client ID (backend mode only)

> Skip this if using `authMode: 'device'` — not needed.

1. Click **"+ Create Credentials"** → **"OAuth client ID"**
2. Fill in:
   - **Application type:** select **"Web application"**
   - **Name:** `{App Name} Web`
   - **Authorized JavaScript origins:** add `http://localhost:8081` and `http://localhost:19006`
   - **Authorized redirect URIs:** leave empty (native apps don't use redirects)
3. Click **"Create"**
4. Copy the **Client ID**

**Save this value as:**
- `mobile-app/.env` → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `backend/.env` → `GOOGLE_CLIENT_ID`

---

## Step 4: Android Build Config (`google-services.json`)

The Android Gradle plugin requires `google-services.json`. Generate it from Firebase Console (it's just a config file — no Firebase SDK is used).

### CLI path (if `firebase-tools` is installed)

```bash
# Install if needed
npm install -g firebase-tools

# Login
firebase login

# Create Firebase project linked to your GCP project
firebase projects:addfirebase {project-id}

# Add Android app
firebase apps:create android --package={packageName} --project={project-id}

# Download config
firebase apps:sdkconfig android --project={project-id} --out=mobile-app/google-services.json
```

### Browser path

1. Navigate to: `https://console.firebase.google.com/`
2. Click **"Add project"** (or **"Create a project"**)
3. Enter your **existing GCP project name** — Firebase will link to it (not create a new one)
4. Follow prompts (disable Google Analytics if you don't need it) → **"Create project"**
5. Once created, click **"Continue"**
6. On the project dashboard, click the **Android icon** (or **"+ Add app"** → **Android**)
7. Fill in:
   - **Android package name:** `{packageName}` (must match `app.json`)
   - **App nickname:** `{App Name}` (optional)
   - Skip SHA-1 here (already configured in GCP)
8. Click **"Register app"**
9. Click **"Download google-services.json"**
10. Save to `mobile-app/google-services.json`
11. Click **"Next"** → **"Next"** → **"Continue to console"** (skip remaining Firebase setup steps)

**Verify:** `mobile-app/google-services.json` exists and contains your `package_name` and `project_id`.

The file is referenced in `app.json`:
```json
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

---

## Step 5: Configure `.env`

```bash
cd mobile-app
cp .env.example .env
```

Edit `mobile-app/.env`:

```env
# Required for all modes:
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Backend mode only:
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

---

## Step 6: iOS URL Scheme

Update the Google Sign-In plugin config in `app.json`:

```json
["@react-native-google-signin/google-signin", {
  "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID_REVERSED"
}]
```

The reversed client ID is: take `123456789-abcdef.apps.googleusercontent.com` → reverse to `com.googleusercontent.apps.123456789-abcdef`.

---

## Step 7: Build & Test

```bash
cd mobile-app
npx expo run:ios
# or
npx expo run:android
```

**Verify Google Sign-In works:**
1. App launches → navigate to sign-in screen
2. Tap "Sign in with Google"
3. Native Google picker appears with your Google account(s)
4. Select account → returns to app → user is signed in

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| **DEVELOPER_ERROR (Android)** | Wrong SHA-1 fingerprint | Regenerate SHA-1 from your actual keystore and update in GCP Console |
| **Android build fails** | Missing `google-services.json` | Download from Firebase Console (Step 4) |
| **iOS sign-in shows error** | Wrong `iosClientId` or bundle ID mismatch | Verify `.env` value matches GCP iOS client ID, bundle ID matches `app.json` |
| **No `idToken` returned** | Missing `webClientId` | Add Web client ID to `.env` (needed for backend mode) |
| **"Sign in cancelled" immediately** | OAuth consent screen not configured | Complete Step 2 — consent screen must exist |
| **10 user cap warning** | App in "Testing" mode | Normal for dev. Push to "Production" in consent screen settings before public launch |

## Related Docs

- [Apple Sign‑In](apple-sign-in.md)
- [App Modes](../02-configuration/app-modes.md)
- [Android Config File](../03-platform-setup/android-config-file.md)
- [iOS Builds](../06-build-and-deploy/ios-build.md)
