import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserSettings,
  DEFAULT_USER_SETTINGS,
} from '../types/settings';

/** Storage keys for settings and state */
const SETTINGS_STORAGE_KEY = '@mobile_skeleton/user_settings';
const LAST_ACTIVITY_KEY = '@mobile_skeleton/last_activity';
const WALLET_LOCKED_KEY = '@mobile_skeleton/wallet_locked';
const EXPO_PUSH_TOKEN_KEY = '@mobile_skeleton/expo_push_token';

/**
 * Service for persisting and retrieving user settings from AsyncStorage.
 * Implements singleton pattern for consistency across the app.
 */
class SettingsService {
  private static instance: SettingsService;

  private constructor() {}

  /**
   * Get the singleton instance of SettingsService
   */
  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Get user settings from AsyncStorage.
   * Returns default settings if storage is empty or on error.
   */
  public async getUserSettings(): Promise<UserSettings> {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings) as Partial<UserSettings>;
        // Merge with defaults to ensure all fields exist
        return {
          ...DEFAULT_USER_SETTINGS,
          ...parsed,
        };
      }
      
      return { ...DEFAULT_USER_SETTINGS };
    } catch (error) {
      console.error('Failed to load user settings:', error);
      return { ...DEFAULT_USER_SETTINGS };
    }
  }

  /**
   * Save complete user settings to AsyncStorage.
   * Overwrites all existing settings.
   */
  public async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save user settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Update partial user settings without overwriting all settings.
   * Merges the updates with existing settings.
   */
  public async updateUserSettings(updates: Partial<UserSettings>): Promise<void> {
    try {
      const currentSettings = await this.getUserSettings();
      const newSettings: UserSettings = {
        ...currentSettings,
        ...updates,
      };
      await this.saveUserSettings(newSettings);
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  /**
   * Reset user settings to default values.
   */
  public async resetUserSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset user settings:', error);
      throw new Error('Failed to reset settings');
    }
  }

  // ============================================
  // Activity Tracking Methods (Req 10.3, 11.5)
  // ============================================

  /**
   * Get the last activity timestamp.
   * Returns 0 if no activity has been recorded.
   */
  public async getLastActivity(): Promise<number> {
    try {
      const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
      return lastActivity ? parseInt(lastActivity, 10) : 0;
    } catch (error) {
      console.error('Failed to get last activity:', error);
      return 0;
    }
  }

  /**
   * Update the last activity timestamp to the current time.
   */
  public async updateActivity(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }

  // ============================================
  // Wallet Lock State Methods (Req 10.5, 11.5)
  // ============================================

  /**
   * Check if the wallet is currently locked.
   */
  public async isWalletLocked(): Promise<boolean> {
    try {
      const locked = await AsyncStorage.getItem(WALLET_LOCKED_KEY);
      // Default to locked (true) if not set
      return locked !== 'false';
    } catch (error) {
      console.error('Failed to check wallet lock state:', error);
      return true; // Default to locked on error
    }
  }

  /**
   * Lock the wallet and reset activity time.
   */
  public async lockWallet(): Promise<void> {
    try {
      await AsyncStorage.setItem(WALLET_LOCKED_KEY, 'true');
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, '0');
    } catch (error) {
      console.error('Failed to lock wallet:', error);
      throw new Error('Failed to lock wallet');
    }
  }

  /**
   * Unlock the wallet and update activity time.
   */
  public async unlockWallet(): Promise<void> {
    try {
      await AsyncStorage.setItem(WALLET_LOCKED_KEY, 'false');
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      throw new Error('Failed to unlock wallet');
    }
  }

  // ============================================
  // Push Token Methods (Req 7.3, 11.5)
  // ============================================

  /**
   * Get the stored Expo push token.
   * Returns null if no token is stored.
   */
  public async getExpoPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get Expo push token:', error);
      return null;
    }
  }

  /**
   * Store the Expo push token.
   */
  public async setExpoPushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to set Expo push token:', error);
      throw new Error('Failed to store push token');
    }
  }
}

// Export singleton instance
export const settingsService = SettingsService.getInstance();
