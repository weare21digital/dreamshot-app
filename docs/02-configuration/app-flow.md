# App Flow & Navigation Patterns

> ⚠️ **Requires development builds** — `npx expo run:ios` / `npx expo run:android`, not Expo Go.

When forking the skeleton, one of the first decisions is **when to show authentication**. The skeleton supports multiple patterns out of the box.

## Flow Patterns

### 1. Onboarding → Auth → Main App (Default)

Best for **consumer apps** where you want to show the value proposition before asking users to sign up.

```
[Onboarding Slides] → [Welcome/Auth Screen] → [Main App Tabs]
```

This is the default flow. The `app/index.tsx` checks:
1. Has onboarding been completed? → If not, show onboarding
2. Is user authenticated? → If not, show auth screen
3. Otherwise → show main app

**When to use:** Most consumer apps. Users see what the app does before committing.

### 2. Auth First → Main App

Best for **utility/B2B apps** where the app requires an account to function.

```
[Welcome/Auth Screen] → [Main App Tabs]
```

To implement: modify `app/index.tsx` to skip the onboarding check:

```ts
useEffect(() => {
  if (!isLoading) {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/auth/welcome');
    }
  }
}, [isAuthenticated, isLoading]);
```

**When to use:** Apps that need user data from the start (e.g., dashboards, team tools).

### 3. Onboarding → Main App → Auth Later (Best for Engagement)

Best for **apps where you want maximum engagement**. Let users explore freely, prompt for auth only when they need to save data or access premium features.

```
[Onboarding Slides] → [Main App Tabs] → [Auth prompt when needed]
```

To implement: modify `app/index.tsx` to go straight to the main app after onboarding:

```ts
useEffect(() => {
  if (onboardingChecked) {
    if (!hasOnboarded) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  }
}, [onboardingChecked, hasOnboarded]);
```

Then trigger auth from specific screens when needed:

```ts
const { isAuthenticated } = useAuth();

const handlePremiumFeature = () => {
  if (!isAuthenticated) {
    router.push('/auth/welcome');
    return;
  }
  // proceed with feature
};
```

**When to use:** Content apps, wellness apps, anything where early exploration increases conversion.

## Customizing the Flow

### Entry Point: `app/index.tsx`

This file controls the entire routing decision. It runs on app launch and decides where to send the user. Modify the `useEffect` to match your desired pattern.

### Onboarding: `src/features/onboarding/`

- **Slides:** Edit the `slides` array in `OnboardingScreen.tsx`
- **Completion tracking:** Uses AsyncStorage with a key like `@appname_onboarding_complete`
- **Best practices:**
  - Keep it to 3-4 slides max
  - Use emojis or illustrations (not text walls)
  - Always include a Skip button
  - Lead with the value proposition, end with privacy/trust

### Auth Screen: `src/features/auth/screens/WelcomeScreen.tsx`

**Always customize this when forking.** The skeleton ships with a generic placeholder. Your app should have:

- **App name and icon/emoji** — not "Welcome to App"
- **Brand colors** — match your app's theme
- **Tagline** — one line that explains what the app does
- **Appropriate buttons** — "Get Started" feels different than "Login"
- **Social auth buttons** — Google + Apple Sign-In below a divider

Example (SandwichSupport):
```tsx
<View style={styles.emojiCircle}>
  <Text style={styles.emoji}>🥪</Text>
</View>
<Text style={styles.title}>SandwichSupport</Text>
<Text style={styles.subtitle}>Care for everyone, including yourself</Text>
```

### Navigation Structure

```
app/
├── index.tsx              # Entry point — routing decision
├── onboarding.tsx         # Onboarding screen
├── auth/                  # Auth screens (welcome, login, register)
│   ├── welcome.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                # Main app with tab navigation
│   ├── _layout.tsx
│   ├── index.tsx          # Home tab
│   └── ...
└── (main)/                # Other main screens
```

## Branding All Screens

When forking the skeleton, **every user-facing screen must be rebranded** to match your app's identity. The skeleton ships with generic placeholder UI — this is intentional so you can see the structure, but **none of it should ship as-is**.

### Screens to customize:

| Screen | Location | What to change |
|--------|----------|----------------|
| Welcome/Auth | `src/features/auth/screens/WelcomeScreen.tsx` | App name, icon, tagline, colors, button text |
| Login | `src/features/auth/screens/LoginScreen.tsx` | Header, colors, branding |
| Register | `src/features/auth/screens/RegisterScreen.tsx` | Header, colors, branding |
| Settings | `src/features/profile/screens/SettingsScreen.tsx` | Section titles, theme colors, app-specific options |
| Profile | `src/features/profile/screens/ProfileScreen.tsx` | Layout, colors, fields |
| Premium/Paywall | `src/features/payments/screens/PremiumScreen.tsx` | Plan descriptions, pricing copy, brand colors |
| Home | `src/features/home/screens/HomeScreen.tsx` | Completely replace with your app's main content |

### Design consistency rule

**The skeleton provides the tech stack and architecture. Your app provides the design.** Every screen should feel like it belongs to your app — consistent colors, typography, tone, and spacing. If you have onboarding screens with a specific style (colors, emoji, rounded buttons), the auth screens, settings, and premium screens should match that same style.

Common mistakes when forking:
- ❌ Shipping with "Welcome to App" and the LOGO placeholder
- ❌ Having branded onboarding but generic skeleton settings pages
- ❌ Mixing the skeleton's default theme colors with your brand colors
- ❌ Leaving "Powered by White-Label Framework" in the footer

### Recommended approach

1. Define your brand constants first (`colors`, `spacing`, `typography`) in a shared config
2. Update the theme in `src/contexts/ThemeContext.tsx` with your brand colors
3. Go through every screen in `src/features/` and customize the UI
4. Test the full flow to ensure visual consistency from onboarding through main app

## Key Principle

**Don't make users work before they see value.** The best apps let people explore first, then convert them to signed-up users when they're already invested. The skeleton supports all patterns — pick the one that fits your app's nature.
