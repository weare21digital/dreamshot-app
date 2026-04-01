import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  securityService,
  SecurityConfig,
  BiometricInfo,
  AutoLockState,
  BiometricAuthResult,
} from '../services/securityService';
import { AutoLockTimeout } from '../types/settings';

// =============================================================================
// Types
// =============================================================================

export interface UseSecurityReturn {
  // State
  /** Whether the wallet is currently locked */
  isLocked: boolean;
  /** Current security configuration */
  config: SecurityConfig;
  /** Information about device biometric capabilities */
  biometricInfo: BiometricInfo | null;
  /** Whether the hook is loading initial state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;

  // Actions
  /** Lock the wallet manually */
  lockWallet: () => Promise<void>;
  /** Unlock the wallet (should be called after successful authentication) */
  unlockWallet: () => Promise<void>;
  /** Authenticate using biometrics */
  authenticateWithBiometric: (promptMessage?: string) => Promise<BiometricAuthResult>;
  /** Set auto-lock timeout */
  setAutoLockTimeout: (seconds: AutoLockTimeout) => Promise<void>;
  /** Enable or disable biometric authentication */
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  /** Update user activity (resets auto-lock timer) */
  updateActivity: () => void;
  /** Get current auto-lock state */
  getAutoLockState: () => Promise<AutoLockState>;
  /** Refresh biometric info */
  refreshBiometricInfo: () => Promise<void>;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing security features (biometric auth and auto-lock).
 * Wraps the securityService and provides reactive state.
 */
export function useSecurity(): UseSecurityReturn {
  // State
  const [isLocked, setIsLocked] = useState(true);
  const [config, setConfig] = useState<SecurityConfig>({
    autoLockTimeout: 900,
    biometricEnabled: false,
  });
  const [biometricInfo, setBiometricInfo] = useState<BiometricInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize security service if not already done
        await securityService.initialize();

        // Load initial state
        setIsLocked(securityService.isWalletLocked());
        setConfig(securityService.getSecurityConfig());

        // Get biometric info
        const bioInfo = await securityService.getBiometricInfo();
        setBiometricInfo(bioInfo);
      } catch (err) {
        console.error('[useSecurity] Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize security');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Subscribe to lock state changes
  useEffect(() => {
    const unsubscribe = securityService.addLockListener((locked, reason) => {
      console.log('[useSecurity] Lock state changed:', { locked, reason });
      setIsLocked(locked);
    });

    return unsubscribe;
  }, []);

  // Actions
  const lockWallet = useCallback(async (): Promise<void> => {
    try {
      await securityService.lockWallet('manual');
    } catch (err) {
      console.error('[useSecurity] Failed to lock wallet:', err);
      throw err;
    }
  }, []);

  const unlockWallet = useCallback(async (): Promise<void> => {
    try {
      await securityService.unlockWallet();
    } catch (err) {
      console.error('[useSecurity] Failed to unlock wallet:', err);
      throw err;
    }
  }, []);

  const authenticateWithBiometric = useCallback(
    async (promptMessage?: string): Promise<BiometricAuthResult> => {
      return securityService.authenticateWithBiometric(promptMessage);
    },
    []
  );

  const setAutoLockTimeout = useCallback(async (seconds: AutoLockTimeout): Promise<void> => {
    try {
      await securityService.setAutoLockTimeout(seconds);
      setConfig(securityService.getSecurityConfig());
    } catch (err) {
      console.error('[useSecurity] Failed to set auto-lock timeout:', err);
      throw err;
    }
  }, []);

  const setBiometricEnabled = useCallback(async (enabled: boolean): Promise<void> => {
    try {
      await securityService.setBiometricEnabled(enabled);
      setConfig(securityService.getSecurityConfig());
    } catch (err) {
      console.error('[useSecurity] Failed to set biometric enabled:', err);
      throw err;
    }
  }, []);

  const updateActivity = useCallback((): void => {
    securityService.updateActivity();
  }, []);

  const getAutoLockState = useCallback(async (): Promise<AutoLockState> => {
    return securityService.getAutoLockState();
  }, []);

  const refreshBiometricInfo = useCallback(async (): Promise<void> => {
    try {
      const bioInfo = await securityService.getBiometricInfo();
      setBiometricInfo(bioInfo);
    } catch (err) {
      console.error('[useSecurity] Failed to refresh biometric info:', err);
    }
  }, []);

  // Memoize return value
  return useMemo(
    () => ({
      // State
      isLocked,
      config,
      biometricInfo,
      isLoading,
      error,
      // Actions
      lockWallet,
      unlockWallet,
      authenticateWithBiometric,
      setAutoLockTimeout,
      setBiometricEnabled,
      updateActivity,
      getAutoLockState,
      refreshBiometricInfo,
    }),
    [
      isLocked,
      config,
      biometricInfo,
      isLoading,
      error,
      lockWallet,
      unlockWallet,
      authenticateWithBiometric,
      setAutoLockTimeout,
      setBiometricEnabled,
      updateActivity,
      getAutoLockState,
      refreshBiometricInfo,
    ]
  );
}
