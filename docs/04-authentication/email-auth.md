# Email/Password Authentication

> ⚠️ **Requires development builds**
> Native modules are required for the full app. **Expo Go is not supported.**
> Use **`npx expo run:ios`** / **`npx expo run:android`**.

This backend provides a full email/password authentication system with verification, JWTs, and refresh tokens.

> ⚠️ **Backend mode only.** Email login requires a running backend to send verification codes. When `authMode: 'device'`, the email login form is hidden on the WelcomeScreen. See [App Modes](../02-configuration/app-modes.md).

## Features

- User registration with email verification
- Secure password hashing (bcrypt)
- JWT access + refresh tokens
- Refresh token revocation (stored in DB)

## Core Components

- `src/utils/auth.ts` — hashing, validation, token generation
- `src/services/authService.ts` — register/login/verify flows
- `src/middleware/auth.ts` — route guards
- `src/controllers/authController.ts` — HTTP endpoints

## Password Rules

- Minimum 8 characters
- Must include uppercase, lowercase, and number

## API Endpoints

### Register
```http
POST /api/auth/register

{
  "email": "user@example.com",
  "nickname": "username",
  "password": "SecurePassword123"
}
```

### Login
```http
POST /api/auth/login

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

### Verify Email
```http
POST /api/auth/verify-email

{
  "token": "verification-token"
}
```

### Refresh Token
```http
POST /api/auth/refresh-token

{
  "refreshToken": "refresh-token"
}
```

## Environment Variables (Backend)

```env
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_FROM=noreply@example.com
EMAIL_DEV_MODE=true
```

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Related Docs

- [Google OAuth](google-oauth.md)
- [Apple Sign‑In](apple-sign-in.md)
