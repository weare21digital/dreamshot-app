import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Appearance,
  ColorSchemeName,
} from 'react-native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
} from 'react-native-paper';
import { ThemeMode } from '../types/settings';
import { settingsService } from '../services/settingsService';
import { APP_THEME } from '../config/theme';

/**
 * Custom dark theme derived from APP_THEME config
 */
const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: APP_THEME.brand.primary,
    primaryContainer: APP_THEME.dark.primaryContainer,
    secondary: APP_THEME.brand.secondary,
    secondaryContainer: APP_THEME.dark.secondaryContainer,
    surface: APP_THEME.dark.surface,
    surfaceVariant: APP_THEME.dark.surfaceVariant,
    background: APP_THEME.dark.background,
    error: APP_THEME.status.error,
    onPrimary: APP_THEME.dark.onPrimary,
    onPrimaryContainer: APP_THEME.dark.onPrimaryContainer,
    onSecondary: APP_THEME.dark.onSecondary,
    onSurface: APP_THEME.dark.text,
    onSurfaceVariant: APP_THEME.dark.onSurfaceVariant,
    onBackground: APP_THEME.dark.text,
    outline: APP_THEME.dark.border,
    outlineVariant: APP_THEME.dark.borderVariant,
  },
};

/**
 * Custom light theme derived from APP_THEME config
 */
const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: APP_THEME.brand.primary,
    primaryContainer: APP_THEME.light.primaryContainer,
    secondary: APP_THEME.brand.secondary,
    secondaryContainer: APP_THEME.light.secondaryContainer,
    surface: APP_THEME.light.surface,
    surfaceVariant: APP_THEME.light.surfaceVariant,
    background: APP_THEME.light.background,
    error: APP_THEME.status.error,
    onPrimary: APP_THEME.light.onPrimary,
    onPrimaryContainer: APP_THEME.light.onPrimaryContainer,
    onSecondary: APP_THEME.light.onSecondary,
    onSurface: APP_THEME.light.text,
    onSurfaceVariant: APP_THEME.light.onSurfaceVariant,
    onBackground: APP_THEME.light.text,
    outline: APP_THEME.light.border,
    outlineVariant: APP_THEME.light.borderVariant,
  },
};

/**
 * Return type for the useTheme hook
 */
export interface UseThemeReturn {
  /** The current Material Design 3 theme object */
  theme: MD3Theme;
  /** The user's selected theme preference */
  themeMode: ThemeMode;
  /** The effective mode currently applied in the UI */
  resolvedThemeMode: 'light' | 'dark';
  /** Whether the theme is currently loading from storage */
  isLoading: boolean;
  /** Set the theme mode explicitly */
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  /** Toggle between light and dark mode */
  toggleTheme: () => Promise<void>;
}

function resolveThemeMode(themeMode: ThemeMode, systemScheme: ColorSchemeName): 'light' | 'dark' {
  if (themeMode === 'auto') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }

  return themeMode;
}

/**
 * Hook for managing theme state with persistence.
 * Loads theme from settings on mount and persists changes.
 */
export function useTheme(): UseThemeReturn {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async (): Promise<void> => {
      try {
        const settings = await settingsService.getUserSettings();
        setThemeModeState(settings.theme);
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const resolvedThemeMode = useMemo((): 'light' | 'dark' => {
    return resolveThemeMode(themeMode, systemColorScheme);
  }, [themeMode, systemColorScheme]);

  const theme = useMemo((): MD3Theme => {
    return resolvedThemeMode === 'dark' ? darkTheme : lightTheme;
  }, [resolvedThemeMode]);

  const setThemeMode = useCallback(async (mode: ThemeMode): Promise<void> => {
    setThemeModeState(mode);
    try {
      await settingsService.updateUserSettings({ theme: mode });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(async (): Promise<void> => {
    const nextMode: ThemeMode = resolvedThemeMode === 'light' ? 'dark' : 'light';
    await setThemeMode(nextMode);
  }, [resolvedThemeMode, setThemeMode]);

  return {
    theme,
    themeMode,
    resolvedThemeMode,
    isLoading,
    setThemeMode,
    toggleTheme,
  };
}

/**
 * Get the opposite theme mode
 */
export function toggleThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === 'auto') {
    return 'dark';
  }

  return mode === 'light' ? 'dark' : 'light';
}
