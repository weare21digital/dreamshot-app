# Theming Configuration

## Overview

The app uses a centralized theme configuration at `src/config/theme.ts`. Edit this **single file** to rebrand the entire app — colors, shapes, and typography for both light and dark modes. No need to hunt through screens or components.

The theming system is built on [React Native Paper](https://callstack.github.io/react-native-paper/) (Material Design 3). `APP_THEME` feeds into Paper's theme and is also available directly via the `useAppTheme()` hook.

## Rebranding Checklist

When forking the skeleton for a new app, follow these steps:

### 1. Set Your Brand Colors

Open `src/config/theme.ts` and update the brand object:

```ts
const brand = {
  primary: '#FF6B6B',   // Your main brand color (buttons, headers, active states)
  secondary: '#4ECDC4', // Secondary color (supporting elements)
  accent: '#FFE66D',    // Accent/CTA color (highlights, call-to-action)
};
```

This alone changes every button, header, tab indicator, and active state in the app.

### 2. Adjust Status Colors (Optional)

If your brand clashes with the default status colors, update them:

```ts
const status = {
  success: '#4CAF50',  // Green — confirmations, completed states
  error: '#F44336',    // Red — errors, destructive actions
  warning: '#FF9800',  // Orange — warnings, caution
  info: '#2196F3',     // Blue — informational messages
  neutral: '#9E9E9E',  // Grey — unknown/default states
};
```

### 3. Customize Light & Dark Palettes

Each mode has a full palette. The most important tokens to update:

```ts
const light = {
  background: '#FFFBFE',       // Main screen background
  surface: '#FFFFFF',          // Cards, modals, sheets
  text: '#1C1B1F',            // Primary text
  textSecondary: 'rgba(0,0,0,0.6)', // Captions, labels
  // ... container colors for feedback banners
  errorContainer: '#ffebee',   // Background for error messages
  successContainer: '#e8f5e8', // Background for success messages
};

const dark = {
  background: '#1C1B1F',
  surface: '#1C1B1F',
  text: '#E6E1E5',
  textSecondary: 'rgba(255,255,255,0.7)',
  // ...
};
```

**Tip:** Use a tool like [Material Theme Builder](https://m3.material.io/theme-builder) to generate cohesive light/dark palettes from your primary color.

### 4. Set Shape & Typography (Optional)

```ts
const shape = {
  borderRadius: 12,       // Default corner radius
  borderRadiusSmall: 8,   // Chips, tags
  borderRadiusLarge: 16,  // Cards, modals
};

const typography = {
  fontFamily: undefined,  // System default, or 'Inter', 'Poppins', etc.
};
```

### 5. Verify Both Modes

After changing colors:
1. Open the app
2. Go to Settings → Theme → toggle Light/Dark
3. Check all screens look correct in both modes
4. Pay special attention to text contrast on colored containers

## Theme Structure Reference

### `APP_THEME` object

| Key | Description |
|-----|-------------|
| `brand` | Primary, secondary, accent — your app's identity |
| `status` | Success, error, warning, info, neutral — semantic feedback |
| `light` | Full color palette for light mode |
| `dark` | Full color palette for dark mode |
| `shape` | Border radius tokens |
| `typography` | Font family |

### Palette Tokens (light & dark)

| Token | Purpose |
|-------|---------|
| `background` | Screen background |
| `surface` | Card/modal background |
| `surfaceVariant` | Subtle surface variation |
| `text` | Primary text |
| `textSecondary` | Captions, labels, secondary text |
| `onPrimary` | Text on primary-colored backgrounds |
| `border` / `borderVariant` | Dividers, outlines |
| `inputBackground` | Text input backgrounds |
| `cardBackground` | Card/list item backgrounds |
| `gradient` | `[startColor, endColor]` for gradient backgrounds |
| `errorContainer` | Error banner/alert background |
| `successContainer` | Success banner background |
| `infoContainer` | Info banner background |
| `warningContainer` | Warning banner background |
| `onErrorContainer` | Text on error containers |
| `onSuccessContainer` | Text on success containers |
| `onInfoContainer` | Text on info containers |
| `onWarningContainer` | Text on warning containers |
| `primaryContainer` | Primary-tinted container background |
| `onPrimaryContainer` | Text on primary containers |
| `secondaryContainer` | Secondary-tinted container background |

## Using the Theme in Components

### useAppTheme() Hook (Recommended)

```tsx
import { useAppTheme } from '../contexts/ThemeContext';

function MyScreen() {
  const { palette, brand, status, themeMode } = useAppTheme();

  return (
    <View style={{ backgroundColor: palette.background }}>
      <Text style={{ color: palette.text }}>Welcome</Text>
      <Button color={brand.primary}>Get Started</Button>
      {hasError && (
        <View style={{ backgroundColor: palette.errorContainer }}>
          <Text style={{ color: palette.onErrorContainer }}>
            Something went wrong
          </Text>
        </View>
      )}
    </View>
  );
}
```

Returns:
- `palette` — Resolved light or dark palette based on current mode
- `brand` — Brand colors (same in both modes)
- `status` — Status colors (same in both modes)
- `theme` — Full MD3 Paper theme object
- `themeMode` — Current mode (`'light'` or `'dark'`)

### React Native Paper Components

Paper components (Button, Card, TextInput, etc.) automatically pick up the theme — no extra work needed:

```tsx
<Button mode="contained">Uses brand.primary automatically</Button>
<Card>Uses palette.surface automatically</Card>
```

### Static Access (Non-Component Code)

For StyleSheet or utility code outside of React components, import directly:

```ts
import { APP_THEME } from '../config/theme';

// Use for mode-independent values only
const brandColor = APP_THEME.brand.primary;
const errorColor = APP_THEME.status.error;
```

**⚠️ Don't use `APP_THEME.light.*` or `APP_THEME.dark.*` directly in StyleSheet.create** — these won't switch with dark mode. Use `useAppTheme()` with inline styles instead.

## Light/Dark Mode

- Mode is persisted via MMKV storage
- Users toggle it in **Settings → Theme**
- The `palette` from `useAppTheme()` automatically resolves to the correct mode
- All screens use dynamic styles, so switching is instant

## Example: Full Rebrand

Here's what a food delivery app rebrand might look like:

```ts
const brand = {
  primary: '#FF5722',   // Deep orange
  secondary: '#795548', // Brown
  accent: '#FFC107',    // Amber
};

const light = {
  background: '#FFF8F5',     // Warm white
  surface: '#FFFFFF',
  text: '#3E2723',           // Dark brown
  textSecondary: '#8D6E63',  // Medium brown
  // ... keep other tokens or adjust to match
};
```

Change these ~10 values and the entire app transforms to match your brand.
