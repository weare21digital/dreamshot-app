/**
 * Central App Configuration
 *
 * Controls high-level app behavior modes.
 * Change these values to configure how the app works.
 */

export const APP_CONFIG = {
  /**
   * Authentication mode:
   * - 'device': Auth is local-only (Google/Apple sign-in stores user info locally, no backend needed)
   * - 'backend': Auth goes through your API (email login, JWT tokens, refresh flow)
   */
  authMode: 'backend' as 'device' | 'backend',
} as const;
