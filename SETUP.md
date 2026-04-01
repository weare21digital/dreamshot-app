# Detailed Setup Guide

For the quick version, see [QUICK_START.md](QUICK_START.md).

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **Docker** — [Download](https://www.docker.com/) (for PostgreSQL)
- **Git** — [Download](https://git-scm.com/)
- **EAS CLI** — `npm install -g eas-cli` (for native builds)

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env       # Edit with your values
```

### Database

```bash
docker-compose up -d        # Start PostgreSQL (from project root)
npm run db:setup            # Migrate + seed
```

Verify: `npm run db:studio` opens Prisma Studio at http://localhost:5555

### Environment

Edit `backend/.env` — see [README.md](README.md#environment-variables) for all variables.

Key values to set:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — generate secure values for production
- `GOOGLE_CLIENT_ID` — Web client ID from Google Cloud (for Google Sign-In)
- `EMAIL_DEV_MODE=true` — logs verification codes to console (no email provider needed)

### Start

```bash
npm run dev     # Runs on http://localhost:3000
```

## Mobile App Setup

```bash
cd mobile-app
npm install
cp .env.example .env       # Edit with your values
```

### Environment

Edit `mobile-app/.env`:
- API URLs are pre-configured for local development
- For physical devices, use your machine's LAN IP instead of `localhost`
- Google OAuth client IDs — see [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

### Start (Expo Go — email auth only)

```bash
npm start
```

### Native Builds (required for Google/Apple sign-in)

```bash
eas login
eas init                          # Link to EAS project
npm run build:dev:android         # Development build
npm run build:dev:ios
```

## Physical Device Testing

Find your machine's IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

Update `mobile-app/.env`:
```env
EXPO_PUBLIC_API_URL_ANDROID=http://192.168.1.100:3000/api
EXPO_PUBLIC_API_URL_IOS=http://192.168.1.100:3000/api
```
