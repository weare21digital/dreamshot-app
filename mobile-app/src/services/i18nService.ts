import {
  SupportedLanguage,
  LanguagePreference,
  TranslationParams,
  TranslationSet,
  LanguageInfo,
} from '../types/settings';
import { settingsService } from './settingsService';

/**
 * English translations
 * Checklist: when adding new strings, update both English and Bulgarian sections.
 */
const englishTranslations: TranslationSet = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    retry: 'Retry',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
  },
  settings: {
    title: 'Settings',
    appPreferences: 'App Preferences',
    theme: 'Theme',
    themeDescription: 'Switch between light and dark mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    languageDescription: 'Change app language',
    notifications: 'Push Notifications',
    notificationsDescription: 'Receive notifications about app updates',
    autoSync: 'Auto Sync',
    autoSyncDescription: 'Automatically sync data when connected',
    accountSecurity: 'Account Security',
    changePassword: 'Change Password',
    changePasswordDescription: 'Update your account password',
    accountActions: 'Account Actions',
    logout: 'Logout',
    logoutDescription: 'Sign out of your account',
    deleteAccount: 'Delete Account',
    deleteAccountDescription: 'Permanently delete your account',
    saveFailed: 'Failed to save settings. Please try again.',
    saveSuccess: 'Settings saved successfully.',
  },
  languageSettings: {
    title: 'Language Settings',
    currentLanguage: 'Current Language',
    selectLanguage: 'Select Language',
    automatic: 'Automatic',
    automaticDescription: 'Based on your IP location',
    autoDetect: 'Automatic (Based on Location)',
    autoDetectDescription: 'Language will be set based on your IP location',
    manual: 'Manual Selection',
    english: 'English',
    bulgarian: 'Bulgarian',
    resetToAuto: 'Reset to Automatic',
    locationPermission: 'Location Permission',
    locationPermissionDescription: 'Allow location access for automatic language detection',
    grantPermission: 'Grant Permission',
    detectedLocation: 'Detected Location',
    inBulgaria: 'In Bulgaria',
    outsideBulgaria: 'Outside Bulgaria',
    unknown: 'Unknown',
  },
  auth: {
    login: 'Log In',
    register: 'Register',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    rememberMe: 'Remember Me',
    orContinueWith: 'Or continue with',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signUp: 'Sign Up',
    signIn: 'Sign In',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'You are not authorized to perform this action.',
    notFound: 'The requested resource was not found.',
    validation: 'Please check your input and try again.',
    sessionExpired: 'Your session has expired. Please log in again.',
    passwordMismatch: 'Passwords do not match.',
    invalidCredentials: 'Invalid email or password.',
    emailRequired: 'Email is required.',
    passwordRequired: 'Password is required.',
    passwordTooShort: 'Password must be at least 8 characters.',
  },
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    avatar: 'Profile Picture',
    changeAvatar: 'Change Picture',
    memberSince: 'Member Since',
  },
  dialogs: {
    deleteAccountTitle: 'Delete Account',
    deleteAccountMessage: 'Are you sure you want to permanently delete your account? This action cannot be undone.',
    deleteAccountConfirm: 'This will permanently delete your account and all associated data.',
    passwordChangedTitle: 'Password Changed',
    passwordChangedMessage: 'Your password has been changed successfully. You will need to log in again.',
    logoutTitle: 'Logout',
    logoutMessage: 'Are you sure you want to log out?',
  },
  securitySettings: {
    title: 'Security Settings',
    biometric: 'Biometric Authentication',
    biometricDescription: 'Use Face ID or fingerprint to unlock',
    biometricNotAvailable: 'Biometric authentication is not available on this device',
    biometricNotEnrolled: 'No biometric credentials enrolled. Please set up biometrics in your device settings.',
    autoLock: 'Auto-Lock',
    autoLockDescription: 'Automatically lock the app after inactivity',
    autoLockTimeout: 'Auto-Lock Timeout',
    lockNow: 'Lock Now',
    lockNowDescription: 'Manually lock the app immediately',
    timeout: {
      disabled: 'Disabled',
      '5min': '5 minutes',
      '15min': '15 minutes',
      '30min': '30 minutes',
      '1hr': '1 hour',
      '2hr': '2 hours',
    },
    biometricType: {
      fingerprint: 'Fingerprint',
      facial: 'Face ID',
      iris: 'Iris',
      none: 'None',
    },
    enableBiometricFirst: 'Please authenticate to enable biometric authentication',
    biometricEnabled: 'Biometric authentication enabled',
    biometricDisabled: 'Biometric authentication disabled',
  },
  notificationSettings: {
    title: 'Notification Settings',
    pushNotifications: 'Push Notifications',
    pushNotificationsDescription: 'Receive push notifications from the app',
    importantEvents: 'Important Events',
    importantEventsDescription: 'Get notified about important events',
    testNotification: 'Test Notification',
    testNotificationDescription: 'Send a test notification to verify settings',
    testNotificationSent: 'Test notification sent!',
    testNotificationFailed: 'Failed to send test notification',
    permissionDenied: 'Notification permission was denied. Please enable notifications in your device settings.',
    permissionRequired: 'Notification permission required',
  },
};

/**
 * Bulgarian translations
 */
const bulgarianTranslations: TranslationSet = {
  common: {
    loading: 'Зареждане...',
    error: 'Грешка',
    success: 'Успех',
    cancel: 'Отказ',
    save: 'Запази',
    confirm: 'Потвърди',
    delete: 'Изтрий',
    edit: 'Редактирай',
    close: 'Затвори',
    back: 'Назад',
    next: 'Напред',
    done: 'Готово',
    retry: 'Опитай отново',
    yes: 'Да',
    no: 'Не',
    ok: 'OK',
  },
  settings: {
    title: 'Настройки',
    appPreferences: 'Предпочитания',
    theme: 'Тема',
    themeDescription: 'Превключване между светла и тъмна тема',
    darkMode: 'Тъмна тема',
    lightMode: 'Светла тема',
    language: 'Език',
    languageDescription: 'Промяна на езика на приложението',
    notifications: 'Push известия',
    notificationsDescription: 'Получавайте известия за актуализации',
    autoSync: 'Автоматична синхронизация',
    autoSyncDescription: 'Автоматично синхронизиране при връзка',
    accountSecurity: 'Сигурност на акаунта',
    changePassword: 'Промяна на парола',
    changePasswordDescription: 'Обновете паролата на акаунта си',
    accountActions: 'Действия с акаунта',
    logout: 'Изход',
    logoutDescription: 'Излизане от акаунта',
    deleteAccount: 'Изтриване на акаунт',
    deleteAccountDescription: 'Окончателно изтриване на акаунта',
    saveFailed: 'Неуспешно запазване. Моля, опитайте отново.',
    saveSuccess: 'Настройките са запазени успешно.',
  },
  languageSettings: {
    title: 'Езикови настройки',
    currentLanguage: 'Текущ език',
    selectLanguage: 'Изберете език',
    automatic: 'Автоматично',
    automaticDescription: 'Базирано на вашия IP адрес',
    autoDetect: 'Автоматично (по местоположение)',
    autoDetectDescription: 'Езикът ще бъде зададен според вашия IP адрес',
    manual: 'Ръчен избор',
    english: 'Английски',
    bulgarian: 'Български',
    resetToAuto: 'Възстанови автоматичен режим',
    locationPermission: 'Разрешение за местоположение',
    locationPermissionDescription: 'Разрешете достъп до местоположение за автоматично откриване на езика',
    grantPermission: 'Дай разрешение',
    detectedLocation: 'Открито местоположение',
    inBulgaria: 'В България',
    outsideBulgaria: 'Извън България',
    unknown: 'Неизвестно',
  },
  auth: {
    login: 'Вход',
    register: 'Регистрация',
    forgotPassword: 'Забравена парола?',
    resetPassword: 'Нулиране на парола',
    email: 'Имейл',
    password: 'Парола',
    confirmPassword: 'Потвърдете паролата',
    currentPassword: 'Текуща парола',
    newPassword: 'Нова парола',
    rememberMe: 'Запомни ме',
    orContinueWith: 'Или продължете с',
    dontHaveAccount: 'Нямате акаунт?',
    alreadyHaveAccount: 'Вече имате акаунт?',
    signUp: 'Регистрация',
    signIn: 'Вход',
  },
  errors: {
    generic: 'Нещо се обърка. Моля, опитайте отново.',
    network: 'Мрежова грешка. Моля, проверете връзката си.',
    unauthorized: 'Нямате право да извършите това действие.',
    notFound: 'Търсеният ресурс не е намерен.',
    validation: 'Моля, проверете въведените данни и опитайте отново.',
    sessionExpired: 'Сесията ви изтече. Моля, влезте отново.',
    passwordMismatch: 'Паролите не съвпадат.',
    invalidCredentials: 'Невалиден имейл или парола.',
    emailRequired: 'Имейлът е задължителен.',
    passwordRequired: 'Паролата е задължителна.',
    passwordTooShort: 'Паролата трябва да бъде поне 8 символа.',
  },
  profile: {
    title: 'Профил',
    editProfile: 'Редактиране на профил',
    firstName: 'Име',
    lastName: 'Фамилия',
    email: 'Имейл',
    phone: 'Телефон',
    avatar: 'Профилна снимка',
    changeAvatar: 'Промяна на снимка',
    memberSince: 'Член от',
  },
  dialogs: {
    deleteAccountTitle: 'Изтриване на акаунт',
    deleteAccountMessage: 'Сигурни ли сте, че искате да изтриете акаунта си завинаги? Това действие не може да бъде отменено.',
    deleteAccountConfirm: 'Това ще изтрие окончателно вашия акаунт и всички свързани данни.',
    passwordChangedTitle: 'Паролата е променена',
    passwordChangedMessage: 'Паролата ви беше променена успешно. Ще трябва да влезете отново.',
    logoutTitle: 'Изход',
    logoutMessage: 'Сигурни ли сте, че искате да излезете?',
  },
  securitySettings: {
    title: 'Настройки за сигурност',
    biometric: 'Биометрично удостоверяване',
    biometricDescription: 'Използвайте Face ID или пръстов отпечатък за отключване',
    biometricNotAvailable: 'Биометричното удостоверяване не е налично на това устройство',
    biometricNotEnrolled: 'Няма регистрирани биометрични данни. Моля, настройте биометрията в настройките на устройството.',
    autoLock: 'Автоматично заключване',
    autoLockDescription: 'Автоматично заключване на приложението след неактивност',
    autoLockTimeout: 'Време за автоматично заключване',
    lockNow: 'Заключи сега',
    lockNowDescription: 'Ръчно заключване на приложението веднага',
    timeout: {
      disabled: 'Изключено',
      '5min': '5 минути',
      '15min': '15 минути',
      '30min': '30 минути',
      '1hr': '1 час',
      '2hr': '2 часа',
    },
    biometricType: {
      fingerprint: 'Пръстов отпечатък',
      facial: 'Face ID',
      iris: 'Ирис',
      none: 'Няма',
    },
    enableBiometricFirst: 'Моля, удостоверете се, за да активирате биометричното удостоверяване',
    biometricEnabled: 'Биометричното удостоверяване е активирано',
    biometricDisabled: 'Биометричното удостоверяване е деактивирано',
  },
  notificationSettings: {
    title: 'Настройки за известия',
    pushNotifications: 'Push известия',
    pushNotificationsDescription: 'Получавайте push известия от приложението',
    importantEvents: 'Важни събития',
    importantEventsDescription: 'Получавайте известия за важни събития',
    testNotification: 'Тестово известие',
    testNotificationDescription: 'Изпратете тестово известие, за да проверите настройките',
    testNotificationSent: 'Тестовото известие е изпратено!',
    testNotificationFailed: 'Неуспешно изпращане на тестово известие',
    permissionDenied: 'Разрешението за известия беше отказано. Моля, активирайте известията в настройките на устройството.',
    permissionRequired: 'Изисква се разрешение за известия',
  },
};

/**
 * All translations indexed by language code
 */
const translations: Record<SupportedLanguage, TranslationSet> = {
  en: englishTranslations,
  bg: bulgarianTranslations,
};

/**
 * Supported languages with display info
 */
const supportedLanguages: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
];

/**
 * Service for managing translations and language detection.
 * Implements singleton pattern for consistency across the app.
 */
class I18nService {
  private static instance: I18nService;
  private currentLanguage: SupportedLanguage = 'en';
  private languagePreference: LanguagePreference = 'auto';
  private initialized: boolean = false;

  private constructor() {}

  /**
   * Get the singleton instance of I18nService
   */
  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  /**
   * Initialize the i18n service.
   * Loads saved language preference and performs location-based detection if needed.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const settings = await settingsService.getUserSettings();
      this.languagePreference = settings.language;

      if (this.languagePreference === 'auto') {
        await this.detectLanguageFromLocation();
      } else {
        this.currentLanguage = this.languagePreference;
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize i18n:', error);
      // Default to English on error
      this.currentLanguage = 'en';
      this.initialized = true;
    }
  }

  /**
   * Detect language based on location.
   * Sets Bulgarian if in Bulgaria, English otherwise.
   * Fails gracefully - defaults to English on any error.
   */
  private async detectLanguageFromLocation(): Promise<void> {
    // Geolocation disabled — default to English, user can change in settings
    this.currentLanguage = 'en';
  }

  /**
   * Get the current language.
   */
  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Check if language was manually set (not auto-detected).
   */
  public isManuallySet(): boolean {
    return this.languagePreference !== 'auto';
  }

  /**
   * Get the current language preference.
   */
  public getLanguagePreference(): LanguagePreference {
    return this.languagePreference;
  }

  /**
   * Manually set the language.
   * Persists the choice to settings.
   */
  public async setLanguage(language: SupportedLanguage): Promise<void> {
    this.currentLanguage = language;
    this.languagePreference = language;
    
    await settingsService.updateUserSettings({ language });
  }

  /**
   * Reset to automatic language detection.
   * Clears manual override and re-detects from location.
   */
  public async resetToAuto(): Promise<void> {
    this.languagePreference = 'auto';
    await settingsService.updateUserSettings({ language: 'auto' });
    await this.detectLanguageFromLocation();
  }

  /**
   * Translate a key path to the current language.
   * Supports nested keys (e.g., 'settings.theme') and parameter interpolation.
   * 
   * @param keyPath - Dot-separated key path (e.g., 'settings.theme')
   * @param params - Optional parameters for interpolation (e.g., { name: 'John' })
   * @returns The translated string, or the key path if not found
   */
  public t(keyPath: string, params?: TranslationParams): string {
    let value = this.getNestedValue(translations[this.currentLanguage], keyPath);
    
    // Fallback to English if not found in current language
    if (value === undefined) {
      console.warn(`Translation not found: ${keyPath} for language ${this.currentLanguage}`);
      value = this.getNestedValue(translations.en, keyPath);
    }
    
    // Return key path if not found in English either
    if (value === undefined) {
      console.warn(`Translation not found in English: ${keyPath}`);
      return keyPath;
    }
    
    // Ensure we have a string
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${keyPath}`);
      return keyPath;
    }
    
    // Interpolate parameters
    if (params) {
      return this.interpolate(value, params);
    }
    
    return value;
  }

  /**
   * Get a nested value from a translation set using dot notation.
   */
  private getNestedValue(obj: TranslationSet, keyPath: string): string | undefined {
    const keys = keyPath.split('.');
    let current: TranslationSet | string | undefined = obj;
    
    for (const key of keys) {
      if (current === undefined || typeof current === 'string') {
        return undefined;
      }
      current = current[key] as TranslationSet | string | undefined;
    }
    
    return typeof current === 'string' ? current : undefined;
  }

  /**
   * Interpolate parameters into a translation string.
   * Replaces {{paramName}} with the corresponding value.
   */
  private interpolate(text: string, params: TranslationParams): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get the list of supported languages with display info.
   */
  public getSupportedLanguages(): LanguageInfo[] {
    return [...supportedLanguages];
  }

  /**
   * Get the display name of a language in the current language.
   */
  public getLanguageDisplayName(langCode: SupportedLanguage): string {
    const langInfo = supportedLanguages.find(l => l.code === langCode);
    if (!langInfo) {
      return langCode;
    }
    
    // Return native name when viewing that language
    if (this.currentLanguage === langCode) {
      return langInfo.nativeName;
    }
    
    // Otherwise return translated name
    return this.t(`languageSettings.${langCode === 'en' ? 'english' : 'bulgarian'}`);
  }

  /**
   * Re-detect language from location (for use after granting location permission)
   */
  public async redetectFromLocation(): Promise<void> {
    if (this.languagePreference === 'auto') {
      await this.detectLanguageFromLocation();
    }
  }
}

// Export singleton instance
export const i18nService = I18nService.getInstance();
