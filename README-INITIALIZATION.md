# Skeleton App Initialization Guide

This guide transforms the `mobile-skeleton-app` repository into a brand-new app by updating all app identity values, bundle identifiers, deep link schemes, database names, and documentation references. It is written so a developer or AI assistant can execute the steps without additional clarification.

After completing this guide, your app should:
- Run with the new app name.
- Use a new bundle identifier / Android package.
- Use a new deep link scheme.
- Have correct env files for backend and mobile.
- Have docs and setup instructions aligned with the new app.

## Before You Start

Gather these inputs:
- [ ] **App_Name (kebab-case)**: `my-awesome-app`
- [ ] **App_Display_Name (title case)**: `My Awesome App`
- [ ] **Bundle_Identifier**: `com.company.myawesomeapp`
- [ ] **Deep_Link_Scheme**: `my-awesome-app` (recommended to match App_Name)
- [ ] **Repository_URL**: `https://github.com/org/my-awesome-app.git`
- [ ] **Expo_Username**: `my-expo-user`
- [ ] **Author_Name**: `My Company`

Derived value:
- **Database_Name**: App_Name with hyphens replaced by underscores + `_db`
  - Example: `my-awesome-app` -> `my_awesome_app_db`

## Quick Reference (Key Files)

| File | What to Change | Find | Replace With |
|------|----------------|------|--------------|
| `package.json` | app name | `"name": "mobile-skeleton-app"` | `"name": "{App_Name}"` |
| `package.json` | description | `"A complete cross-platform mobile app skeleton..."` | new description |
| `package.json` | repository URL | `"url": "https://github.com/xAleksandar/mobile-skeleton-app.git"` | `{Repository_URL}` |
| `package.json` | author | `"author": "Your Name"` | `{Author_Name}` |
| `mobile-app/package.json` | app name | `"name": "mobile-app"` | `"name": "{App_Name}"` |
| `mobile-app/app.json` | display name | `"name": "mobile-app"` | `"{App_Display_Name}"` |
| `mobile-app/app.json` | slug | `"slug": "mobile-app"` | `"{App_Name}"` |
| `mobile-app/app.json` | scheme | `"scheme": "mobile-app"` | `"{Deep_Link_Scheme}"` |
| `mobile-app/app.json` | intent filter scheme | `"scheme": "mobile-app"` | `"{Deep_Link_Scheme}"` |
| `mobile-app/app.json` | owner | `"owner": "shiroh1ge"` | `"{Expo_Username}"` |
| `mobile-app/app.json` | bundle identifier | `"bundleIdentifier": "com.yourcompany.mobileapp"` | `"{Bundle_Identifier}"` |
| `mobile-app/app.json` | android package | `"package": "com.yourcompany.mobileapp"` | `"{Bundle_Identifier}"` |
| `docker-compose.yml` | database name | `POSTGRES_DB: mobile_skeleton_db` | `POSTGRES_DB: {Database_Name}` |
| `backend/.env.example` | database URL | `mobile_skeleton_db` | `{Database_Name}` |
| `backend/.env.example` | app name | `APP_NAME="Mobile App Skeleton"` | `APP_NAME="{App_Display_Name}"` |
| `backend/.env.example` | redirect URI | `.../@your_user-name/mobile-skeleton` | `.../@{Expo_Username}/{App_Name}` |
| `mobile-app/.env.example` | redirect URI | `.../@your-username/mobile-app` | `.../@{Expo_Username}/{App_Name}` |
| `backend/src/modules/auth/auth.module.ts` | JWT issuer/audience | `mobile-app-skeleton` / `mobile-app-users` | new values |
| `backend/src/modules/auth/strategies/jwt.strategy.ts` | JWT issuer/audience | `mobile-app-skeleton` / `mobile-app-users` | new values |
| `backend/src/modules/email/email.service.ts` | deep link & branding | `mobile-app://` + "Mobile App Skeleton" | new scheme + display name |
| `mobile-app/src/utils/deepLinking.ts` | scheme check | `mobile-app:` | `{Deep_Link_Scheme}:` |
| `mobile-app/android/app/build.gradle` | namespace/applicationId | `com.yourcompany.mobileapp` | `{Bundle_Identifier}` |
| `mobile-app/android/settings.gradle` | rootProject.name | `mobile-app` | `{App_Name}` |
| `mobile-app/android/app/src/main/res/values/strings.xml` | app name | `mobile-app` | `{App_Display_Name}` |
| `mobile-app/android/app/src/main/AndroidManifest.xml` | scheme | `android:scheme="mobile-app"` | `android:scheme="{Deep_Link_Scheme}"` |
| `mobile-app/android/app/src/main/java/com/yourcompany/mobileapp/...` | package | `package com.yourcompany.mobileapp` | `package {Bundle_Identifier}` |
| Docs | repo/name references | `mobile-skeleton-app` / `Mobile App Skeleton` | new values |

## Step-by-Step Instructions

### Step 1: Create Environment Files

1) Copy backend env:
- macOS/Linux:
  - `cp backend/.env.example backend/.env`
- Windows:
  - `copy backend\.env.example backend\.env`

2) Copy mobile env:
- macOS/Linux:
  - `cp mobile-app/.env.example mobile-app/.env`
- Windows:
  - `copy mobile-app\.env.example mobile-app\.env`

3) Update `backend/.env` (and `.env.example` for the template):
- `DATABASE_URL` -> use `{Database_Name}`
- `APP_NAME` -> `{App_Display_Name}`
- `APP_URL` and `FRONTEND_URL` -> update if your app uses a different domain or port
- `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` -> `https://auth.expo.io/@{Expo_Username}/{App_Name}`

4) Update `mobile-app/.env` (and `.env.example` for the template):
- `EXPO_PUBLIC_API_URL_WEB`, `EXPO_PUBLIC_API_URL_ANDROID`, `EXPO_PUBLIC_API_URL_IOS` -> set to your dev host
- `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` -> your Google OAuth client IDs
- `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` -> `https://auth.expo.io/@{Expo_Username}/{App_Name}`

### Step 2: Root Metadata (Repository and App Identity)

Update `package.json`:
- Find `"name": "mobile-skeleton-app"` -> replace with `{App_Name}`
- Find description `"A complete cross-platform mobile app skeleton..."` -> replace with your new description
- Find `"url": "https://github.com/xAleksandar/mobile-skeleton-app.git"` -> replace with `{Repository_URL}`
- Find `"author": "Your Name"` -> replace with `{Author_Name}`

Update docs that reference the old repo name:
- `README.md`
- `QUICK_START.md`
- `SETUP.md`
- `NEXT_STEPS.md`

Search for:
- `mobile-skeleton-app`
- `Mobile App Skeleton`

Replace with:
- `{App_Name}` (repo folder name)
- `{App_Display_Name}` (human-facing name)

### Step 3: Expo App Identity (Name, Slug, Scheme)

Update `mobile-app/app.json`:
- `"name": "mobile-app"` -> `{App_Display_Name}`
- `"slug": "mobile-app"` -> `{App_Name}`
- `"scheme": "mobile-app"` -> `{Deep_Link_Scheme}`
- intent filter `"scheme": "mobile-app"` -> `{Deep_Link_Scheme}`
- `"owner": "shiroh1ge"` -> `{Expo_Username}`
- `"bundleIdentifier": "com.yourcompany.mobileapp"` -> `{Bundle_Identifier}`
- `"package": "com.yourcompany.mobileapp"` -> `{Bundle_Identifier}`

Expo project ID:
- `extra.eas.projectId` currently has a skeleton value.
- Option A: keep it for now and replace after `eas init`.
- Option B: replace immediately if you already have a new project ID.

Update `mobile-app/package.json`:
- `"name": "mobile-app"` -> `{App_Name}`

### Step 4: Android Native Identity

Update `mobile-app/android/settings.gradle`:
- `rootProject.name = 'mobile-app'` -> `rootProject.name = '{App_Name}'`

Update `mobile-app/android/app/build.gradle`:
- `namespace 'com.yourcompany.mobileapp'` -> `{Bundle_Identifier}`
- `applicationId 'com.yourcompany.mobileapp'` -> `{Bundle_Identifier}`

Update `mobile-app/android/app/src/main/res/values/strings.xml`:
- `<string name="app_name">mobile-app</string>` -> `{App_Display_Name}`

Update `mobile-app/android/app/src/main/AndroidManifest.xml`:
- `android:scheme="mobile-app"` -> `android:scheme="{Deep_Link_Scheme}"`

Update Android package declarations:
- Files:
  - `mobile-app/android/app/src/main/java/com/yourcompany/mobileapp/MainApplication.kt`
  - `mobile-app/android/app/src/main/java/com/yourcompany/mobileapp/MainActivity.kt`
- Replace:
  - `package com.yourcompany.mobileapp` -> `package {Bundle_Identifier}`

Move the package folder to match the new identifier:
- From: `mobile-app/android/app/src/main/java/com/yourcompany/mobileapp/`
- To: `mobile-app/android/app/src/main/java/com/company/myawesomeapp/`

(Replace path segments to match your `{Bundle_Identifier}`.)

### Step 5: Deep Linking and OAuth

Update `mobile-app/src/utils/deepLinking.ts`:
- `return urlObj.protocol === 'mobile-app:';`
  - Replace `mobile-app:` with `{Deep_Link_Scheme}:`

Update `backend/src/modules/email/email.service.ts`:
- `const verificationUrl = \`mobile-app://verify-email?...` -> replace with `{Deep_Link_Scheme}://verify-email?...`
- Replace `"Welcome to Mobile App Skeleton!"` with `{App_Display_Name}`

Update OAuth docs:
- `GOOGLE_OAUTH_SETUP.md` (scheme and redirect URIs)
- `mobile-app/NETWORK_SETUP.md` (scheme references)

### Step 6: Database Name

Update `docker-compose.yml`:
- `POSTGRES_DB: mobile_skeleton_db` -> `POSTGRES_DB: {Database_Name}`

Update `backend/.env.example` and `backend/.env`:
- `mobile_skeleton_db` -> `{Database_Name}`

### Step 7: Security / JWT Identity

Update JWT issuer/audience to match your app:
- `backend/src/modules/auth/auth.module.ts`
  - `issuer: 'mobile-app-skeleton'` -> e.g. `'{App_Name}-api'`
  - `audience: 'mobile-app-users'` -> e.g. `'{App_Name}-users'`
- `backend/src/modules/auth/strategies/jwt.strategy.ts`
  - Same changes as above

### Step 8: Setup Scripts and Docs Alignment

Update `setup.sh` and `setup.bat` so the setup process matches the new app:
- Ensure the script copies `mobile-app/.env.example` to `mobile-app/.env`.
- Update any printed app name from "Mobile App Skeleton" to `{App_Display_Name}`.
- Update any network instructions to reference `.env` (not `CURRENT_NETWORK_IP`).

Update docs that mention the old network config:
- `README.md` (Network configuration section)
- `QUICK_START.md` and `SETUP.md` (if they mention `network.ts`)

### Step 9: Package Lock Regeneration

After renaming package names:
- Run `npm install` at repo root to update:
  - `package-lock.json`
  - `mobile-app/package-lock.json`

If you want clean lockfiles:
- Delete both lockfiles and re-run `npm install`.

### Step 10: Optional Feature Disable (Skip Only)

Use this section when you want a clean, minimal app without removing code. The idea is to hide UI entry points, bypass feature hooks, and avoid registration flows that can break first run.

#### Disable Notifications (UI + Registration)

**Goal:** Remove the notifications preference and avoid any registration errors on startup.

- In `mobile-app/src/features/profile/screens/SettingsScreen.tsx`:
  - Remove the notifications state:
    - `const [notifications, setNotifications] = useState(true);`
  - Remove the `List.Item` for **Push Notifications** (the one with a `Switch`).
  - Alternatively, keep the item but hard-disable the toggle:
    - `value={false}` and `disabled={true}`

- Update tests so they match the UI:
  - In `mobile-app/src/__tests__/settings.test.tsx`, remove the assertion that `Push Notifications` exists.

- If your fork has notification registration code (e.g., during login or app boot):
  - No-op the registration call or guard it behind a flag.
  - Example (pseudo):
    - `if (process.env.EXPO_PUBLIC_NOTIFICATIONS_ENABLED !== 'true') return;`

#### Disable Biometrics (If Present in Your Fork)

This skeleton does not include biometrics by default. If your fork added it, disable by:

- Remove or hide the biometrics entry in settings or auth screens.
- Replace the biometrics check with a simple `false` guard so it never runs.
- Ensure any "enable biometrics" prompt is not shown during registration or login.

#### Generic Pattern for Disabling Any Feature

1) Hide the UI entry point (remove button/tab/route).
2) Disable the underlying hook or service call (return early / no-op).
3) Update tests to match the new UI.
4) Ensure any onboarding or registration flow does not call the disabled feature.

## Verification Checklist

- [ ] **Env files exist**
  - `ls backend/.env mobile-app/.env`

- [ ] **Dependencies install**
  - `npm install`

- [ ] **Database starts**
  - `docker-compose up -d`

- [ ] **Backend setup**
  - `cd backend && npm run db:setup`

- [ ] **Mobile app starts**
  - `cd mobile-app && npm start`

- [ ] **No old identifiers remain**
  - `rg -n "mobile-skeleton-app|mobile_skeleton_db|com\\.yourcompany\\.mobileapp|mobile-app-skeleton|mobile-app-users" -S .`

Note: `mobile-app` is a folder name; do not blindly replace path references.

## Troubleshooting

**OAuth redirect_uri_mismatch**
- Ensure `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` matches:
  - `https://auth.expo.io/@{Expo_Username}/{App_Name}`

**Deep link not opening the app**
- Verify scheme updates in:
  - `mobile-app/app.json`
  - `mobile-app/android/app/src/main/AndroidManifest.xml`
  - `mobile-app/src/utils/deepLinking.ts`
  - `backend/src/modules/email/email.service.ts`

**Android build errors after package rename**
- Ensure the folder path matches the new package name.
- Verify package declarations in `MainActivity.kt` and `MainApplication.kt`.

**App cannot reach backend**
- Confirm `mobile-app/.env` API URLs match your host and device type.

## Summary of Files to Modify

Core config:
- `package.json`
- `mobile-app/package.json`
- `mobile-app/app.json`
- `docker-compose.yml`
- `backend/.env.example`
- `backend/.env`
- `mobile-app/.env.example`
- `mobile-app/.env`

Backend:
- `backend/src/modules/auth/auth.module.ts`
- `backend/src/modules/auth/strategies/jwt.strategy.ts`
- `backend/src/modules/email/email.service.ts`

Android:
- `mobile-app/android/settings.gradle`
- `mobile-app/android/app/build.gradle`
- `mobile-app/android/app/src/main/AndroidManifest.xml`
- `mobile-app/android/app/src/main/res/values/strings.xml`
- `mobile-app/android/app/src/main/java/.../MainActivity.kt`
- `mobile-app/android/app/src/main/java/.../MainApplication.kt`

Docs and setup:
- `README.md`
- `QUICK_START.md`
- `SETUP.md`
- `NEXT_STEPS.md`
- `GOOGLE_OAUTH_SETUP.md`
- `mobile-app/NETWORK_SETUP.md`
- `setup.sh`
- `setup.bat`
