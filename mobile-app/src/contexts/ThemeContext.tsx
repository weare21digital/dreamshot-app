import React, { createContext, useContext, useMemo } from 'react';
import { PaperProvider, MD3Theme } from 'react-native-paper';
import { useTheme, UseThemeReturn } from '../hooks/useTheme';
import { ThemeMode } from '../types/settings';
import { APP_THEME, getPalette, ThemePalette } from '../config/theme';

/**
 * Theme context value interface
 */
export interface ThemeContextValue {
  /** The current Material Design 3 theme object */
  theme: MD3Theme;
  /** The user's selected theme mode preference */
  themeMode: ThemeMode;
  /** The effective mode currently applied in the UI */
  resolvedThemeMode: 'light' | 'dark';
  /** Extended palette from APP_THEME for the current mode */
  palette: ThemePalette;
  /** Brand colors from APP_THEME */
  brand: typeof APP_THEME.brand;
  /** Status colors from APP_THEME */
  status: typeof APP_THEME.status;
  /** Whether the theme is currently loading from storage */
  isLoading: boolean;
  /** Set the theme mode explicitly */
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  /** Toggle between light and dark mode */
  toggleTheme: () => Promise<void>;
}

/**
 * Theme context - provides theme state to the entire app
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Props for ThemeProvider component
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider component that wraps the app with theme context and PaperProvider.
 * Must be used at the root of the app component tree.
 */
export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const themeHook: UseThemeReturn = useTheme();

  const contextValue = useMemo((): ThemeContextValue => ({
    theme: themeHook.theme,
    themeMode: themeHook.themeMode,
    resolvedThemeMode: themeHook.resolvedThemeMode,
    palette: getPalette(themeHook.resolvedThemeMode),
    brand: APP_THEME.brand,
    status: APP_THEME.status,
    isLoading: themeHook.isLoading,
    setThemeMode: themeHook.setThemeMode,
    toggleTheme: themeHook.toggleTheme,
  }), [
    themeHook.theme,
    themeHook.themeMode,
    themeHook.resolvedThemeMode,
    themeHook.isLoading,
    themeHook.setThemeMode,
    themeHook.toggleTheme,
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <PaperProvider theme={themeHook.theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the theme context.
 * Must be used within a ThemeProvider.
 *
 * @throws Error if used outside of ThemeProvider
 */
export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }

  return context;
}
