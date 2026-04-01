/* eslint-disable no-undef */
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { settingsService } from './settingsService';
import { AutoLockTimeout } from '../types/settings';

// =============================================================================
// Types
// =============================================================================

/**
 * Security configuration for the app
 */
export interface SecurityConfig {
  /** Auto-lock timeout in seconds (0 = disabled) */
  autoLockTimeout: AutoLockTimeout;
  /** Whether biometric authentication is enabled */
  biometricEnabled: boolean;
}

/**
 * Information about device biometric capabilities
 */
export interface BiometricInfo {
  /** Whether biometric hardware is available */
  isAvailable: boolean;
  /** Whether biometrics are enrolled on the device */
  isEnrolled: boolean;
  /** Type of biometric authentication available */
  biometricType: 'fingerprint' | 'facial' | 'iris' | 'none';
  /** Security level of the biometric */
  securityLevel: 'weak' | 'strong';
}

/**
 * Current auto-lock state
 */
export interface AutoLockState {
  /** Whether the wallet is currently locked */
  isLocked: boolean;
  /** Timestamp of last activity */
  lastActivity: number;
  /** Reason for the lock */
  lockReason: 'timeout' | 'manual' | 'background' | null;
}

/**
 * Result of biometric authentication attempt
 */
export interface BiometricAuthResult {
  /** Whether authentication succeeded */
  success: boolean;
  /** Error message if authentication failed */
  error?: string;
}

/** Lock state change listener */
type LockListener = (locked: boolean, reason: string | null) => void;

// =============================================================================
// Security Service Implementation
// =============================================================================

/**
 * Service for managing biometric authentication and auto-lock functionality.
 * Implements singleton pattern for consistency across the app.
 */
class SecurityService {
  private static instance: SecurityService;

  // State
  private isLocked: boolean = true;
  private lockReason: 'timeout' | 'manual' | 'background' | null = null;
  private lastActivityTime: number = 0;
  private config: SecurityConfig = {
    autoLockTimeout: 900, // 15 minutes default
    biometricEnabled: false,
  };

  // Auto-lock timer
  private autoLockTimer: ReturnType<typeof setTimeout> | null = null;

  // Listeners
  private lockListeners: Set<LockListener> = new Set();

  // App state subscription
  private appStateSubscription: { remove: () => void } | null = null;

  private initialized: boolean = false;

  private constructor() {}

  /**
   * Get the singleton instance of SecurityService
   */
  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize the security service.
   * Loads settings and subscribes to app state changes.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🔐 [Security] Already initialized');
      return;
    }

    try {
      console.log('🔐 [Security] Initializing...');

      // Load settings
      await this.loadSecuritySettings();

      // Load lock state from storage
      this.isLocked = await settingsService.isWalletLocked();
      this.lastActivityTime = await settingsService.getLastActivity();

      // Subscribe to app state changes
      this.appStateSubscription = AppState.addEventListener(
        'change',
        this.handleAppStateChange.bind(this)
      );

      // Start auto-lock timer if not locked
      if (!this.isLocked && this.config.autoLockTimeout > 0) {
        this.resetAutoLockTimer();
      }

      this.initialized = true;
      console.log('🔐 [Security] Initialized successfully', {
        isLocked: this.isLocked,
        autoLockTimeout: this.config.autoLockTimeout,
        biometricEnabled: this.config.biometricEnabled,
      });
    } catch (error) {
      console.error('🔐 [Security] Initialization failed:', error);
      // Continue with defaults
      this.initialized = true;
    }
  }

  /**
   * Clean up resources when the service is destroyed.
   */
  public destroy(): void {
    console.log('🔐 [Security] Destroying...');

    // Clear timer
    this.clearAutoLockTimer();

    // Remove app state subscription
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    // Clear listeners
    this.lockListeners.clear();

    this.initialized = false;
  }

  // ============================================
  // Settings Management
  // ============================================

  /**
   * Load security settings from storage.
   */
  public async loadSecuritySettings(): Promise<void> {
    try {
      const settings = await settingsService.getUserSettings();
      this.config = {
        autoLockTimeout: settings.autoLockTimeout,
        biometricEnabled: settings.biometricEnabled,
      };
      console.log('🔐 [Security] Settings loaded:', this.config);
    } catch (error) {
      console.error('🔐 [Security] Failed to load settings:', error);
    }
  }

  /**
   * Update security configuration.
   */
  public async updateSecurityConfig(updates: Partial<SecurityConfig>): Promise<void> {
    try {
      // Update local config
      this.config = { ...this.config, ...updates };

      // Persist to storage
      await settingsService.updateUserSettings({
        autoLockTimeout: this.config.autoLockTimeout,
        biometricEnabled: this.config.biometricEnabled,
      });

      // Reset timer if timeout changed
      if (updates.autoLockTimeout !== undefined && !this.isLocked) {
        if (this.config.autoLockTimeout > 0) {
          this.resetAutoLockTimer();
        } else {
          this.clearAutoLockTimer();
        }
      }

      console.log('🔐 [Security] Config updated:', this.config);
    } catch (error) {
      console.error('🔐 [Security] Failed to update config:', error);
      throw error;
    }
  }

  /**
   * Get current security configuration.
   */
  public getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  // ============================================
  // Auto-Lock Management
  // ============================================

  /**
   * Handle app state changes (background/foreground).
   */
  private async handleAppStateChange(nextAppState: AppStateStatus): Promise<void> {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App going to background - record activity time
      this.lastActivityTime = Date.now();
      await settingsService.updateActivity();
      this.clearAutoLockTimer();
      console.log('🔐 [Security] App went to background, activity recorded');
    } else if (nextAppState === 'active') {
      // App coming to foreground - check if should lock
      console.log('🔐 [Security] App came to foreground');
      await this.checkAutoLock();

      // Restart timer if not locked
      if (!this.isLocked && this.config.autoLockTimeout > 0) {
        this.resetAutoLockTimer();
      }
    }
  }

  /**
   * Update activity timestamp (call on user interaction).
   */
  public updateActivity(): void {
    this.lastActivityTime = Date.now();

    // Reset auto-lock timer
    if (!this.isLocked && this.config.autoLockTimeout > 0) {
      this.resetAutoLockTimer();
    }
  }

  /**
   * Check if auto-lock should trigger based on elapsed time.
   */
  public async checkAutoLock(): Promise<void> {
    // Skip if already locked or auto-lock disabled
    if (this.isLocked || this.config.autoLockTimeout === 0) {
      return;
    }

    const now = Date.now();
    const elapsed = now - this.lastActivityTime;
    const timeoutMs = this.config.autoLockTimeout * 1000;

    if (elapsed >= timeoutMs) {
      console.log('🔐 [Security] Auto-lock timeout elapsed, locking wallet');
      await this.lockWallet('timeout');
    }
  }

  /**
   * Reset the auto-lock timer.
   */
  private resetAutoLockTimer(): void {
    this.clearAutoLockTimer();

    if (this.config.autoLockTimeout > 0) {
      const timeoutMs = this.config.autoLockTimeout * 1000;
      this.autoLockTimer = setTimeout(async () => {
        console.log('🔐 [Security] Auto-lock timer fired');
        await this.lockWallet('timeout');
      }, timeoutMs);
    }
  }

  /**
   * Clear the auto-lock timer.
   */
  private clearAutoLockTimer(): void {
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  // ============================================
  // Lock/Unlock Operations
  // ============================================

  /**
   * Lock the wallet.
   */
  public async lockWallet(reason: 'timeout' | 'manual' | 'background' = 'manual'): Promise<void> {
    if (this.isLocked) {
      return; // Already locked
    }

    this.isLocked = true;
    this.lockReason = reason;
    this.clearAutoLockTimer();

    // Persist lock state
    await settingsService.lockWallet();

    // Notify listeners
    this.notifyLockListeners(true, reason);

    console.log('🔐 [Security] Wallet locked:', { reason });
  }

  /**
   * Unlock the wallet.
   */
  public async unlockWallet(): Promise<void> {
    if (!this.isLocked) {
      return; // Already unlocked
    }

    this.isLocked = false;
    this.lockReason = null;
    this.lastActivityTime = Date.now();

    // Persist unlock state
    await settingsService.unlockWallet();

    // Start auto-lock timer
    if (this.config.autoLockTimeout > 0) {
      this.resetAutoLockTimer();
    }

    // Notify listeners
    this.notifyLockListeners(false, null);

    console.log('🔐 [Security] Wallet unlocked');
  }

  /**
   * Check if wallet is currently locked.
   */
  public isWalletLocked(): boolean {
    return this.isLocked;
  }

  /**
   * Get current auto-lock state.
   */
  public async getAutoLockState(): Promise<AutoLockState> {
    return {
      isLocked: this.isLocked,
      lastActivity: this.lastActivityTime,
      lockReason: this.lockReason,
    };
  }

  /**
   * Get auto-lock timeout in seconds.
   */
  public getAutoLockTimeout(): number {
    return this.config.autoLockTimeout;
  }

  /**
   * Set auto-lock timeout.
   */
  public async setAutoLockTimeout(seconds: AutoLockTimeout): Promise<void> {
    await this.updateSecurityConfig({ autoLockTimeout: seconds });
  }

  // ============================================
  // Lock Listeners
  // ============================================

  /**
   * Add a listener for lock state changes.
   * Returns a cleanup function to remove the listener.
   */
  public addLockListener(listener: LockListener): () => void {
    this.lockListeners.add(listener);
    return () => {
      this.lockListeners.delete(listener);
    };
  }

  /**
   * Notify all lock listeners of a state change.
   */
  private notifyLockListeners(locked: boolean, reason: string | null): void {
    this.lockListeners.forEach((listener) => {
      try {
        listener(locked, reason);
      } catch (error) {
        console.error('🔐 [Security] Lock listener error:', error);
      }
    });
  }

  // ============================================
  // Biometric Authentication
  // ============================================

  /**
   * Get information about device biometric capabilities.
   */
  public async getBiometricInfo(): Promise<BiometricInfo> {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricInfo['biometricType'] = 'none';
      let securityLevel: BiometricInfo['securityLevel'] = 'weak';

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'facial';
        securityLevel = 'strong';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
        securityLevel = 'strong';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
        securityLevel = 'strong';
      }

      return {
        isAvailable,
        isEnrolled,
        biometricType,
        securityLevel,
      };
    } catch (error) {
      console.error('🔐 [Security] Failed to get biometric info:', error);
      return {
        isAvailable: false,
        isEnrolled: false,
        biometricType: 'none',
        securityLevel: 'weak',
      };
    }
  }

  /**
   * Authenticate using biometrics.
   */
  public async authenticateWithBiometric(
    promptMessage: string = 'Authenticate to unlock'
  ): Promise<BiometricAuthResult> {
    try {
      const biometricInfo = await this.getBiometricInfo();

      if (!biometricInfo.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      if (!biometricInfo.isEnrolled) {
        return {
          success: false,
          error: 'No biometric credentials enrolled. Please set up biometrics in your device settings.',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        console.log('🔐 [Security] Biometric authentication successful');
        return { success: true };
      }

      // Handle different error types
      let errorMessage = 'Authentication failed';

      switch (result.error) {
        case 'user_cancel':
          errorMessage = 'Authentication cancelled';
          break;
        case 'user_fallback':
          errorMessage = 'User chose fallback method';
          break;
        case 'system_cancel':
          errorMessage = 'Authentication cancelled by system';
          break;
        case 'authentication_failed':
          errorMessage = 'Authentication failed. Please try again.';
          break;
        case 'passcode_not_set':
          errorMessage = 'No passcode set on device. Please configure device security.';
          break;
        case 'not_available':
          errorMessage = 'Biometric authentication not available.';
          break;
        default:
          // Covers 'unknown', 'timeout', 'no_space', 'unable_to_process', 'invalid_context'
          // and any lockout scenarios not in the type definition
          errorMessage = 'Authentication failed. Please try again later.';
      }

      console.log('🔐 [Security] Biometric authentication failed:', result.error);
      return {
        success: false,
        error: errorMessage,
      };
    } catch (error) {
      console.error('🔐 [Security] Biometric authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if biometric authentication is enabled.
   */
  public isBiometricEnabled(): boolean {
    return this.config.biometricEnabled;
  }

  /**
   * Enable or disable biometric authentication.
   */
  public async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.updateSecurityConfig({ biometricEnabled: enabled });
  }

  // ============================================
  // Device Security Check
  // ============================================

  /**
   * Check overall device security status.
   */
  public async checkDeviceSecurity(): Promise<{ isSecure: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      const biometricInfo = await this.getBiometricInfo();

      // Check biometric availability
      if (!biometricInfo.isAvailable) {
        warnings.push('No biometric hardware available');
      } else if (!biometricInfo.isEnrolled) {
        warnings.push('No biometric credentials enrolled');
      }

      // Check security level
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
      if (securityLevel === LocalAuthentication.SecurityLevel.NONE) {
        warnings.push('No device security configured (no PIN, pattern, or password)');
      }

      return {
        isSecure: warnings.length === 0,
        warnings,
      };
    } catch (error) {
      console.error('🔐 [Security] Device security check failed:', error);
      return {
        isSecure: false,
        warnings: ['Unable to determine device security status'],
      };
    }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
