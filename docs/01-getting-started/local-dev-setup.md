# Local Development Setup

This guide covers running the mobile app locally, with or without a backend.

> This app uses native modules — `npx expo run:ios` / `npx expo run:android` required (Expo Go not supported).

## Device Mode (No Backend Needed)

If using `authMode: 'device'` + `paymentMode: 'device'`, you can skip the backend entirely:

```bash
# Clone and navigate
git clone https://github.com/YOUR_USERNAME/mobile-skeleton-app.git
cd mobile-skeleton-app/mobile-app

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Edit .env and add your Google iOS Client ID
# EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Build and run
npx expo run:ios
```

That's it. No Docker, no PostgreSQL, no backend server needed.

See [Google OAuth](../04-authentication/google-oauth.md) for how to get your iOS Client ID.

---

## Backend Mode (Full Setup)

If using `authMode: 'backend'` or `paymentMode: 'backend'`, you'll need the full stack.

### Prerequisites

- **Node.js 18+**
- **Docker** (for PostgreSQL)
- **Git**
- **Xcode 26+** (iOS builds on macOS)
- **Android Studio** (Android emulator)
- **CocoaPods** (`gem install cocoapods`)
- **Optional:** EAS CLI (`npm install -g eas-cli`)

## 1) Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/mobile-skeleton-app.git
cd mobile-skeleton-app
```

## 2) Automated Setup (recommended)

```bash
./setup.sh        # macOS/Linux
setup.bat         # Windows
```

This will:
- Start PostgreSQL via Docker
- Install dependencies
- Create `.env` files from examples
- Run migrations and seed data

## 3) Manual Setup (alternative)

```bash
# Start PostgreSQL
cd mobile-skeleton-app
docker-compose up -d

# Backend
cd backend
npm install
cp .env.example .env
npm run db:setup

# Mobile
cd ../mobile-app
npm install
cp .env.example .env
```

## 4) Environment Variables

### Backend (`backend/.env`)
Key values:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — generate secure values
- `GOOGLE_CLIENT_ID` — Google OAuth Web client ID
- `EMAIL_DEV_MODE=true` — logs verification codes to console

### Mobile (`mobile-app/.env`)
- `EXPO_PUBLIC_API_URL_WEB`
- `EXPO_PUBLIC_API_URL_ANDROID`
- `EXPO_PUBLIC_API_URL_IOS`
- `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID`

For physical devices, replace `localhost`/`10.0.2.2` with your LAN IP.

## 5) Run the App

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Mobile
cd mobile-app && npm start
```

> Use `npx expo run:ios` / `npx expo run:android` for native dev builds.

## Test Credentials

| Account | Email | Password |
|---------|-------|----------|
| Regular | `test@example.com` | `testpassword123` |
| Premium | `premium@example.com` | `testpassword123` |

## Common Scripts

### Backend
```bash
npm run dev
npm run db:setup
npm run db:migrate
npm run db:studio
```

### Mobile
```bash
npm start
npx expo run:ios
npx expo run:android
npm run build:dev:ios
npm run build:dev:android
```

## Next Steps

- [Emulator Setup](emulator-setup.md)
- [Network Setup](../07-reference/network-setup.md)
- [Google OAuth](../04-authentication/google-oauth.md)
