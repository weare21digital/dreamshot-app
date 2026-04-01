# Quick Start

Get running in 5 minutes with email/password auth (Google/Apple sign-in needs additional setup — see [README.md](README.md)).

## 1. Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

## 2. Setup

```bash
git clone https://github.com/xAleksandar/mobile-skeleton-app.git
cd mobile-skeleton-app

# Automated setup (starts DB, installs deps, seeds data)
./setup.sh        # macOS/Linux
setup.bat         # Windows
```

## 3. Run

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd mobile-app && npm start
# Press 'w' for web, 'i' for iOS simulator, 'a' for Android emulator
```

## 4. Test

- **Email**: `test@example.com` / `testpassword123`
- **Premium**: `premium@example.com` / `testpassword123`

## Next Steps

- Set up [Google Sign-In](GOOGLE_OAUTH_SETUP.md) and Apple Sign-In
- Read the full [README.md](README.md) for forking guide, EAS builds, and env reference
