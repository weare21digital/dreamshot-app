# Mobile Skeleton App

Cross-platform mobile app template with React Native (Expo) frontend and NestJS backend. Fork this repo to jumpstart new projects with authentication, user management, payments, and ads already wired up.

> **📖 [Zero to App Store Guide →](docs/00-zero-to-store.md)** — Complete walkthrough from fork to live App Store app.


## Backend

DreamShot now uses the shared unified backend from `mobile-skeleton-app/backend` (same host used by mobile `.env` API URLs).

There is no local `backend/` service in this repository anymore.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo SDK 54, React Native 0.81.5, expo-router, React Native Paper |
| Backend | NestJS 10, Prisma 6, PostgreSQL |
| Auth | Email/password, Google Sign-In (native SDK), Apple Sign-In (iOS) |
| Payments | react-native-iap (iOS App Store + Google Play) |
| State | TanStack Query, react-hook-form, MMKV storage |

## Features

- **Authentication** — Email/password with verification codes, Google Sign-In (native `@react-native-google-signin/google-signin`), Apple Sign-In (`expo-apple-authentication`, iOS only)
- **User Management** — Profile editing, password change, account deletion
- **Premium Subscriptions** — Subscription and one-time payment support via IAP
- **Ads Integration** — Banner and interstitial ad support with analytics
- **Flexible Modes** — `authMode` (device/backend), `paymentMode` (device/backend), `accessMode` (freemium/paid/unlocked)
- **UI Component Library** — 11 themed, reusable components with showcase screen
- **Cross-Platform** — iOS, Android, and Web

## Project Structure

```
├── backend/                      # NestJS API
│   ├── src/
│   │   ├── config/               # Environment config (Zod validated)
│   │   ├── modules/
│   │   │   ├── auth/             # Auth: email, Google, Apple
│   │   │   ├── user/             # User CRUD
│   │   │   ├── payments/         # IAP verification & premium
│   │   │   ├── ads/              # Ad config & analytics
│   │   │   ├── email/            # Resend email service
│   │   │   ├── prisma/           # Database client
│   │   │   └── scheduler/        # Cron jobs
│   │   └── main.ts
│   └── prisma/                   # Schema & migrations
│
├── mobile-app/                   # Expo app
│   ├── app/                      # Screens (expo-router file-based routing)
│   │   ├── (auth)/               # Welcome, login, register
│   │   └── (main)/               # Main app tabs
│   └── src/
│       ├── features/             # Auth, profile, payments, ads, home
│       ├── hooks/                # useAuth, useGoogleAuth, useAppleAuth
│       ├── components/           # Shared UI (GoogleSignInButton, AppleSignInButton)
│       │   └── ui/               # Reusable themed UI components
│       ├── lib/                  # API client, query client
│       ├── config/               # App modes, IAP, theming
│       └── utils/                # Storage (MMKV), deep linking
│
├── docker-compose.yml            # PostgreSQL
├── setup.sh / setup.bat          # One-command setup
```

---

## Quick Start

### Prerequisites

- **Node.js 18+**
- **Docker** (for PostgreSQL) — or a Postgres instance
- **Xcode 26+** (iOS builds) — install from Mac App Store
- **Android Studio** (Android builds) — with SDK and emulator configured
- **CocoaPods** (`gem install cocoapods`) — for iOS native dependencies
- Optionally **EAS CLI** (`npm install -g eas-cli`) — for cloud builds (not required)

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/mobile-skeleton-app.git
cd mobile-skeleton-app
```

### 2. Automated Setup

```bash
./setup.sh        # macOS/Linux
setup.bat         # Windows
```

This starts PostgreSQL via Docker, installs dependencies, creates `.env` files from examples, runs database migrations, and seeds test data.

> **Device mode (no backend)?** Skip Docker and backend setup entirely. See [docs/01-getting-started/local-dev-setup.md](docs/01-getting-started/local-dev-setup.md#device-mode-no-backend-needed).

### 3. Manual Setup (alternative)

```bash
docker-compose up -d                          # Start PostgreSQL

cd backend
npm install
cp .env.example .env                          # Edit .env with your values
npm run db:setup                              # Migrate + seed

cd ../mobile-app
npm install
cp .env.example .env                          # Edit .env with your values
```

### 4. Start Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Mobile (native builds required)
cd mobile-app
npx expo run:ios        # iOS simulator
npx expo run:android    # Android emulator
# Expo Go NOT supported — uses native modules
```

### Test Credentials

| Account | Email | Password |
|---------|-------|----------|
| Regular | `test@example.com` | `testpassword123` |
| Premium | `premium@example.com` | `testpassword123` |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/mobile_skeleton_db` |
| `JWT_SECRET` | Access token signing secret | Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Access token TTL | `30d` |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | (same generation) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `365d` |
| `RESEND_API_KEY` | [Resend](https://resend.com) API key for emails | `re_...` |
| `EMAIL_FROM` | From address (verified in Resend) | `noreply@yourdomain.com` |
| `EMAIL_DEV_MODE` | Log codes to console instead of sending | `true` |
| `APP_NAME` | App display name (used in emails) | `My App` |
| `GOOGLE_CLIENT_ID` | Google OAuth **Web** client ID | `xxx.apps.googleusercontent.com` |

### Mobile (`mobile-app/.env`)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL_WEB` | Backend URL for web (`http://127.0.0.1:3000/api`) |
| `EXPO_PUBLIC_API_URL_ANDROID` | Backend URL for Android (`http://10.0.2.2:3000/api` for emulator) |
| `EXPO_PUBLIC_API_URL_IOS` | Backend URL for iOS (`http://localhost:3000/api` for simulator) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth **Web** client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth **Android** client ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth **iOS** client ID |

> **Physical devices**: Replace `localhost`/`10.0.2.2` with your machine's LAN IP (e.g., `192.168.1.100`).

---

## Google Sign-In Setup

Google Sign-In uses the **native SDK** (`@react-native-google-signin/google-signin`). It does **not** use `expo-auth-session` or browser-based OAuth. This means you need native builds (EAS or local), not Expo Go.

### Step 1: Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Go to **APIs & Services → OAuth consent screen** → Configure (External, add email/profile scopes)

### Step 2: Create OAuth Client IDs

Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**:

#### A. Web Application Client
- **Type**: Web application
- **Authorized JavaScript origins**: `http://localhost:8081`, `http://localhost:19006`
- **Authorized redirect URIs**: `http://localhost:8081`, `http://localhost:19006`
- Copy the **Client ID** → this goes in:
  - `backend/.env` as `GOOGLE_CLIENT_ID`
  - `mobile-app/.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

#### B. Android Client
- **Type**: Android
- **Package name**: `com.mobileskeleton.app` (from `app.json` → `android.package`)
- **SHA-1 fingerprint**: Get from your EAS keystore:
  ```bash
  eas credentials -p android
  # Look for SHA-1 certificate fingerprint
  ```
  Or for local debug keystore:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android
  ```
- Copy the **Client ID** → `mobile-app/.env` as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

#### C. iOS Client
- **Type**: iOS
- **Bundle ID**: `com.mobileskeleton.app` (from `app.json` → `ios.bundleIdentifier`)
- Copy the **Client ID** → `mobile-app/.env` as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

### Step 3: Service Config Files

#### Android — `google-services.json`
1. Go to [Firebase Console](https://console.firebase.google.com/) → Create/select project (link to same Google Cloud project)
2. Add Android app with package `com.mobileskeleton.app`
3. Download `google-services.json` → place in `mobile-app/google-services.json`
4. Already referenced in `app.json` → `android.googleServicesFile`

#### iOS — `GoogleService-Info.plist`
1. In Firebase Console, add iOS app with bundle ID `com.mobileskeleton.app`
2. Download `GoogleService-Info.plist` → place in `mobile-app/GoogleService-Info.plist`
3. Already referenced in `app.json` → `ios.googleServicesFile`

### Step 4: Verify `app.json` Plugin Config

Already configured in the skeleton:
```json
"plugins": [
  ["@react-native-google-signin/google-signin", {
    "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID_REVERSED"
  }]
]
```
Update the `iosUrlScheme` to match your iOS client's reversed client ID (shown in `GoogleService-Info.plist` as `REVERSED_CLIENT_ID`).

### Step 5: Build & Test

```bash
# Google Sign-In requires native builds (not Expo Go)
npm run build:dev:android    # or build:dev:ios
```

---

## Apple Sign-In Setup

Apple Sign-In uses `expo-apple-authentication` (iOS only). The button automatically hides on Android/Web.

### Step 1: Apple Developer Account

1. Go to [Apple Developer → Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/)
2. Select your App ID (or create one matching `com.mobileskeleton.app`)
3. Enable the **Sign in with Apple** capability

### Step 2: Backend

The backend (`apple-auth.service.ts`) already:
- Fetches Apple's JWKS public keys
- Verifies the identity token
- Creates/links user accounts
- The audience is hardcoded to `com.mobileskeleton.app` — update if you change the bundle ID

### Step 3: Build & Test

Apple Sign-In only works on real iOS devices or simulators with an Apple ID signed in.

```bash
npm run build:dev:ios
```

---

## Building Native Apps (Local)

Local builds are the **recommended** approach. They're faster, don't require EAS credits, and give you full control over the native toolchain.

### Prerequisites

- **macOS** required for iOS builds (Xcode)
- **CocoaPods** needs locale set: `export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` (add to `~/.zshrc`)
- **New Architecture** must be enabled (`"newArchEnabled": true` in `app.json`) — required by `react-native-iap` v14+ (NitroModules)

### iOS — Local Dev Build

```bash
cd mobile-app

# Clean build (recommended for first build or after config changes)
rm -rf ios build

# Build and run on simulator (auto-detects booted simulator)
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios

# Build for a specific simulator device
xcrun simctl list devices available | grep iPhone
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios --device "<DEVICE_UUID>"

# If build cache causes issues, add --no-build-cache
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios --device "<DEVICE_UUID>" --no-build-cache
```

**What this does**: runs `expo prebuild`, `pod install`, `xcodebuild`, installs the app on the simulator, starts Metro bundler, and launches the app.

### Android — Local Dev Build

```bash
cd mobile-app

# Clean build
rm -rf android build

# Build and run on emulator
npx expo run:android

# Build for a specific device
npx expo run:android --device "<DEVICE_NAME>"
```

### iOS — Release Build (IPA for App Store)

```bash
cd mobile-app
npx expo prebuild --platform ios --clean
cd ios
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install

# Build archive
xcodebuild -workspace mobileapp.xcworkspace -scheme mobileapp \
  -configuration Release -sdk iphoneos \
  -archivePath build/mobileapp.xcarchive archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/mobileapp.xcarchive \
  -exportPath build/ipa \
  -exportOptionsPlist ExportOptions.plist
```

### Android — Release Build (AAB for Google Play)

```bash
cd mobile-app
npx expo prebuild --platform android --clean
cd android
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

### EAS Builds (Alternative — Cloud)

If you prefer cloud builds:

```bash
npm install -g eas-cli
cd mobile-app
eas login
eas init

# Development builds
npm run build:dev:android
npm run build:dev:ios

# Production builds
npm run build:prod:android
npm run build:prod:ios
```

| Profile | Purpose | Distribution |
|---------|---------|-------------|
| `development` | Dev client with debugging | Internal |
| `preview` | APK for testers | Internal |
| `production` | Store-ready | App Store / Google Play |

---

## Store Assets

Store assets (icons, screenshots, banners) live in the `assets/` directory:

```
assets/
├── ios/
│   ├── icons/          # App icon (HTML source + PNG)
│   └── store/          # App Store screenshots
├── android/
│   ├── icons/          # App icon
│   └── store/          # Play Store screenshots
```

### App Icon Workflow

1. **Design in HTML** — Create/edit `assets/ios/icons/app-icon.html` (or android equivalent)
2. **Fine-tune in browser** — Open the HTML file, adjust colors/layout
3. **Export to PNG** — Screenshot at the target resolution (256×256 for general use, 1024×1024 for App Store)
4. **Resize as needed** — Use `sips -z <size> <size> icon.png --out icon-<size>.png` on macOS

This approach lets you iterate on the icon design without Photoshop/Figma — just edit HTML/CSS and re-export.

### Screenshots

Take screenshots directly from the iOS Simulator or Android Emulator:

```bash
# iOS Simulator screenshot
xcrun simctl io <DEVICE_UUID> screenshot screenshot.png

# List available simulators
xcrun simctl list devices available | grep -E "iPhone|iPad"
```

For App Store, resize to required dimensions:
- **iPhone 6.7"**: 1290×2796 or 1284×2778
- **iPad 12.9"**: 2048×2732

```bash
sips -z 2778 1284 screenshot.png --out screenshot-resized.png
```

---

## Forking Checklist

When you fork this repo for a new project, update these values:

1. **App identity**: `app.json` → `name`, `slug`, `scheme`, `bundleIdentifier`, `package`
2. **Bundle IDs**: Must match in Google Cloud, Apple Developer, and Firebase
3. **EAS project**: Run `eas init` to get a new `projectId`
4. **Database name**: `docker-compose.yml` and `backend/.env` → `DATABASE_URL`
5. **JWT secrets**: Generate new ones for `JWT_SECRET` and `JWT_REFRESH_SECRET`
6. **OAuth clients**: Create new Google Cloud + Apple credentials for your bundle IDs
7. **Service files**: New `google-services.json` and `GoogleService-Info.plist`
8. **Deep link scheme**: Update in `app.json`, email templates, and `deepLinking.ts`
9. **App name**: `backend/.env` → `APP_NAME`, email templates
10. **Apple audience**: `apple-auth.service.ts` → update hardcoded bundle ID

See [README-INITIALIZATION.md](README-INITIALIZATION.md) for detailed step-by-step instructions.

---

## Scripts

### Backend

```bash
npm run dev              # Development server (watch mode)
npm run build            # Production build
npm run db:setup         # Migrate + seed database
npm run db:migrate       # Run pending migrations
npm run db:studio        # Open Prisma Studio (GUI)
npm test                 # Run tests (Vitest)
```

### Mobile

```bash
npm start                # Expo dev server
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
npm run web              # Run in browser
npm test                 # Run tests (Jest)
npm run build:dev:android   # EAS development build
npm run build:preview:android  # EAS preview APK
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check `DATABASE_URL`, ensure PostgreSQL is running (`docker-compose up -d`) |
| Mobile can't reach backend | Update API URLs in `mobile-app/.env` with your LAN IP for physical devices |
| Google Sign-In fails | Verify SHA-1 (Android), bundle ID (iOS), correct client IDs in `.env` |
| `RNGoogleSignin: offline use requires server web ClientID` | Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `mobile-app/.env` |
| Apple Sign-In not showing | Only works on iOS. Ensure capability is enabled in Apple Developer |
| Metro bundler cache | `npx expo start --clear` |
| Database issues | `cd backend && npm run db:setup` |
| CocoaPods `Encoding::CompatibilityError` | Set `export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` before running pod install |
| `Exception in HostFunction: <unknown>` on import | Clean rebuild: `rm -rf ios build && npx expo run:ios --no-build-cache` |
| `NitroModules Turbo/Native-Module could not be found` | Ensure `newArchEnabled: true` in `app.json`, then clean rebuild |
| Native modules crash after toggling new arch | Stale build artifacts — always `rm -rf ios build` when changing `newArchEnabled` |
| EAS build fails | Check `eas.json`, run `eas build --platform android --profile development --clear-cache` |

### Important: New Architecture

This project **requires** `"newArchEnabled": true` in `app.json`. The `react-native-iap` v14+ package uses NitroModules which depend on the new architecture (TurboModules). Disabling new arch will cause `NitroModules not found` errors at runtime.

If you see `Exception in HostFunction` errors after building, do a **full clean rebuild**:

```bash
cd mobile-app
rm -rf ios build          # or android build for Android
npx expo run:ios --no-build-cache
```

Mixing old-arch and new-arch build artifacts in the same derived data causes module registration failures.

---

## In-App Purchases Setup

Setting up IAP for a new app forked from this skeleton requires both App Store Connect configuration and a binary upload before products will load on-device.

### Prerequisites

- Active [Apple Developer Program](https://developer.apple.com/programs/) membership
- **Paid Apps Agreement** signed in App Store Connect → Business (requires bank account + tax forms)
- App created in App Store Connect with matching bundle ID

### Step 1: Sign the Paid Apps Agreement

1. Go to [App Store Connect → Business](https://appstoreconnect.apple.com/business)
2. Check that **Paid Apps Agreement** status is **Active**
3. If not:
   - Add a **bank account** (can take up to 24h to verify)
   - Complete the **U.S. Tax Questionnaire** (W-8BEN for non-US individuals)
   - Wait for both to process — agreement won't activate until both are done

### Step 2: Create IAP Products

1. Go to App Store Connect → Your App → Distribution → In-App Purchases
2. Click **+** to create a new In-App Purchase
3. For the skeleton's default config (`mobile-app/src/config/iap.ts`):
   - **Product ID**: `app_lifetime` (Non-Consumable)
   - Set a **price** (Price Schedule section)
   - Add **localization** (Display Name + Description)
   - Add a **review screenshot** (screenshot of the purchase screen)
   - Add **review notes** (e.g., "Removes ads")
4. Status should show **"Ready to Submit"** when all metadata is complete

### Step 3: Upload a Binary

**This is critical** — StoreKit will NOT return products until at least one binary has been uploaded to App Store Connect, even for sandbox testing.

```bash
cd mobile-app/ios

# Build release archive
xcodebuild -workspace mobileapp.xcworkspace -scheme mobileapp \
  -configuration Release -archivePath build/mobileapp.xcarchive archive \
  CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=YOUR_TEAM_ID

# Export IPA (remove destination=upload to export locally)
cat > build/ExportOptions.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
EOF

xcodebuild -exportArchive -archivePath build/mobileapp.xcarchive \
  -exportPath build/ipa -exportOptionsPlist build/ExportOptions.plist \
  -allowProvisioningUpdates
```

Upload the IPA using **Transporter** (free from Mac App Store) — just drag the `.ipa` file in and click Deliver.

Wait for the build to finish processing in App Store Connect → TestFlight (status: **Complete**).

### Step 4: Set Up Sandbox Testing

1. Go to App Store Connect → Users and Access → Sandbox
2. Create a **sandbox tester account** (use a `+` alias email like `you+sandbox@gmail.com`)
3. On the test iPhone: **Settings → App Store → Sandbox Account** → sign in with the sandbox tester

### Step 5: Test on Device

1. Build and install the dev app: `npx expo run:ios --device`
2. Navigate to the premium/payment screen
3. Products should load from the sandbox environment
4. Purchases will use the sandbox account (no real charges)

### Troubleshooting IAP

| Problem | Solution |
|---------|----------|
| Products return empty `[]` | Ensure binary is uploaded to ASC + Paid Apps Agreement is Active |
| Products still empty after upload | Wait 1-4 hours after activating Paid Apps Agreement (propagation delay) |
| `initConnection` fails | Check that In-App Purchase capability is enabled on the App ID in Apple Developer portal |
| "Missing Metadata" on product | Fill in price, localization (display name + description), and review screenshot |
| Sandbox purchase doesn't trigger | Sign out/in sandbox account on device, force-quit app |
| Products load but purchase fails | Check sandbox account is signed in under Settings → App Store → Sandbox Account |

### Customizing IAP Products

Edit `mobile-app/src/config/iap.ts` to change product IDs:

```typescript
export const IAP_CONFIG = {
  ios: {
    subscriptions: [],                    // Add subscription product IDs here
    oneTime: ['app_lifetime'],            // Non-consumable product IDs
  },
  android: {
    subscriptions: ['app_pro_monthly', 'app_pro_yearly'],
    oneTime: ['app_lifetime'],
  },
};
```

Product IDs must exactly match what's configured in App Store Connect / Google Play Console.

---

## AI Configuration Prompt

Copy and paste this prompt to an AI assistant to quickly configure a new fork:

```
I forked the mobile-skeleton-app template. Help me configure it for my new app.

Here are my details:
- App name (display): [My App Name]
- App name (kebab-case): [my-app-name]  
- Bundle identifier: [com.mycompany.myapp]
- Deep link scheme: [my-app-name]
- Expo username: [my-expo-user]
- Google Cloud project: [already created / need to create]
- Apple Developer account: [yes / no]

Please:
1. List every file I need to update with find-and-replace values
2. Walk me through Google Cloud OAuth setup (Web + Android + iOS clients)
3. Walk me through Firebase setup for google-services.json and GoogleService-Info.plist
4. Update the Apple Sign-In audience in apple-auth.service.ts
5. Generate new JWT secrets
6. Update docker-compose.yml database name
7. Set up EAS project (eas init)
8. Give me the commands to build dev clients for both platforms

Reference: The project has README-INITIALIZATION.md with a complete file-by-file guide.
```

---

## License

MIT
