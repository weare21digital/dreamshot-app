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
  primary: '#1A1A4E',
  /** Secondary brand color */
  secondary: '#2A2A63',
  /** Accent color for highlights and CTAs */
  accent: '#C9A84C',
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
 * Light mode palette.
 */
const light = {
  background: '#F6F0E5',
  surface: '#FFF9EF',
  surfaceVariant: '#F1E6D3',
  text: '#1A1A4E',
  textSecondary: '#55557A',
  onPrimary: '#FDF8EE',
  onSecondary: '#FFFFFF',
  onSurfaceVariant: '#403E5A',
  primaryContainer: '#D9D7FF',
  onPrimaryContainer: '#12123A',
  secondaryContainer: '#EFE6D1',
  border: '#D9CCB5',
  borderVariant: '#E4D8C4',
  inputBackground: '#FBF4E8',
  cardBackground: '#FFFDF8',
  gradient: ['#F6F0E5', '#EEE2CC'] as [string, string],
  /** Container colors for status feedback */
  errorContainer: '#FEE2E2',
  successContainer: '#DCFCE7',
  infoContainer: '#DBEAFE',
  warningContainer: '#FEF3C7',
  /** Text colors for use on container backgrounds */
  onErrorContainer: '#991B1B',
  onSuccessContainer: '#166534',
  onSuccessContainerAlt: '#15803D',
  onInfoContainer: '#1E40AF',
  onWarningContainer: '#92400E',
} as const;

/**
 * Dark mode palette.
 */
const dark = {
  background: '#121316',
  surface: '#1A1C20',
  surfaceVariant: '#242832',
  text: '#F9F2E8',
  textSecondary: 'rgba(249, 242, 232, 0.72)',
  onPrimary: '#F7F0E6',
  onSecondary: '#F7F0E6',
  onSurfaceVariant: '#DCCDB8',
  primaryContainer: '#232355',
  onPrimaryContainer: '#D7D1FF',
  secondaryContainer: '#474139',
  border: '#5C5345',
  borderVariant: '#4D463B',
  inputBackground: 'rgba(201, 168, 76, 0.10)',
  cardBackground: 'rgba(201, 168, 76, 0.08)',
  gradient: ['#1D1D1F', '#171718'] as [string, string],
  errorContainer: '#7F1D1D',
  successContainer: '#14532D',
  infoContainer: '#1E3A5F',
  warningContainer: '#78350F',
  /** Text colors for use on container backgrounds (dark mode) */
  onErrorContainer: '#FECACA',
  onSuccessContainer: '#BBF7D0',
  onSuccessContainerAlt: '#86EFAC',
  onInfoContainer: '#93C5FD',
  onWarningContainer: '#FDE68A',
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
