# Implementation Plan: Mobile App Skeleton

## Overview

This implementation plan documents the completed mobile-app-skeleton application. All tasks are marked as completed [x] since this is a retroactive specification of an existing, working system. The implementation includes a cross-platform mobile app (Expo SDK 54 + React Native 0.81.5), a NestJS backend API with PostgreSQL.

## Tasks

- [x] 1. Project Setup and Infrastructure
  - [x] 1.1 Initialize Expo project with SDK 54 and React Native 0.81.5
    - Configure New Architecture (newArchEnabled: true)
    - Set up TypeScript configuration
    - Configure Expo Router for file-based navigation
    - _Requirements: 19.1, 19.5, 19.6_
  
  - [x] 1.2 Initialize NestJS backend project
    - Set up NestJS 10 with TypeScript
    - Configure module structure (auth, user, payments, ads, email, scheduler)
    - Set up environment variable configuration
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [x] 1.3 Set up PostgreSQL database with Prisma
    - Configure Prisma 6 with PostgreSQL datasource
    - Create initial schema with User, Payment, Session, AuthCode, RefreshToken, AppConfig, AdConfig, AdAnalytics models
    - Set up database migrations
    - Create seed data for testing
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_
    - [x] 1.5 Configure development environment
    - Set up Docker Compose for local PostgreSQL
    - Create .env.example files for all modules
    - Configure ESLint and Prettier
    - Set up Git repository structure
    - _Requirements: All_


- [x] 2. Email-Based Authentication Implementation
  - [x] 2.1 Create AuthCode model and email login endpoint
    - Implement POST /auth/email-login endpoint
    - Generate 6-digit verification codes
    - Store codes in AuthCode table with 10-minute expiration
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 2.2 Implement email service with Resend integration
    - Create EmailService with sendVerificationCode method
    - Integrate Resend API for email delivery
    - Implement EMAIL_DEV_MODE for console logging
    - Create email templates for verification codes
    - _Requirements: 1.2, 16.1, 16.2, 16.3_
  
  - [x] 2.3 Create code verification endpoint
    - Implement POST /auth/verify-code endpoint
    - Validate code against database
    - Check expiration and attempt limits
    - Mark code as used after successful verification
    - _Requirements: 1.4, 1.6, 1.7, 1.8_
  
  - [x] 2.4 Implement JWT token generation
    - Generate access tokens with 30-day expiration
    - Generate refresh tokens with 365-day expiration
    - Store refresh tokens in database
    - Return tokens in verification response
    - _Requirements: 1.4, 1.5, 4.1, 4.2_
  
  - [x] 2.5 Create mobile email login screens
    - Build email input screen with validation
    - Create verification code input screen
    - Implement useEmailLogin and useVerifyCode hooks
    - Add error handling and loading states
    - _Requirements: 1.1, 1.4, 1.7_

- [x] 3. Google Sign-In Integration
  - [x] 3.1 Set up Google OAuth backend service
    - Install and configure Google OAuth libraries
    - Create GoogleAuthService for ID token verification
    - Implement POST /auth/google endpoint
    - Handle new user creation and existing user login
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [x] 3.2 Integrate Google Sign-In SDK in mobile app
    - Install @react-native-google-signin/google-signin
    - Configure Google Sign-In for iOS and Android
    - Create GoogleSignInButton component
    - Implement useGoogleLogin hook
    - _Requirements: 2.1, 2.6, 2.7_
  
  - [x] 3.3 Implement device mode for Google Sign-In
    - Add authMode configuration check
    - Store user data locally when authMode is 'device'
    - Skip backend verification in device mode
    - _Requirements: 2.6, 22.1, 22.2_

- [x] 4. Apple Sign-In Integration
  - [x] 4.1 Set up Apple authentication backend service
    - Create AppleAuthService for identity token verification
    - Implement POST /auth/apple endpoint
    - Handle fullName data from Apple
    - Support new user creation and existing user login
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.2 Integrate Apple Sign-In in mobile app
    - Install expo-apple-authentication
    - Create AppleSignInButton component (iOS only)
    - Implement useAppleLogin hook
    - Hide button on Android and Web
    - _Requirements: 3.1, 3.6, 3.7_
  
  - [x] 4.3 Implement device mode for Apple Sign-In
    - Add authMode configuration check
    - Store user data locally when authMode is 'device'
    - Skip backend verification in device mode
    - _Requirements: 3.6, 22.1, 22.2_


- [x] 5. JWT Token Management and Refresh Flow
  - [x] 5.1 Create refresh token endpoint
    - Implement POST /auth/refresh-token endpoint
    - Validate refresh token against database
    - Generate new access and refresh tokens
    - Implement token rotation
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [x] 5.2 Implement logout functionality
    - Create POST /auth/logout endpoint
    - Invalidate refresh token in database
    - Clear tokens from mobile storage
    - _Requirements: 4.6, 4.7_
  
  - [x] 5.3 Create JWT authentication guards
    - Implement JwtAuthGuard for protected endpoints
    - Create JWT strategy for token validation
    - Add CurrentUser decorator for user data extraction
    - _Requirements: 23.1, 23.3_
  
  - [x] 5.4 Implement token refresh logic in mobile app
    - Create useRefreshToken hook
    - Implement automatic token refresh on 401 errors
    - Store tokens securely in MMKV
    - _Requirements: 4.3, 4.5, 20.1, 20.2_

- [x] 6. User Profile Management
  - [x] 6.1 Create user profile endpoints
    - Implement GET /users/profile endpoint
    - Implement PUT /users/profile endpoint
    - Add email format validation
    - Set isEmailVerified to false on email change
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 6.2 Create VerifiedEmailGuard
    - Implement guard to check isEmailVerified status
    - Apply to sensitive endpoints (profile update, password change, account deletion)
    - Return 403 Forbidden for unverified users
    - _Requirements: 23.2, 23.4_
  
  - [x] 6.3 Build profile screen in mobile app
    - Create profile screen with user information display
    - Implement editable form with react-hook-form
    - Add yup validation schema
    - Create useProfile and useUpdateProfile hooks
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_

- [x] 7. Password Management
  - [x] 7.1 Implement password change endpoint
    - Create PUT /users/password endpoint
    - Verify current password with bcrypt
    - Validate new password requirements
    - Hash new password and update database
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 7.2 Create password change screen in mobile app
    - Build password change form with validation
    - Implement useChangePassword hook
    - Add error handling for incorrect current password
    - Disable for Google-only or Apple-only users
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 8. Account Deletion
  - [x] 8.1 Implement account deletion endpoint
    - Create DELETE /users/account endpoint
    - Implement cascade deletion for related records
    - Return success response
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 8.2 Build account deletion flow in mobile app
    - Create confirmation dialog
    - Implement useDeleteAccount hook
    - Clear local storage on success
    - Redirect to welcome screen
    - _Requirements: 7.1, 7.4, 7.5_


- [x] 9. iOS In-App Purchases with StoreKit 2
  - [x] 9.1 Install and configure react-native-iap
    - Install react-native-iap v14+ with StoreKit 2 support
    - Configure iOS project for IAP
    - Set up App Store Connect products (app_lifetime)
    - _Requirements: 8.3, 8.4_
  
  - [x] 9.2 Implement iOS IAP purchase flow
    - Create useIAP hook for purchase management
    - Implement product fetching from App Store
    - Handle purchase initiation and completion
    - _Requirements: 8.3, 8.4, 8.5_
  
  - [x] 9.3 Implement device mode receipt verification
    - Use StoreKit 2 for on-device verification
    - Update local premium status
    - Store purchase data in MMKV
    - _Requirements: 8.1, 8.6_
  
  - [x] 9.4 Create backend receipt verification service
    - Implement ReceiptVerificationService
    - Verify iOS receipts with Apple's servers
    - Create POST /payments/verify-receipt endpoint
    - Update user premium status in database
    - _Requirements: 8.2, 8.7, 8.8, 8.9_

- [x] 10. Android In-App Purchases with Google Play Billing
  - [x] 10.1 Configure Google Play Billing
    - Set up Google Play Console products
    - Configure subscriptions (app_pro_monthly, app_pro_yearly)
    - Configure one-time purchase (app_lifetime)
    - _Requirements: 9.3, 9.4, 9.5_
  
  - [x] 10.2 Implement Android IAP purchase flow
    - Extend useIAP hook for Android
    - Implement product fetching from Play Store
    - Handle purchase and subscription flows
    - _Requirements: 9.3, 9.4, 9.5_
  
  - [x] 10.3 Implement backend receipt verification for Android
    - Extend ReceiptVerificationService for Android
    - Verify purchase tokens with Google Play API
    - Handle subscription and one-time purchase verification
    - Update premium status and expiry dates
    - _Requirements: 9.1, 9.2, 9.6, 9.7, 9.8, 9.9_

- [x] 11. Subscription Lifecycle Management
  - [x] 11.1 Create subscription lifecycle service
    - Implement SubscriptionLifecycleService
    - Add methods for checking subscription status
    - Implement renewal detection logic
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [x] 11.2 Implement scheduler for subscription checks
    - Create SchedulerService with @nestjs/schedule
    - Add daily cron job for subscription expiry checks
    - Query stores for renewal status
    - Update premium status based on results
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  
  - [x] 11.3 Implement subscription cancellation
    - Create POST /payments/user/cancel-subscription endpoint
    - Maintain premium access until period ends
    - Update status to FREE after expiry
    - _Requirements: 10.6, 10.7_

- [x] 12. Premium Status and Access Control
  - [x] 12.1 Implement premium status determination logic
    - Create helper functions for premium status checks
    - Handle PREMIUM_LIFETIME, PREMIUM_SUBSCRIPTION, and FREE statuses
    - Check premiumExpiry for subscription validity
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 12.2 Implement access mode configurations
    - Add IAP_CONFIG with accessMode setting (default: 'freemium')
    - Implement freemium mode: free access with ads, optional premium
    - Implement paid mode: PaywallGate wraps root layout, shows full-screen PremiumScreen until purchase
    - Implement unlocked mode: useDevicePremiumStatus always returns PREMIUM_LIFETIME, no IAP/ads
    - Create PaywallGate component (`src/components/PaywallGate.tsx`)
    - _Requirements: 11.5, 11.6, 11.7, 22.8, 22.9, 22.10_

  - [x] 12.5 Add local payments v1 guardrails for consumables (coins)
    - Implement local transaction idempotency (`@coins/processed-transactions`)
    - Implement append-only local coin ledger (`@coins/ledger`)
    - Apply idempotent grant flow on purchase + restore
    - Keep strict SKU mapping for coin grants
    - _Requirements: 11.1, 11.3, 20.1, 20.2_
  
  - [x] 12.3 Create premium status endpoints
    - Implement GET /payments/user/status endpoint
    - Return premium status, expiry, and payment history
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [x] 12.4 Build premium screen in mobile app
    - Create premium/IAP screen with product listings
    - Display features for each product
    - Implement purchase buttons
    - Show current premium status
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_


- [x] 13. Advertisement System Implementation
  - [x] 13.1 Create ad configuration models and endpoints
    - Create AdConfig and AdAnalytics models in Prisma
    - Implement GET /ads/configs endpoint
    - Implement POST /ads/configs endpoint for upsert
    - Implement PUT /ads/configs/:configId/disable endpoint
    - _Requirements: 12.1, 12.2_
  
  - [x] 13.2 Implement ad serving logic
    - Create GET /ads/serve/:adType endpoint
    - Check user premium status before serving ads
    - Return null for premium users
    - Return ad configuration for free users
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.6_
  
  - [x] 13.3 Create ad analytics tracking
    - Implement POST /ads/track endpoint
    - Track IMPRESSION, CLICK, CLOSE, ERROR actions
    - Store userId, adType, action, adNetworkId, timestamp
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 13.4 Implement ad analytics query endpoint
    - Create GET /ads/analytics endpoint
    - Support date range filtering
    - Return aggregated analytics data
    - _Requirements: 13.6_
  
  - [x] 13.5 Implement device-mode ad behavior
    - useAd returns SAMPLE_ADS directly when authMode is 'device' (no API call)
    - useTrackAdAnalytics silently no-ops when authMode is 'device'
    - All ad API calls use AD_TIMEOUT (2000ms) with fallback to SAMPLE_ADS on error
    - _Requirements: 12.1, 12.3, 13.1_
  
  - [x] 13.6 Implement premium-aware ad display
    - useShouldShowAds checks AsyncStorage `@iap_device_premium_status` in device mode
    - useShouldShowAds calls `/users/profile` and checks premiumStatus/premiumExpiry in backend mode
    - Hide all ads for premium users and when accessMode is 'unlocked'
    - useAdManager combines ad loading, premium check, and tracking into single hook
    - _Requirements: 12.6, 12.7, 12.8, 12.10_

- [x] 15. Email Service Integration
  - [x] 15.1 Create EmailService with Resend integration
    - Implement sendVerificationCode method
    - Implement sendPasswordReset method
    - Implement sendWelcomeEmail method
    - _Requirements: 16.1, 16.5, 16.6_
  
  - [x] 15.2 Implement dev mode for email testing
    - Add EMAIL_DEV_MODE environment variable
    - Log emails to console when dev mode is enabled
    - Send via Resend when dev mode is disabled
    - _Requirements: 16.2, 16.3_
  
  - [x] 15.3 Add error handling for email failures
    - Catch email send errors
    - Log errors without blocking auth flow
    - _Requirements: 16.4_

- [x] 16. Scheduled Tasks and Maintenance
  - [x] 16.1 Create SchedulerService with cron jobs
    - Set up @nestjs/schedule module
    - Create daily session cleanup job
    - Create daily subscription expiry check job
    - _Requirements: 17.1, 17.3_
  
  - [x] 16.2 Implement session cleanup logic
    - Query for expired sessions
    - Delete expired sessions from database
    - _Requirements: 17.1, 17.2_
  
  - [x] 16.3 Implement subscription expiry logic
    - Query for expired subscriptions
    - Update premium status to FREE
    - _Requirements: 17.3, 17.4_
  
  - [x] 16.4 Add error logging for scheduled tasks
    - Catch and log errors in cron jobs
    - Ensure jobs continue running after errors
    - _Requirements: 17.5_

- [x] 17. Mobile App Navigation and Screens
  - [x] 17.1 Set up Expo Router navigation
    - Configure file-based routing structure
    - Create root layout with providers
    - Set up authenticated and unauthenticated routes
    - _Requirements: 21.4_
  
  - [x] 17.2 Create authentication screens
    - Build Welcome screen (`app/(auth)/welcome.tsx`) with Google/Apple sign-in buttons
    - Hide email input/Continue button when `authMode: 'device'`
    - Build Verify Code screen (`app/(auth)/verify-code.tsx`) for backend-mode email login
    - Add dev-only "Component Library" text link on WelcomeScreen
    - _Requirements: 21.6, 22.1, 22.2_
  
  - [x] 17.3 Create authenticated app screens
    - Build Home screen with dev-only "Component Library" text link
    - Build Profile screen with premium status and "Manage Premium" link
    - Build Settings screen with language, notifications, security sub-screens
    - Build Premium screen with product listings and purchase flow
    - Build Component Showcase screen (dev-only, `app/(main)/components.tsx`)
    - _Requirements: 21.6_
  
  - [x] 17.4 Implement navigation guards
    - Redirect unauthenticated users to login
    - Redirect authenticated users to home
    - Handle deep linking
    - _Requirements: 21.4_

- [x] 18. State Management and Data Persistence
  - [x] 18.1 Set up TanStack Query
    - Configure QueryClient with default options
    - Set up QueryClientProvider
    - Configure cache time and stale time
    - _Requirements: 20.3, 20.4_
  
  - [x] 18.2 Implement storage layer
    - Use expo-secure-store for authentication tokens (encrypted)
    - Use MMKV for user preferences and non-sensitive cached data
    - Use AsyncStorage for device-mode premium status (`@iap_device_premium_status`) and debug flags (`@iap_debug_force_free`)
    - Create tokenService for managing auth tokens and user data
    - _Requirements: 20.1, 20.2, 20.3, 20.4_
  
  - [x] 18.3 Create custom hooks for API calls
    - Implement auth hooks (useEmailLogin, useVerifyCode, useGoogleLogin, useAppleLogin, useRefreshToken, useLogout)
    - Implement user hooks (useProfile, useUpdateProfile, useChangePassword, useDeleteAccount)
    - Implement payment hooks (useVerifyReceipt, usePaymentPlans, useUserPayments, useUserPremiumStatus, useCancelSubscription)
    - Implement ad hooks (useTrackAdAnalytics)
    - _Requirements: 20.3, 20.5_


- [x] 19. UI Components and Theming
  - [x] 19.1 Set up React Native Paper
    - Install and configure React Native Paper
    - Create theme configuration
    - Set up PaperProvider
    - _Requirements: 21.1, 21.2_
  
  - [x] 19.2 Create themed UI component library (`src/components/ui/`)
    - Build SearchInput, CategoryGrid, DataCard, CompactDataCard components
    - Build MetricBadge, ProgressRing (react-native-svg), StatGrid components
    - Build InfoBanner, ChipSelector, FeatureBadge, SectionHeader components
    - Create barrel export in `src/components/ui/index.ts`
    - Build ComponentShowcase screen at `app/(main)/components.tsx`
    - All components use `useAppTheme()` exclusively — never hardcoded colors
    - _Requirements: 21.1, 21.2, 21.3, 21.7, 21.8_
  
  - [x] 19.3 Set up form validation
    - Install react-hook-form and yup
    - Create validation schemas for forms
    - Implement form error handling
    - _Requirements: 21.3_
  
  - [x] 19.4 Create authentication UI components
    - Build GoogleSignInButton
    - Build AppleSignInButton
    - Build EmailLoginForm
    - Build AuthProvider context
    - _Requirements: 21.5_
  
  - [x] 19.5 Create payment UI components
    - Build PremiumCard component
    - Build SubscriptionButton component
    - Build OneTimePurchaseButton component
    - _Requirements: 21.5_

- [x] 20. Configuration and Modes
  - [x] 20.1 Create app configuration system
    - Create APP_CONFIG with authMode setting
    - Create IAP_CONFIG with paymentMode and accessMode settings
    - Create platform-specific IAP configurations
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7_
  
  - [x] 20.2 Implement configuration-based behavior
    - Add authMode checks in authentication flows
    - Add paymentMode checks in IAP flows
    - Add accessMode checks for app access
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7_
  
  - [x] 20.3 Create theme configuration
    - Define ThemeConfig interface
    - Implement theme loading and application
    - Support custom colors, fonts, and logos
    - _Requirements: 21.2_

- [x] 21. Security Implementation
  - [x] 21.1 Implement password hashing
    - Use bcrypt for password hashing
    - Configure appropriate salt rounds
    - Implement password comparison
    - _Requirements: 23.5_
  
  - [x] 21.2 Set up JWT authentication
    - Configure JWT strategy with passport
    - Implement JwtAuthGuard
    - Create CurrentUser decorator
    - _Requirements: 23.1, 23.3_
  
  - [x] 21.3 Implement VerifiedEmailGuard
    - Create guard to check email verification
    - Apply to sensitive endpoints
    - Return 403 for unverified users
    - _Requirements: 23.2, 23.4_
  
  - [x] 21.4 Add input validation
    - Use class-validator for DTOs
    - Implement validation pipes
    - _Requirements: 23.5_
  
  - [x] 21.5 Configure secure storage
    - Use MMKV for token storage
    - Implement secure storage utilities
    - _Requirements: 23.6, 20.1, 20.2_


- [x] 22. Testing Implementation
  - [x] 22.1 Set up backend testing infrastructure
    - Configure Jest for NestJS
    - Set up test database
    - Create test utilities and mocks
    - _Requirements: All_
  
  - [x] 22.2 Write backend unit tests
    - Test AuthService methods (emailLogin, verifyCode, refreshToken)
    - Test GoogleAuthService and AppleAuthService
    - Test UserService methods (getProfile, updateProfile, changePassword, deleteAccount)
    - Test PaymentsService and ReceiptVerificationService
    - Test AdsService methods
    - Test EmailService methods
    - _Requirements: All_
  
  - [x] 22.3 Write backend integration tests
    - Test auth endpoints with Supertest
    - Test user endpoints
    - Test payment endpoints
    - Test ad endpoints
    - _Requirements: All_
  
  - [x] 22.4 Set up mobile app testing infrastructure
    - Configure Jest for React Native
    - Set up React Native Testing Library
    - Create test utilities and mocks
    - _Requirements: All_
  
  - [x] 22.5 Write mobile app unit tests
    - Test custom hooks (useAuth, useIAP, useAds)
    - Test utility functions
    - Test component logic
    - _Requirements: All_
  
  - [x] 22.6 Write mobile app integration tests
    - Test screen rendering and navigation
    - Test form submission flows
    - Test authentication flows
    - Test IAP flows
    - _Requirements: All_
  
- [x] 23. Error Handling and Validation
  - [x] 23.1 Implement backend error handling
    - Create global exception filter
    - Define error response format
    - Implement error codes
    - Add error logging
    - _Requirements: All_
  
  - [x] 23.2 Implement mobile app error handling
    - Create error boundary components
    - Implement network error handling with retry
    - Add user-friendly error messages
    - Implement loading states
    - _Requirements: All_
  
  - [x] 23.3 Add form validation
    - Create yup schemas for all forms
    - Implement real-time validation
    - Add field-level error display
    - _Requirements: All_

- [x] 24. Documentation and Setup Guides
  - [x] 24.1 Create backend documentation
    - Write API endpoint documentation
    - Document environment variables
    - Create database setup guide
    - Write deployment guide
    - _Requirements: All_
  
  - [x] 24.2 Create mobile app documentation
    - Write setup and installation guide
    - Document configuration options
    - Create build and deployment guide
    - Write troubleshooting guide
    - _Requirements: All_
    - [x] 24.4 Create comprehensive README files
    - Write main project README
    - Create quick start guide
    - Document white-label customization
    - Add architecture documentation
    - _Requirements: All_

- [x] 25. Deployment and Production Setup
  - [x] 25.1 Configure production environment
    - Set up production database
    - Configure environment variables
    - Set up error tracking (Sentry)
    - Configure monitoring
    - _Requirements: All_
  
  - [x] 25.2 Set up iOS deployment
    - Configure App Store Connect
    - Set up EAS Build for iOS
    - Configure code signing
    - Create production build
    - _Requirements: 19.1, 19.2_
  
  - [x] 25.3 Set up Android deployment
    - Configure Google Play Console
    - Set up EAS Build for Android
    - Configure signing keys
    - Create production build
    - _Requirements: 19.1, 19.2_
  
  - [x] 25.4 Deploy backend API
    - Choose hosting provider
    - Set up production database
    - Configure environment variables
    - Deploy application
    - _Requirements: All_
  
## Notes

- All tasks are marked as completed [x] since this is a retroactive specification
- The implementation uses Expo SDK 54, React Native 0.81.5, NestJS 10, Prisma 6, and PostgreSQL
- The system supports two independent modules: mobile app and backend API
- **Default configuration is fully offline**: `authMode: 'device'`, `paymentMode: 'device'`, `accessMode: 'freemium'` — no backend needed
- Device mode: Google/Apple sign-in stores user info locally; email login hidden; token refresh skipped; ads use SAMPLE_ADS; analytics no-op
- The UI component library (`src/components/ui/`) has 11 themed components using `useAppTheme()` — see ComponentShowcase screen
- PaywallGate only activates when `accessMode === 'paid'`; freemium and unlocked modes bypass it
- Device premium status stored in AsyncStorage (`@iap_device_premium_status`), not MMKV
- `notifications-settings.tsx` — local notifications supported via `expo-notifications`; server-side push requires adding your own push service
- Asset directories: `assets/icons/` (app icons referenced by app.json), `assets/store/` (App Store/Play Store screenshots and assets)
- Design mockups workflow: Google Stitch → HTML+PNG per screen in `design/` directory → build from mockups
