// Settings types for theme, language, and notification management

/**
 * Theme mode for the application
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Supported languages in the application
 */
export type SupportedLanguage = 'en' | 'bg';

/**
 * Language preference - can be a specific language or 'auto' for location-based detection
 */
export type LanguagePreference = SupportedLanguage | 'auto';

/**
 * Valid auto-lock timeout values in seconds
 * 0 = disabled, 300 = 5min, 900 = 15min, 1800 = 30min, 3600 = 1hr, 7200 = 2hr
 */
export type AutoLockTimeout = 0 | 300 | 900 | 1800 | 3600 | 7200;

/**
 * User settings stored in AsyncStorage
 */
export interface UserSettings {
  /** Current theme mode */
  theme: ThemeMode;
  /** Language preference - 'auto' for location-based, or specific language code */
  language: LanguagePreference;
  /** Whether push notifications are enabled */
  notificationsEnabled: boolean;
  /** Auto-lock timeout in seconds (0 = disabled) */
  autoLockTimeout: AutoLockTimeout;
  /** Whether biometric authentication is enabled */
  biometricEnabled: boolean;
  /** Whether to notify for important events */
  notifyImportantEvents: boolean;
}

/**

/**
 * Result of a location permission request
 */
export interface LocationPermissionResult {
  /** Whether permission was granted */
  granted: boolean;
  /** Whether the user can be asked again */
  canAskAgain: boolean;
}

/**
 * Parameters for translation string interpolation
 */
export interface TranslationParams {
  [key: string]: string | number;
}

/**
 * Nested translation value - can be a string or nested object
 */
export type TranslationValue = string | { [key: string]: TranslationValue };

/**
 * Translation set containing all translations for a language
 */
export interface TranslationSet {
  [key: string]: TranslationValue;
}

/**
 * Supported language info for display purposes
 */
export interface LanguageInfo {
  /** Language code */
  code: SupportedLanguage;
  /** Language name in English */
  name: string;
  /** Language name in its native script */
  nativeName: string;
}

/**
 * Default user settings
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'dark',
  language: 'auto',
  notificationsEnabled: true,
  autoLockTimeout: 900, // 15 minutes default
  biometricEnabled: false,
  notifyImportantEvents: true,
};
