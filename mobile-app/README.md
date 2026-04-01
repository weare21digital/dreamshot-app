# Mobile App

React Native Expo frontend for the Mobile App Skeleton.

## Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── services/       # API services
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── hooks/          # Custom React hooks
├── context/        # React context providers
├── navigation/     # Navigation configuration
└── __tests__/      # Test files
```

## Features

- Cross-platform support (iOS, Android, Web)
- TypeScript for type safety
- Expo for rapid development
- Modular component architecture
- Theme support for white-labeling
- Authentication flow
- Premium subscription handling
- Advertisement integration

## Screens (to be implemented)

- Welcome Screen
- Registration Screen
- Login Screen
- Email Verification Screen
- Profile Screen
- Settings Screen
- Premium Purchase Screen

## Components (to be implemented)

- ThemeProvider
- BrandingWrapper
- ConfigurableButton
- ConfigurableInput
- BannerAd
- InterstitialAd
- AdManager

## Development

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## Configuration

Create a `.env` file in the project root:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### AI Background Changer env (optional)

The AI Background Changer supports provider-based image generation (OpenAI default).

```
EXPO_PUBLIC_AI_IMAGE_PROVIDER=openai

# OpenAI provider
EXPO_PUBLIC_AI_BG_API_URL=https://api.openai.com/v1/images/edits
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key
# EXPO_PUBLIC_AI_BG_API_KEY=your-openai-api-key
EXPO_PUBLIC_AI_BG_MODEL=gpt-image-1

# fal.ai provider (scaffolded in this version)
# EXPO_PUBLIC_FAL_API_KEY=your-fal-api-key

# optional local validation mode (no live AI call)
# EXPO_PUBLIC_AI_BG_DEMO_MODE=1
```

Provider switching is a one-line env change via `EXPO_PUBLIC_AI_IMAGE_PROVIDER`.
If `EXPO_PUBLIC_AI_BG_API_URL` is not set, OpenAI defaults to `https://api.openai.com/v1/images/edits`.
If `EXPO_PUBLIC_AI_BG_DEMO_MODE=1`, Apply returns a sample background image so picker/result/save/share can be validated locally.

---

## In-App Purchases (StoreKit / Play Billing)

This app uses `react-native-iap` for StoreKit and Google Play Billing. It does **not** work in Expo Go; use an EAS dev client or a prebuilt binary.

### Configuration

- Products must exist in App Store Connect / Play Console.
- `app.json` already includes:
  - Android billing permission (`com.android.vending.BILLING`)
  - `react-native-iap` config plugin
  - `expo-build-properties` with Kotlin 2.2.0

### Usage

Payment utilities live in `src/services/payments/`.

```tsx
import { usePayments } from '../services/payments';

const paymentConfig = {
  productIds: ['quicknutrition_unlock'],
  subscriptionIds: ['womenshealth_pro_monthly', 'womenshealth_pro_yearly'],
  consumableProductIds: [],
  iosSharedSecret: process.env.EXPO_PUBLIC_IOS_SHARED_SECRET,
  enableSandbox: __DEV__,
};

const {
  products,
  subscriptions,
  purchaseOneTime,
  purchaseSubscription,
  restorePurchases,
  getTrialInfo,
} = usePayments(paymentConfig);
```

For a full example component, see `src/services/payments/PaymentExample.tsx`.

### Receipt validation (basic)

`paymentService.validateReceiptBasic` performs lightweight checks and can call Apple receipt validation when an iOS shared secret is provided. Production apps should validate receipts server-side before unlocking content.

### Trial support

Use `getTrialInfo(subscription)` to read free-trial details. For Android, pass `trialInfo.offerToken` into `purchaseSubscription(...)` so Play Billing can apply the offer.

## Notifications

The skeleton includes `expo-notifications` for **local notifications** (reminders, alerts, test notifications). No server or cloud functions required.

### What's included

- `src/services/notificationService.ts` — permission management, local notification scheduling, badge management
- `src/hooks/useNotifications.ts` — React hook wrapping the service
- `NotificationsSettingsScreen` — UI for toggling notification preferences and sending test notifications

### Local notifications (works out of the box)

```typescript
import { notificationService } from './services/notificationService';

// Send a local notification immediately
await notificationService.sendEventNotification('Title', 'Body');

// Send a test notification
await notificationService.sendTestNotification();
```

### Push notifications (optional, add your own service)

The skeleton can register for Expo push tokens via `notificationService.registerForPushNotifications()`. To send server-side push notifications, you'll need to add your own push service that calls the [Expo Push API](https://docs.expo.dev/push-notifications/overview/). This can be done from your NestJS backend or any server.

### Resources

- [Expo Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)

## Appium smoke script (Coins purchase)

For simulator runtime checks of the Coins purchase screen:

```bash
python3 scripts/appium/coins_purchase_smoke.py
```

For deterministic DreamShot generation → result action checks:

```bash
python3 scripts/appium/dreamshot_result_actions_smoke.py
```

Notes:
- Start Appium first (`appium --port 4723 --relaxed-security`).
- Script attempts route deep links (`mobile-app:///(main)/coins-purchase`, fallback variants) if not already on the screen.
- If the app is stuck in a blank native shell, it also tries Expo dev URLs (`exp://127.0.0.1:8081` + `:8083`) before retrying deep links.
- `dreamshot_result_actions_smoke.py` drives deterministic in-app navigation (home → style detail → photo picker → generation progress → result) and asserts `generation-back`, `generate-video-pro`, `save-result`, `share-result`, `try-another-style`.
- Artifacts are saved to `/tmp/coins-smoke` (coins) and `/tmp/dreamshot-result-smoke` (dreamshot) by default.
