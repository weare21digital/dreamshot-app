/**
 * Centralized Theme Configuration
 *
 * HOW TO REBRAND YOUR APP:
 * ========================
 * Edit the values below to change the entire app's look and feel.
 * This single file controls all colors, shapes, and typography
 * for both light and dark modes.
 *
 * Similar to APP_FEATURES for feature flags — one file, whole app changes.
 */

/**
 * Brand colors — your app's identity.
 * These are used as primary accents throughout the UI.
 */
const brand = {
  /** Main brand color (buttons, headers, active states) */
  primary: '#CC97FF',
  /** Dim primary accent for gradients and surfaces */
  primaryDim: '#9C48EA',
  /** Secondary brand color */
  secondary: '#53DDFC',
  /** Dim secondary accent for chips and supporting actions */
  secondaryDim: '#40CEED',
  /** Accent color for highlights and CTAs */
  accent: '#FF86C3',
} as const;

/**
 * Semantic status colors — consistent across light and dark modes.
 */
const status = {
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  /** Neutral grey for unknown/default states */
  neutral: '#6B7280',
} as const;

/**
 * Lumina Synth palette.
 */
const light = {
  background: '#060E20',
  surface: '#091328',
  surfaceVariant: '#0F1930',
  surfaceContainerHigh: '#141F38',
  text: '#DEE5FF',
  textSecondary: '#A3AAC4',
  onPrimary: '#060E20',
  onSecondary: '#060E20',
  onSurfaceVariant: '#A3AAC4',
  primaryContainer: '#9C48EA',
  onPrimaryContainer: '#DEE5FF',
  secondaryContainer: '#0C2842',
  border: '#0F1930',
  borderVariant: '#141F38',
  inputBackground: '#0F1930',
  cardBackground: '#091328',
  gradient: ['#9C48EA', '#53DDFC'] as [string, string],
  /** Container colors for status feedback */
  errorContainer: '#3D1F2A',
  successContainer: '#163331',
  infoContainer: '#102A3A',
  warningContainer: '#33290F',
  /** Text colors for use on container backgrounds */
  onErrorContainer: '#FFC9DD',
  onSuccessContainer: '#A2F4E9',
  onSuccessContainerAlt: '#7AF1E0',
  onInfoContainer: '#9CEBFF',
  onWarningContainer: '#FFE29A',
} as const;

/**
 * Dark mode palette.
 */
const dark = {
  background: '#060E20',
  surface: '#091328',
  surfaceVariant: '#0F1930',
  surfaceContainerHigh: '#141F38',
  text: '#DEE5FF',
  textSecondary: '#A3AAC4',
  onPrimary: '#060E20',
  onSecondary: '#060E20',
  onSurfaceVariant: '#A3AAC4',
  primaryContainer: '#9C48EA',
  onPrimaryContainer: '#DEE5FF',
  secondaryContainer: '#0C2842',
  border: '#0F1930',
  borderVariant: '#141F38',
  inputBackground: 'rgba(83, 221, 252, 0.08)',
  cardBackground: 'rgba(156, 72, 234, 0.12)',
  gradient: ['#9C48EA', '#53DDFC'] as [string, string],
  errorContainer: '#3D1F2A',
  successContainer: '#163331',
  infoContainer: '#102A3A',
  warningContainer: '#33290F',
  /** Text colors for use on container backgrounds (dark mode) */
  onErrorContainer: '#FFC9DD',
  onSuccessContainer: '#A2F4E9',
  onSuccessContainerAlt: '#7AF1E0',
  onInfoContainer: '#9CEBFF',
  onWarningContainer: '#FFE29A',
} as const;

/**
 * Shape tokens.
 */
const shape = {
  borderRadius: 14,
  borderRadiusSmall: 10,
  borderRadiusLarge: 18,
} as const;

/**
 * Typography tokens.
 * Set fontFamily to a custom font name, or leave undefined for system default.
 */
const typography = {
  fontFamily: undefined as string | undefined,
} as const;

/**
 * The complete app theme configuration.
 * Import this anywhere you need theme values.
 */
export const APP_THEME = {
  brand,
  status,
  light,
  dark,
  shape,
  typography,
} as const;

/** Type for mode-specific palette (light or dark) */
export type ThemePalette = typeof light | typeof dark;

/** Helper to get palette for a given mode */
export function getPalette(mode: 'light' | 'dark'): typeof light | typeof dark {
  return mode === 'dark' ? APP_THEME.dark : APP_THEME.light;
}
