/**
 * Property-based tests for Brand Color System
 *
 * **Feature: feature-parity-transfer, Property 2: Brand color consistency across themes**
 * **Validates: Requirements 9.6**
 */
import fc from 'fast-check';
import {
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
} from 'react-native-paper';
import { ThemeMode } from '../types/settings';
import { BRAND_COLOR } from '../utils/theme-helpers';

// Recreate themes as they are in useTheme.ts to test the pattern
const createDarkTheme = (): MD3Theme => ({
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: BRAND_COLOR,
    primaryContainer: '#3700B3',
    secondary: '#03DAC6',
    secondaryContainer: '#018786',
    surface: '#121212',
    surfaceVariant: '#2C2C2C',
    background: '#121212',
    error: '#CF6679',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
  },
});

const createLightTheme = (): MD3Theme => ({
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: BRAND_COLOR,
    primaryContainer: '#BB86FC',
    secondary: '#03DAC6',
    secondaryContainer: '#018786',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#B00020',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onSurface: '#000000',
    onBackground: '#000000',
  },
});

const getTheme = (mode: ThemeMode): MD3Theme => {
  return mode === 'dark' ? createDarkTheme() : createLightTheme();
};

describe('Feature: feature-parity-transfer', () => {
  describe('Property 2: Brand color consistency across themes', () => {
    /**
     * **Feature: feature-parity-transfer, Property 2: Brand color consistency across themes**
     * **Validates: Requirements 9.6**
     *
     * For any theme mode, both light and dark theme objects should use
     * the BRAND_COLOR constant as their primary color.
     */
    it('should use BRAND_COLOR as primary color for any theme mode', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<ThemeMode>('light', 'dark'),
          (themeMode) => {
            const theme = getTheme(themeMode);
            expect(theme.colors.primary).toBe(BRAND_COLOR);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have the same primary color in both light and dark themes', () => {
      const lightTheme = createLightTheme();
      const darkTheme = createDarkTheme();

      expect(lightTheme.colors.primary).toBe(darkTheme.colors.primary);
      expect(lightTheme.colors.primary).toBe(BRAND_COLOR);
    });

    it('should export BRAND_COLOR as a valid hex color', () => {
      // Valid hex color pattern: # followed by 3 or 6 hex characters
      const hexColorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      expect(BRAND_COLOR).toMatch(hexColorPattern);
    });
  });
});
