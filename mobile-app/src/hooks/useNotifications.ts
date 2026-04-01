import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  notificationService,
  NotificationPermissionStatus,
  PermissionResult,
} from '../services/notificationService';

// =============================================================================
// Types
// =============================================================================

export interface UseNotificationsReturn {
  // State
  /** Current notification permission status */
  permissionStatus: NotificationPermissionStatus;
  /** Expo push token (null if not registered) */
  pushToken: string | null;
  /** Whether the hook is loading initial state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;

  // Actions
  /** Request notification permission */
  requestPermission: () => Promise<PermissionResult>;
  /** Register for push notifications and get token */
  registerForPushNotifications: () => Promise<string | null>;
  /** Send a test notification */
  sendTestNotification: () => Promise<void>;
  /** Refresh permission status */
  refreshPermissionStatus: () => Promise<void>;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing notifications.
 * Wraps the notificationService and provides reactive state.
 */
export function useNotifications(): UseNotificationsReturn {
  // State
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('undetermined');
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // Check current permission status
        const status = await notificationService.getPermissionStatus();
        setPermissionStatus(status);

        // Get existing push token if any
        const token = await notificationService.getExpoPushToken();
        setPushToken(token);
      } catch (err) {
        console.error('[useNotifications] Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize notifications');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Actions
  const requestPermission = useCallback(async (): Promise<PermissionResult> => {
    try {
      const result = await notificationService.requestPermission();

      // Update permission status
      const status = await notificationService.getPermissionStatus();
      setPermissionStatus(status);

      return result;
    } catch (err) {
      console.error('[useNotifications] Failed to request permission:', err);
      throw err;
    }
  }, []);

  // Push registration is available but optional — only needed if you add a server-side push service.
  // Local notifications (sendTestNotification, sendEventNotification) work without registration.
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    try {
      setError(null);
      const token = await notificationService.registerForPushNotifications();
      setPushToken(token);

      const status = await notificationService.getPermissionStatus();
      setPermissionStatus(status);

      return token;
    } catch (err) {
      console.error('[useNotifications] Failed to register:', err);
      setError(err instanceof Error ? err.message : 'Failed to register for notifications');
      return null;
    }
  }, []);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    try {
      await notificationService.sendTestNotification();
    } catch (err) {
      console.error('[useNotifications] Failed to send test notification:', err);
      throw err;
    }
  }, []);

  const refreshPermissionStatus = useCallback(async (): Promise<void> => {
    try {
      const status = await notificationService.getPermissionStatus();
      setPermissionStatus(status);
    } catch (err) {
      console.error('[useNotifications] Failed to refresh permission status:', err);
    }
  }, []);

  // Memoize return value
  return useMemo(
    () => ({
      // State
      permissionStatus,
      pushToken,
      isLoading,
      error,
      // Actions
      requestPermission,
      registerForPushNotifications,
      sendTestNotification,
      refreshPermissionStatus,
    }),
    [
      permissionStatus,
      pushToken,
      isLoading,
      error,
      requestPermission,
      registerForPushNotifications,
      sendTestNotification,
      refreshPermissionStatus,
    ]
  );
}
