/**
 * Unit tests for useTheme hook
 * Tests theme persistence and error handling
 *
 * Requirements: 1.1, 1.2, 1.3
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTheme } from '../hooks/useTheme';
import { settingsService } from '../services/settingsService';
import { DEFAULT_USER_SETTINGS } from '../types/settings';

// Mock the settings service
jest.mock('../services/settingsService', () => ({
  settingsService: {
    getUserSettings: jest.fn(),
    updateUserSettings: jest.fn(),
  },
}));

const mockSettingsService = settingsService as jest.Mocked<typeof settingsService>;

describe('useTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock returns dark theme
    mockSettingsService.getUserSettings.mockResolvedValue({
      ...DEFAULT_USER_SETTINGS,
      theme: 'dark',
    });
    mockSettingsService.updateUserSettings.mockResolvedValue();
  });

  describe('Theme Loading (Req 1.2)', () => {
    it('should load theme from storage on initialization', async () => {
      mockSettingsService.getUserSettings.mockResolvedValue({
        ...DEFAULT_USER_SETTINGS,
        theme: 'light',
      });

      const { result } = renderHook(() => useTheme());

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.themeMode).toBe('light');
      expect(mockSettingsService.getUserSettings).toHaveBeenCalledTimes(1);
    });

    it('should default to dark theme when loading fails', async () => {
      mockSettingsService.getUserSettings.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should keep default dark theme on error
      expect(result.current.themeMode).toBe('dark');
    });
  });

  describe('setThemeMode Persistence (Req 1.1, 1.3)', () => {
    it('should save theme to storage when setThemeMode is called', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setThemeMode('light');
      });

      expect(mockSettingsService.updateUserSettings).toHaveBeenCalledWith({ theme: 'light' });
      expect(result.current.themeMode).toBe('light');
    });

    it('should update UI even when storage save fails', async () => {
      mockSettingsService.updateUserSettings.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setThemeMode('light');
      });

      // UI should still be updated
      expect(result.current.themeMode).toBe('light');
    });
  });

  describe('toggleTheme Persistence (Req 1.1, 1.3)', () => {
    it('should save toggled theme to storage', async () => {
      mockSettingsService.getUserSettings.mockResolvedValue({
        ...DEFAULT_USER_SETTINGS,
        theme: 'dark',
      });

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('light');
      expect(mockSettingsService.updateUserSettings).toHaveBeenCalledWith({ theme: 'light' });
    });

    it('should toggle from light to dark correctly', async () => {
      mockSettingsService.getUserSettings.mockResolvedValue({
        ...DEFAULT_USER_SETTINGS,
        theme: 'light',
      });

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('dark');
      expect(mockSettingsService.updateUserSettings).toHaveBeenCalledWith({ theme: 'dark' });
    });
  });

  describe('Theme Object', () => {
    it('should return correct theme object based on themeMode', async () => {
      mockSettingsService.getUserSettings.mockResolvedValue({
        ...DEFAULT_USER_SETTINGS,
        theme: 'light',
      });

      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme.dark).toBe(false);

      await act(async () => {
        await result.current.setThemeMode('dark');
      });

      expect(result.current.theme.dark).toBe(true);
    });
  });
});
