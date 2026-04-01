# Requirements Document

## Introduction

This document outlines the requirements for the mobile-app-skeleton, a comprehensive cross-platform mobile application framework built with Expo SDK 54 and React Native 0.81.5. The skeleton provides production-ready authentication (email/code, Google, Apple), in-app purchases with StoreKit 2 and Google Play Billing, advertising integration, user management, and configurable deployment modes. It serves as a foundation for building multiple white-label applications with flexible device-only or backend-integrated architectures.

## Glossary

- **System**: The mobile-app-skeleton application (mobile app + backend API)
- **Mobile_App**: The React Native Expo application running on iOS, Android, or Web
- **Backend_API**: The NestJS backend server with PostgreSQL database
- **User**: An end-user of the mobile application
- **Developer**: A developer building applications using this skeleton
- **Premium_User**: A user with active premium status (subscription or lifetime)
- **Free_User**: A user without premium status
- **Auth_Mode**: Configuration setting (device | backend) controlling authentication behavior
- **Payment_Mode**: Configuration setting (device | backend) controlling IAP verification
- **Access_Mode**: Configuration setting (freemium | paid | unlocked) controlling app monetization
- **StoreKit_2**: Apple's on-device receipt verification system for iOS
- **IAP**: In-App Purchase
- **JWT**: JSON Web Token for authentication
- **Expo_Push_Token**: Device-specific token for Expo push notifications
- **Receipt**: Purchase verification data from App Store or Play Store

## Requirements

### Requirement 1: Email-Based Authentication with Verification Codes

**User Story:** As a user, I want to log in using my email and a verification code, so that I can access the app without managing passwords.

#### Acceptance Criteria

1. WHEN a user enters their email on the login screen, THE Backend_API SHALL generate a 6-digit verification code
2. WHEN a verification code is generated, THE Backend_API SHALL send the code to the user's email address via Resend API
3. WHEN a verification code is created, THE System SHALL set an expiration time of 10 minutes
4. WHEN a user enters a valid verification code, THE Backend_API SHALL create a JWT access token with 30-day expiration
5. WHEN a user enters a valid verification code, THE Backend_API SHALL create a refresh token with 365-day expiration
6. WHEN a verification code is used successfully, THE System SHALL mark the code as used
7. WHEN a user enters an invalid or expired code, THE System SHALL return an error and increment the attempt counter
8. WHEN a verification code reaches maximum attempts, THE System SHALL invalidate the code


### Requirement 2: Google Sign-In Integration

**User Story:** As a user, I want to sign in with my Google account, so that I can quickly access the app using my existing credentials.

#### Acceptance Criteria

1. WHEN a user taps the Google Sign-In button, THE Mobile_App SHALL initiate the native Google Sign-In SDK flow
2. WHEN Google authentication succeeds, THE Mobile_App SHALL receive an ID token from Google
3. WHEN Auth_Mode is 'backend', THE Backend_API SHALL verify the Google ID token with Google's servers
4. WHEN Auth_Mode is 'backend' and the Google ID is new, THE Backend_API SHALL create a new user account
5. WHEN Auth_Mode is 'backend' and the Google ID exists, THE Backend_API SHALL return JWT tokens for the existing user
6. WHEN Auth_Mode is 'device', THE Mobile_App SHALL store user information locally without backend verification
7. WHEN Google Sign-In fails, THE System SHALL display an appropriate error message

### Requirement 3: Apple Sign-In Integration

**User Story:** As an iOS user, I want to sign in with my Apple ID, so that I can use Apple's privacy-focused authentication.

#### Acceptance Criteria

1. WHEN a user taps the Apple Sign-In button on iOS, THE Mobile_App SHALL initiate the expo-apple-authentication flow
2. WHEN Apple authentication succeeds, THE Mobile_App SHALL receive an identity token and optional user information
3. WHEN Auth_Mode is 'backend', THE Backend_API SHALL verify the Apple identity token
4. WHEN Auth_Mode is 'backend' and the Apple ID is new, THE Backend_API SHALL create a new user account with provided fullName
5. WHEN Auth_Mode is 'backend' and the Apple ID exists, THE Backend_API SHALL return JWT tokens for the existing user
6. WHEN Auth_Mode is 'device', THE Mobile_App SHALL store user information locally without backend verification
7. WHEN Apple Sign-In is accessed on Android or Web, THE System SHALL hide the Apple Sign-In button

### Requirement 4: JWT Token Management

**User Story:** As a user, I want my authentication session to persist securely, so that I don't have to log in repeatedly.

#### Acceptance Criteria

1. WHEN a user authenticates successfully, THE Backend_API SHALL generate an access token with 30-day expiration
2. WHEN a user authenticates successfully, THE Backend_API SHALL generate a refresh token with 365-day expiration
3. WHEN an access token expires, THE Mobile_App SHALL use the refresh token to obtain a new access token
4. WHEN a refresh token is used, THE Backend_API SHALL validate the token against the database
5. WHEN a refresh token is valid, THE Backend_API SHALL generate new access and refresh tokens
6. WHEN a user logs out, THE Backend_API SHALL invalidate the refresh token in the database
7. WHEN a refresh token is invalid or expired, THE System SHALL require the user to log in again


### Requirement 5: User Profile Management

**User Story:** As a user, I want to view and edit my profile information, so that I can keep my account details current.

#### Acceptance Criteria

1. WHEN a user accesses the profile screen, THE System SHALL display nickname, email, firstName, lastName, profilePicture, and premium status
2. WHEN a user updates their profile, THE System SHALL validate that email format is correct
3. WHEN a user updates their profile with valid data, THE Backend_API SHALL save changes to the database
4. WHEN a user updates their email, THE System SHALL set isEmailVerified to false
5. WHEN a profile update succeeds, THE System SHALL return the updated user data
6. WHEN a profile update fails validation, THE System SHALL return specific error messages

### Requirement 6: Password Management

**User Story:** As a user with email authentication, I want to change my password, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN a user requests to change password, THE System SHALL require the current password for verification
2. WHEN the current password is incorrect, THE System SHALL reject the password change request
3. WHEN the current password is correct, THE System SHALL validate the new password meets security requirements
4. WHEN the new password is valid, THE Backend_API SHALL hash the password using bcrypt
5. WHEN the password is changed successfully, THE Backend_API SHALL update the passwordHash in the database
6. WHEN a user has Google-only or Apple-only authentication, THE System SHALL not allow password changes

### Requirement 7: Account Deletion

**User Story:** As a user, I want to delete my account, so that I can remove my data from the system.

#### Acceptance Criteria

1. WHEN a user requests account deletion, THE System SHALL require confirmation
2. WHEN account deletion is confirmed, THE Backend_API SHALL delete the user record from the database
3. WHEN a user is deleted, THE System SHALL cascade delete all related payments, sessions, and refresh tokens
4. WHEN account deletion succeeds, THE System SHALL log the user out and redirect to the welcome screen
5. WHEN account deletion fails, THE System SHALL display an error message and maintain the current session


### Requirement 8: iOS In-App Purchases with StoreKit 2

**User Story:** As an iOS user, I want to purchase premium access, so that I can use the app without ads and access premium features.

#### Acceptance Criteria

1. WHEN Payment_Mode is 'device', THE Mobile_App SHALL use StoreKit 2 for on-device receipt verification
2. WHEN Payment_Mode is 'backend', THE Mobile_App SHALL send receipts to Backend_API for verification
3. WHEN a user initiates a purchase, THE Mobile_App SHALL use react-native-iap to communicate with StoreKit 2
4. WHEN a purchase is for 'app_lifetime', THE System SHALL process it as a non-consumable product
5. WHEN a purchase completes successfully, THE Mobile_App SHALL receive a transaction receipt
6. WHEN Payment_Mode is 'device' and purchase succeeds, THE Mobile_App SHALL verify the receipt locally using StoreKit 2
7. WHEN Payment_Mode is 'backend' and purchase succeeds, THE Backend_API SHALL verify the receipt with Apple's servers
8. WHEN receipt verification succeeds, THE System SHALL update the user's premium status to PREMIUM_LIFETIME
9. WHEN receipt verification fails, THE System SHALL display an error and not grant premium access

### Requirement 9: Android In-App Purchases with Google Play Billing

**User Story:** As an Android user, I want to purchase premium access via subscription or one-time payment, so that I can access premium features.

#### Acceptance Criteria

1. WHEN Payment_Mode is 'device', THE Mobile_App SHALL use Google Play Billing for purchase verification
2. WHEN Payment_Mode is 'backend', THE Mobile_App SHALL send purchase tokens to Backend_API for verification
3. WHEN a user views available products, THE System SHALL display 'app_pro_monthly', 'app_pro_yearly', and 'app_lifetime'
4. WHEN a user purchases 'app_pro_monthly' or 'app_pro_yearly', THE System SHALL process it as a subscription
5. WHEN a user purchases 'app_lifetime', THE System SHALL process it as a one-time purchase
6. WHEN a subscription purchase completes, THE Backend_API SHALL verify the purchase token with Google Play API
7. WHEN verification succeeds for a subscription, THE System SHALL set premium status to PREMIUM_SUBSCRIPTION with expiry date
8. WHEN verification succeeds for one-time purchase, THE System SHALL set premium status to PREMIUM_LIFETIME
9. WHEN a subscription expires, THE System SHALL revert premium status to FREE

### Requirement 10: Subscription Lifecycle Management

**User Story:** As a user with a subscription, I want my subscription to renew automatically, so that I maintain uninterrupted premium access.

#### Acceptance Criteria

1. WHEN a subscription is active, THE Backend_API SHALL store the expiry date in the premiumExpiry field
2. WHEN the scheduler runs, THE System SHALL check for subscriptions expiring within 24 hours
3. WHEN a subscription is near expiry, THE System SHALL query the store for renewal status
4. WHEN a subscription has renewed, THE Backend_API SHALL update the expiry date and maintain PREMIUM_SUBSCRIPTION status
5. WHEN a subscription has not renewed and is expired, THE Backend_API SHALL set premium status to FREE
6. WHEN a user cancels their subscription, THE System SHALL maintain premium access until the current period ends
7. WHEN a cancelled subscription expires, THE System SHALL set premium status to FREE


### Requirement 11: Premium Status Determination

**User Story:** As a user, I want my premium status to be accurately reflected throughout the app, so that I receive the correct features and experience.

#### Acceptance Criteria

1. WHEN a user has PREMIUM_LIFETIME status, THE System SHALL grant permanent premium access
2. WHEN a user has PREMIUM_SUBSCRIPTION status and premiumExpiry is in the future, THE System SHALL grant premium access
3. WHEN a user has PREMIUM_SUBSCRIPTION status and premiumExpiry is in the past, THE System SHALL treat the user as FREE
4. WHEN a user has FREE status, THE System SHALL display advertisements and restrict premium features
5. WHEN Access_Mode is 'unlocked', THE System SHALL grant premium access to all users regardless of payment status
6. WHEN Access_Mode is 'paid', THE System SHALL require IAP purchase before allowing app access
7. WHEN Access_Mode is 'freemium', THE System SHALL allow free access with ads and optional premium upgrade

### Requirement 12: Advertisement Display System

**User Story:** As a developer, I want to display advertisements to free users, so that I can monetize the application.

#### Acceptance Criteria

1. WHEN Auth_Mode is 'device', THE Mobile_App SHALL use local SAMPLE_ADS (predefined banner/interstitial configs) without backend API calls
2. WHEN Auth_Mode is 'backend', THE Mobile_App SHALL fetch ad configurations from Backend_API with a 2-second timeout (AD_TIMEOUT)
3. WHEN a backend ad request fails or times out, THE Mobile_App SHALL fall back to SAMPLE_ADS
4. WHEN an active BANNER ad configuration exists, THE Mobile_App SHALL display a banner advertisement
5. WHEN an active INTERSTITIAL ad configuration exists, THE Mobile_App SHALL display full-screen video ads based on displayFrequency
6. WHEN checking premium status in device mode, THE System SHALL read AsyncStorage key `@iap_device_premium_status` to determine if ads should be hidden
7. WHEN checking premium status in backend mode, THE System SHALL call `/users/profile` and check `premiumStatus` and `premiumExpiry`
8. WHEN a Premium_User accesses any screen, THE System SHALL not display any advertisements
9. WHEN an ad fails to load, THE System SHALL handle the error gracefully without breaking app functionality
10. WHEN Access_Mode is 'unlocked', THE System SHALL not display any advertisements

### Requirement 13: Advertisement Analytics Tracking

**User Story:** As a developer, I want to track ad performance, so that I can optimize ad placement and revenue.

#### Acceptance Criteria

1. WHEN Auth_Mode is 'device', THE Mobile_App SHALL silently skip all ad analytics tracking (no-op)
2. WHEN Auth_Mode is 'backend' and an ad is displayed, THE System SHALL record an IMPRESSION action in AdAnalytics
3. WHEN Auth_Mode is 'backend' and a user clicks an ad, THE System SHALL record a CLICK action in AdAnalytics
4. WHEN Auth_Mode is 'backend' and a user closes an interstitial ad, THE System SHALL record a CLOSE action in AdAnalytics
5. WHEN Auth_Mode is 'backend' and an ad fails to load or display, THE System SHALL record an ERROR action in AdAnalytics
6. WHEN analytics are recorded, THE System SHALL store userId (if authenticated), adType, action, adNetworkId, and timestamp
7. WHEN a developer queries analytics, THE Backend_API SHALL return aggregated data for the specified date range


### Requirement 16: Email Service Integration

**User Story:** As a user, I want to receive emails for verification codes and account actions, so that I can complete authentication and stay informed.

#### Acceptance Criteria

1. WHEN a verification code is generated, THE Backend_API SHALL send an email via Resend API
2. WHEN EMAIL_DEV_MODE is true, THE System SHALL log emails to console instead of sending
3. WHEN EMAIL_DEV_MODE is false, THE System SHALL send emails via Resend API
4. WHEN an email send fails, THE Backend_API SHALL log the error but not block the authentication flow
5. WHEN a password reset is requested, THE Backend_API SHALL send a password reset email
6. WHEN a new user registers, THE Backend_API SHALL send a welcome email


### Requirement 17: Scheduled Tasks

**User Story:** As a system administrator, I want automated maintenance tasks to run periodically, so that the system remains clean and efficient.

#### Acceptance Criteria

1. WHEN the scheduler runs daily, THE Backend_API SHALL check for expired sessions
2. WHEN expired sessions are found, THE Backend_API SHALL delete them from the database
3. WHEN the scheduler runs daily, THE Backend_API SHALL check for expired subscriptions
4. WHEN expired subscriptions are found, THE Backend_API SHALL update user premium status to FREE
5. WHEN scheduled tasks fail, THE System SHALL log errors for monitoring

### Requirement 18: Database Schema and Relationships

**User Story:** As a developer, I want a well-structured database schema, so that data integrity is maintained across all operations.

#### Acceptance Criteria

1. WHEN a User is deleted, THE System SHALL cascade delete all related Payment, Session, RefreshToken, and AdAnalytics records
2. WHEN a Payment is created, THE System SHALL require a valid userId foreign key
3. WHEN a Session is created, THE System SHALL require a valid userId foreign key
4. WHEN a RefreshToken is created, THE System SHALL require a valid userId foreign key
5. WHEN an AdAnalytics record is created with userId, THE System SHALL validate the userId exists
6. WHEN a User email is updated, THE System SHALL enforce uniqueness constraint
7. WHEN a User googleId or appleId is set, THE System SHALL enforce uniqueness constraint

### Requirement 19: Cross-Platform Mobile App Support

**User Story:** As a user, I want to use the app on iOS, Android, or Web, so that I can access it from my preferred device.

#### Acceptance Criteria

1. WHEN the app is built for iOS, THE System SHALL generate an iOS app bundle compatible with App Store
2. WHEN the app is built for Android, THE System SHALL generate an APK or AAB compatible with Google Play Store
3. WHEN the app is accessed via web, THE System SHALL provide a responsive web interface
4. WHEN platform-specific features are used, THE System SHALL gracefully handle unavailable features on other platforms
5. WHEN the app uses native modules, THE System SHALL require React Native New Architecture (newArchEnabled: true)
6. WHEN the app is built, THE System SHALL use Expo SDK 54 and React Native 0.81.5


### Requirement 20: State Management and Data Persistence

**User Story:** As a user, I want my app state to persist across sessions, so that I don't lose my preferences and data.

#### Acceptance Criteria

1. WHEN the Mobile_App stores authentication tokens, THE System SHALL use expo-secure-store for encrypted storage
2. WHEN the Mobile_App stores user preferences or non-sensitive data, THE System SHALL use MMKV for fast key-value storage
3. WHEN Payment_Mode is 'device', THE System SHALL store premium status in AsyncStorage under key `@iap_device_premium_status`
4. WHEN Payment_Mode is 'device' and debug reset is needed, THE System SHALL check AsyncStorage key `@iap_debug_force_free`
5. WHEN the app uses TanStack Query, THE System SHALL cache API responses for improved performance
6. WHEN the app is offline, THE System SHALL use cached data when available
7. WHEN cached data is stale, THE System SHALL refetch from the API when online

### Requirement 21: UI Components and Theming

**User Story:** As a developer, I want a consistent UI component library, so that I can build screens quickly with a cohesive design.

#### Acceptance Criteria

1. WHEN the Mobile_App renders UI components, THE System SHALL use React Native Paper for base components and a custom themed UI library (`src/components/ui/`)
2. WHEN theme configuration is loaded, THE System SHALL apply brand colors, status colors, light/dark palettes, shape, and typography via `useAppTheme()` hook
3. WHEN custom UI components are rendered, THE System SHALL use theme tokens exclusively — never hardcoded colors
4. WHEN forms are rendered, THE System SHALL use react-hook-form with yup validation
5. WHEN navigation occurs, THE System SHALL use Expo Router with file-based routing
6. WHEN screens are displayed, THE System SHALL include: Welcome, Verify Code, Home, Profile, Settings, Premium, Component Showcase (dev-only), and additional settings screens (language, notifications, security)
7. WHEN the custom UI library is used, THE System SHALL provide these components: SearchInput, CategoryGrid, DataCard, CompactDataCard, MetricBadge, ProgressRing (requires react-native-svg), StatGrid, InfoBanner, ChipSelector, FeatureBadge, SectionHeader
8. WHEN brand-tinted backgrounds are needed, THE System SHALL use the pattern `${brand.primary}06` for subtle bg and `${brand.primary}12` for borders

### Requirement 22: Configuration Modes

**User Story:** As a developer, I want to configure the app's behavior modes, so that I can deploy different variations without code changes.

**Default configuration:** `authMode: 'device'`, `paymentMode: 'device'`, `accessMode: 'freemium'` (fully offline, no backend needed)

#### Acceptance Criteria

1. WHEN APP_CONFIG.authMode is 'device' (default), THE System SHALL handle authentication locally without backend API calls
2. WHEN APP_CONFIG.authMode is 'device', THE System SHALL hide email login on WelcomeScreen (email requires backend for codes)
3. WHEN APP_CONFIG.authMode is 'device', THE System SHALL skip the 401 token refresh interceptor in apiClient
4. WHEN APP_CONFIG.authMode is 'backend', THE System SHALL authenticate via Backend_API with JWT tokens
5. WHEN IAP_CONFIG.paymentMode is 'device' (default), THE System SHALL verify receipts locally using StoreKit 2
6. WHEN IAP_CONFIG.paymentMode is 'device', THE System SHALL store premium status in AsyncStorage key `@iap_device_premium_status`
7. WHEN IAP_CONFIG.paymentMode is 'backend', THE System SHALL verify receipts via Backend_API
8. WHEN IAP_CONFIG.accessMode is 'freemium' (default), THE System SHALL allow free access with ads and optional premium upgrade
9. WHEN IAP_CONFIG.accessMode is 'paid', THE System SHALL wrap the root layout in PaywallGate, showing a full-screen PremiumScreen with no escape until purchase
10. WHEN IAP_CONFIG.accessMode is 'unlocked', THE System SHALL grant full access without IAP or ads, and useDevicePremiumStatus SHALL always return PREMIUM_LIFETIME

### Requirement 23: Security and Guards

**User Story:** As a system administrator, I want secure API endpoints, so that unauthorized users cannot access protected resources.

#### Acceptance Criteria

1. WHEN a protected endpoint is accessed, THE Backend_API SHALL validate the JWT token using JwtAuthGuard
2. WHEN an endpoint requires email verification, THE Backend_API SHALL validate using VerifiedEmailGuard
3. WHEN a JWT token is invalid or expired, THE System SHALL return 401 Unauthorized
4. WHEN a user is not email verified, THE System SHALL return 403 Forbidden for verified-only endpoints
5. WHEN passwords are stored, THE System SHALL hash them using bcrypt with appropriate salt rounds
6. WHEN API requests are made, THE System SHALL use HTTPS/TLS for all communications
