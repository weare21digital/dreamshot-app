# Fork & Rename the App

This guide walks you through turning `mobile-skeleton-app` into a brand‑new app: rename app identity, update bundle IDs, and align environment/config files.

> This project uses native modules — test with `npx expo run:ios` / `npx expo run:android` (Expo Go not supported).

## Inputs You Need

Collect these values before starting:

- **App_Name (kebab-case)**: `my-awesome-app`
- **App_Display_Name**: `My Awesome App`
- **Bundle_Identifier**: `com.company.myawesomeapp`
- **Deep_Link_Scheme**: `my-awesome-app`
- **Repository_URL**: `https://github.com/org/my-awesome-app.git`
- **Expo_Username**: `my-expo-user`
- **Author_Name**: `My Company`

Derived value:
- **Database_Name**: `my_awesome_app_db` (replace `-` with `_` + `_db`)

## Quick Reference (Key Files)

Update these first:

- `package.json` — name, description, repo URL, author
- `mobile-app/package.json` — name
- `mobile-app/app.json` — display name, slug, scheme, bundle ID, Android package, Expo owner
- `docker-compose.yml` — DB name
- `backend/.env.example`, `backend/.env` — DB URL, app name
- `mobile-app/.env.example`, `mobile-app/.env` — API URLs, Google OAuth client IDs

## Automated Setup (setup.sh)

`setup.sh` can do most of the initial rename/config work automatically.

### Real flags supported by current script

From `~/Repositories/mobile-skeleton-app/setup.sh`:

- `--non-interactive` — run scripted mode (no prompts)
- `--name "{App Name}"` — required in non-interactive mode
- `--mode "{authMode}:{accessMode}"` — optional, e.g. `device:freemium`
- `--verify` — verify current config without making changes

### About `--bundle-id`

The current script **does not expose a `--bundle-id` flag**. It derives bundle ID from app name as:

```text
com.{slug}.app
```

If you need a custom bundle ID, run setup first, then edit `mobile-app/app.json` (and native package IDs) manually.

### Example commands

```bash
# Interactive
./setup.sh

# Scripted
./setup.sh --non-interactive --name "{App Name}" --mode "device:freemium"

# Verify-only
./setup.sh --verify
```

### Expected success output

Typical success indicators:
- `✅ app.json`
- `✅ package.json`
- `✅ theme.ts`
- `✅ app.ts`
- `✅ iap.ts`
- `✅ Done`

### Common failure modes

- `--name is required in non-interactive mode`
  - Fix: pass `--name "{App Name}"`
- `No brand colors found in design files. Add designs to design/ first.`
  - Fix: add at least one `design/*/code.html` containing tailwind colors (`primary`, etc.)
- `Can't find mobile-app/app.json. Run this script from the skeleton repo root.`
  - Fix: run script from repo root (`mobile-skeleton-app/`)

## Step 0: Configure App Behavior

Before renaming anything, decide how your app will work:

### Choose your modes (`src/config/app.ts` + `src/config/iap.ts`)

```ts
// src/config/app.ts
authMode: 'device'     // 'device' = no backend needed | 'backend' = full server auth

// src/config/iap.ts
paymentMode: 'device'  // 'device' = StoreKit 2 local | 'backend' = server verification
accessMode: 'freemium' // 'freemium' | 'paid' (IAP gate) | 'unlocked' (paid download)
```

See [App Modes](../02-configuration/app-modes.md) for details on each option.

### Set your brand colors (`src/config/theme.ts`)

```ts
const brand = {
  primary: '#YOUR_COLOR',  // Main brand color
  secondary: '#...',
  accent: '#...',
};
```

See [Theming](../02-configuration/theming.md) for the full rebranding checklist.

### Set your product IDs (`src/config/iap.ts`)

```ts
ios: { oneTime: ['com.yourapp.lifetime'] },
android: { oneTime: ['com.yourapp.lifetime'] },
```

## Step-by-Step Changes

### 1) Create env files
```bash
cp backend/.env.example backend/.env
cp mobile-app/.env.example mobile-app/.env
```

### 2) Root metadata
Update `package.json`:
- `"name": "mobile-skeleton-app"` → `{App_Name}`
- `"description"` → your new app description
- `"repository.url"` → `{Repository_URL}`
- `"author"` → `{Author_Name}`

### 3) Expo app identity
Update `mobile-app/app.json`:
- `name`: `{App_Display_Name}`
- `slug`: `{App_Name}`
- `scheme`: `{Deep_Link_Scheme}`
- `ios.bundleIdentifier`: `{Bundle_Identifier}`
- `android.package`: `{Bundle_Identifier}`
- `owner`: `{Expo_Username}`

Also update the deep link scheme in `intentFilters` to match.

### 4) Android native identity
Update:
- `mobile-app/android/settings.gradle` — `rootProject.name`
- `mobile-app/android/app/build.gradle` — `namespace` + `applicationId`
- `mobile-app/android/app/src/main/res/values/strings.xml` — `app_name`
- `mobile-app/android/app/src/main/AndroidManifest.xml` — `android:scheme`
- `MainActivity.kt` + `MainApplication.kt` package declarations

Move the Android package folder to match `{Bundle_Identifier}`.

### 5) Deep link + email branding
- `mobile-app/src/utils/deepLinking.ts` — update scheme check
- `backend/src/modules/email/email.service.ts` — update scheme + app name

### 6) Database name
- `docker-compose.yml`: `POSTGRES_DB`
- `backend/.env` + `.env.example`: `DATABASE_URL`

### 7) JWT issuer/audience
Update in:
- `backend/src/modules/auth/auth.module.ts`
- `backend/src/modules/auth/strategies/jwt.strategy.ts`

### 8) OAuth redirects
Update `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` in:
- `backend/.env`
- `mobile-app/.env`

Format:
```
https://auth.expo.io/@{Expo_Username}/{App_Name}
```

### 9) Regenerate lockfiles
After renames:
```bash
npm install
cd mobile-app && npm install
```

## Verification Checklist

- [ ] `backend/.env` + `mobile-app/.env` exist
- [ ] `docker-compose up -d` works
- [ ] `npm run db:setup` succeeds
- [ ] App builds with `npx expo run:ios` / `npx expo run:android`
- [ ] No old identifiers remain
  ```bash
  rg -n "mobile-skeleton-app|mobile_skeleton_db|com\.yourcompany\.mobileapp|mobile-app-skeleton|mobile-app-users" -S .
  ```

## Next Steps

- [Local Development Setup](local-dev-setup.md)
- [Google OAuth](../04-authentication/google-oauth.md)
