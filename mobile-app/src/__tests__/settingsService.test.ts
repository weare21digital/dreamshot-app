/**
 * Unit tests for SettingsService
 * Tests the new activity tracking, wallet lock state, and push token methods
 *
 * Requirements: 10.3, 10.5, 7.3, 11.5, 11.6, 11.7
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsService } from '../services/settingsService';
import { DEFAULT_USER_SETTINGS } from '../types/settings';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('SettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Activity Tracking (Req 10.3, 11.5)', () => {
    it('should return 0 when no last activity is stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await settingsService.getLastActivity();

      expect(result).toBe(0);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@mobile_skeleton/last_activity');
    });

    it('should return stored timestamp for getLastActivity', async () => {
      const timestamp = Date.now();
      mockAsyncStorage.getItem.mockResolvedValue(timestamp.toString());

      const result = await settingsService.getLastActivity();

      expect(result).toBe(timestamp);
    });

    it('should update activity timestamp', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();
      const before = Date.now();

      await settingsService.updateActivity();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@mobile_skeleton/last_activity',
        expect.any(String)
      );

      const storedValue = parseInt(mockAsyncStorage.setItem.mock.calls[0][1], 10);
      expect(storedValue).toBeGreaterThanOrEqual(before);
      expect(storedValue).toBeLessThanOrEqual(Date.now());
    });

    it('should handle errors gracefully in getLastActivity', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await settingsService.getLastActivity();

      expect(result).toBe(0);
    });
  });

  describe('Wallet Lock State (Req 10.5, 11.5)', () => {
    it('should return true (locked) when no lock state is stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await settingsService.isWalletLocked();

      expect(result).toBe(true);
    });

    it('should return false when wallet is explicitly unlocked', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('false');

      const result = await settingsService.isWalletLocked();

      expect(result).toBe(false);
    });

    it('should return true when wallet is explicitly locked', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');

      const result = await settingsService.isWalletLocked();

      expect(result).toBe(true);
    });

    it('should lock wallet and reset activity time', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await settingsService.lockWallet();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@mobile_skeleton/wallet_locked', 'true');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@mobile_skeleton/last_activity', '0');
    });

    it('should unlock wallet and update activity time', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();
      const before = Date.now();

      await settingsService.unlockWallet();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@mobile_skeleton/wallet_locked', 'false');

      const activityCall = mockAsyncStorage.setItem.mock.calls.find(
        call => call[0] === '@mobile_skeleton/last_activity'
      );
      expect(activityCall).toBeDefined();
      const storedTime = parseInt(activityCall![1], 10);
      expect(storedTime).toBeGreaterThanOrEqual(before);
    });

    it('should default to locked on storage error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await settingsService.isWalletLocked();

      expect(result).toBe(true);
    });
  });

  describe('Push Token Management (Req 7.3, 11.5)', () => {
    it('should return null when no push token is stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await settingsService.getExpoPushToken();

      expect(result).toBeNull();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@mobile_skeleton/expo_push_token');
    });

    it('should return stored push token', async () => {
      const token = 'ExponentPushToken[xxxxxxxxxxxx]';
      mockAsyncStorage.getItem.mockResolvedValue(token);

      const result = await settingsService.getExpoPushToken();

      expect(result).toBe(token);
    });

    it('should store push token', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();
      const token = 'ExponentPushToken[xxxxxxxxxxxx]';

      await settingsService.setExpoPushToken(token);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@mobile_skeleton/expo_push_token',
        token
      );
    });

    it('should handle errors gracefully in getExpoPushToken', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await settingsService.getExpoPushToken();

      expect(result).toBeNull();
    });
  });

  describe('Settings Merge Behavior (Req 11.6, 11.7)', () => {
    it('should return default values when no settings exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await settingsService.getUserSettings();

      expect(result).toEqual(DEFAULT_USER_SETTINGS);
    });

    it('should merge partial stored settings with defaults', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({ theme: 'light' }));

      const result = await settingsService.getUserSettings();

      expect(result.theme).toBe('light');
      expect(result.language).toBe(DEFAULT_USER_SETTINGS.language);
      expect(result.notificationsEnabled).toBe(DEFAULT_USER_SETTINGS.notificationsEnabled);
      expect(result.autoLockTimeout).toBe(DEFAULT_USER_SETTINGS.autoLockTimeout);
      expect(result.biometricEnabled).toBe(DEFAULT_USER_SETTINGS.biometricEnabled);
      expect(result.notifyImportantEvents).toBe(DEFAULT_USER_SETTINGS.notifyImportantEvents);
    });

    it('should preserve all fields when updating partial settings', async () => {
      const existingSettings = {
        theme: 'dark' as const,
        language: 'bg' as const,
        notificationsEnabled: false,
        autoLockTimeout: 1800 as const,
        biometricEnabled: true,
        notifyImportantEvents: false,
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingSettings));
      mockAsyncStorage.setItem.mockResolvedValue();

      await settingsService.updateUserSettings({ theme: 'light' });

      const savedSettings = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedSettings.theme).toBe('light');
      expect(savedSettings.language).toBe('bg');
      expect(savedSettings.notificationsEnabled).toBe(false);
      expect(savedSettings.autoLockTimeout).toBe(1800);
      expect(savedSettings.biometricEnabled).toBe(true);
      expect(savedSettings.notifyImportantEvents).toBe(false);
    });
  });
});
