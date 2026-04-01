import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SupportedLanguage, TranslationParams, LanguageInfo } from '../types/settings';
import { i18nService } from '../services/i18nService';

/**
 * Language context value interface
 */
export interface LanguageContextValue {
  /** Current language code ('en' or 'bg') */
  currentLanguage: SupportedLanguage;
  /** Whether the language was manually set (not auto-detected) */
  isManuallySet: boolean;
  /** Whether the context is loading/initializing */
  isLoading: boolean;
  /** Error message if initialization failed */
  error: string | null;
  /** Whether the user is detected to be in Bulgaria */
  isInBulgaria: boolean | null;

  /** Translate a key path to the current language */
  t: (keyPath: string, params?: TranslationParams) => string;
  /** Manually set the language */
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  /** Reset to automatic language detection */
  resetToAuto: () => Promise<void>;
  /** Re-detect language from current location */
  detectFromLocation: () => Promise<void>;
  /** Get list of supported languages */
  getSupportedLanguages: () => LanguageInfo[];
  /** Get display name of a language in the current language */
  getLanguageDisplayName: (langCode: SupportedLanguage) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

/**
 * LanguageProvider component that wraps the app with language context.
 * Initializes i18n service on mount and handles language detection via IP geolocation.
 */
export function LanguageProvider({ children }: LanguageProviderProps): React.JSX.Element {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isManuallySet, setIsManuallySet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInBulgaria] = useState<boolean | null>(null);

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        await i18nService.initialize();

        setCurrentLanguage(i18nService.getLanguage());
        setIsManuallySet(i18nService.isManuallySet());
      } catch (err) {
        console.error('Failed to initialize language context:', err);
        setError('Failed to initialize language settings');
        setCurrentLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const t = useCallback((keyPath: string, params?: TranslationParams): string => {
    return i18nService.t(keyPath, params);
  }, [currentLanguage]);

  const setLanguage = useCallback(async (language: SupportedLanguage): Promise<void> => {
    try {
      await i18nService.setLanguage(language);
      setCurrentLanguage(language);
      setIsManuallySet(true);
    } catch (err) {
      console.error('Failed to set language:', err);
      throw new Error('Failed to save language preference');
    }
  }, []);

  const resetToAuto = useCallback(async (): Promise<void> => {
    try {
      await i18nService.resetToAuto();
      setCurrentLanguage(i18nService.getLanguage());
      setIsManuallySet(false);
    } catch (err) {
      console.error('Failed to reset to auto:', err);
      throw new Error('Failed to reset language settings');
    }
  }, []);

  const detectFromLocation = useCallback(async (): Promise<void> => {
    try {
      await i18nService.redetectFromLocation();
      setCurrentLanguage(i18nService.getLanguage());
    } catch (err) {
      console.error('Failed to detect from location:', err);
      throw new Error('Failed to detect language from location');
    }
  }, []);

  const getSupportedLanguages = useCallback((): LanguageInfo[] => {
    return i18nService.getSupportedLanguages();
  }, []);

  const getLanguageDisplayName = useCallback((langCode: SupportedLanguage): string => {
    return i18nService.getLanguageDisplayName(langCode);
  }, [currentLanguage]);

  const contextValue = useMemo((): LanguageContextValue => ({
    currentLanguage,
    isManuallySet,
    isLoading,
    error,
    isInBulgaria,
    t,
    setLanguage,
    resetToAuto,
    detectFromLocation,
    getSupportedLanguages,
    getLanguageDisplayName,
  }), [
    currentLanguage,
    isManuallySet,
    isLoading,
    error,
    isInBulgaria,
    t,
    setLanguage,
    resetToAuto,
    detectFromLocation,
    getSupportedLanguages,
    getLanguageDisplayName,
  ]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the language context.
 * Must be used within a LanguageProvider.
 */
export function useAppLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useAppLanguage must be used within a LanguageProvider');
  }

  return context;
}
