import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { settingsService } from './settingsService';

/**
 * Notification scheduling approach (reference skeleton)
 *
 * Why CALENDAR triggers for recurring reminders:
 * - Recurring schedules should survive app restarts and device reboots.
 * - `SchedulableTriggerInputTypes.CALENDAR` with `repeats: true` is persisted by the OS,
 *   so reminders keep firing without app-side "reschedule on launch" work.
 *
 * Why deterministic identifiers:
 * - Each recurring reminder uses a stable ID derived from the domain item + slot
 *   (example: `item-{itemId}-{slotKey}`).
 * - Scheduling the same identifier is idempotent: updates replace previous schedules
 *   instead of creating duplicates.
 *
 * One-shot vs recurring:
 * - Recurring schedules: use CALENDAR + repeats.
 * - Immediate/snooze-style reminders: use DATE (or immediate trigger where appropriate).
 *
 * Lifecycle contract:
 * - Create -> schedule recurring notifications.
 * - Edit -> cancel previous deterministic IDs, then schedule updated ones.
 * - Delete -> cancel deterministic IDs for that item.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Permission status for notifications
 */
export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Result of a permission request
 */
export interface PermissionResult {
  /** Whether permission was granted */
  granted: boolean;
  /** Whether the user can be asked again */
  canAskAgain: boolean;
}

/**
 * Notification event types that can be filtered
 */
export type NotificationEventType = 'important_event' | 'scheduled_item';

/**
 * A recurring time slot definition for a scheduled item.
 *
 * - `slotKey` should be stable for the same logical slot (e.g. "morning", "slot-0", "mon-0900").
 * - `weekday` is optional; when omitted the reminder repeats daily.
 *   Expo weekday uses 1-7 where Sunday = 1.
 */
export interface RecurringNotificationSlot {
  slotKey: string;
  hour: number;
  minute: number;
  weekday?: number;
}

/**
 * Input payload for scheduling recurring notifications for a domain item.
 */
export interface ScheduleRecurringNotificationsInput {
  itemId: string;
  title: string;
  body: string;
  slots: RecurringNotificationSlot[];
  data?: Record<string, unknown>;
}

/**
 * Input payload for cancelling recurring notifications for a domain item.
 */
export interface CancelRecurringNotificationsInput {
  itemId: string;
  slotKeys: string[];
}

/**
 * Input payload for one-shot DATE notifications (e.g. snooze/immediate follow-up).
 */
export interface ScheduleOneShotNotificationInput {
  identifier: string;
  title: string;
  body: string;
  date: Date;
  data?: Record<string, unknown>;
}

// =============================================================================
// Configure Notification Handler
// =============================================================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// =============================================================================
// Notification Service Implementation
// =============================================================================

/**
 * Service for managing local and push notifications.
 * Implements singleton pattern for consistency across the app.
 */
class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private initialized: boolean = false;

  private constructor() {}

  /**
   * Get the singleton instance of NotificationService
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Build deterministic recurring notification identifier.
   */
  private buildRecurringIdentifier(itemId: string, slotKey: string): string {
    return `item-${itemId}-${slotKey}`;
  }

  // ============================================
  // Permission Management
  // ============================================

  /**
   * Request notification permission from the user.
   */
  public async requestPermission(): Promise<PermissionResult> {
    try {
      console.log('🔔 [Notification] Requesting permission...');

      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';
      console.log('🔔 [Notification] Permission result:', { granted, status: finalStatus });

      return {
        granted,
        canAskAgain: finalStatus !== 'denied',
      };
    } catch (error) {
      console.error('🔔 [Notification] Permission request failed:', error);
      return {
        granted: false,
        canAskAgain: false,
      };
    }
  }

  /**
   * Get the current notification permission status.
   */
  public async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const { status } = await Notifications.getPermissionsAsync();

      if (status === 'granted') return 'granted';
      if (status === 'denied') return 'denied';
      return 'undetermined';
    } catch (error) {
      console.error('🔔 [Notification] Failed to get permission status:', error);
      return 'undetermined';
    }
  }

  // ============================================
  // Push Token Management
  // ============================================

  /**
   * Register for push notifications and obtain Expo push token.
   * CRITICAL: iOS requires projectId for getExpoPushTokenAsync() to work.
   */
  public async registerForPushNotifications(): Promise<string | null> {
    try {
      console.log('🔔 [Notification] Registering for push notifications...');

      const permission = await this.requestPermission();
      if (!permission.granted) {
        console.log('🔔 [Notification] Permission not granted, skipping token registration');
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.warn('🔔 [Notification] No projectId found - push notifications may not work on iOS');
        console.warn('🔔 [Notification] Ensure app.json has extra.eas.projectId configured');
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      this.expoPushToken = pushTokenData.data;

      await settingsService.setExpoPushToken(this.expoPushToken);

      console.log('🔔 [Notification] Push token registered:', this.expoPushToken.substring(0, 30) + '...');

      this.initialized = true;
      return this.expoPushToken;
    } catch (error) {
      console.error('🔔 [Notification] Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Get the stored Expo push token.
   */
  public async getExpoPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }

    const storedToken = await settingsService.getExpoPushToken();
    if (storedToken) {
      this.expoPushToken = storedToken;
    }

    return this.expoPushToken;
  }

  // ============================================
  // Settings Check
  // ============================================

  /**
   * Check if notifications should be sent based on user settings.
   */
  public async shouldSendNotification(type: NotificationEventType): Promise<boolean> {
    try {
      const settings = await settingsService.getUserSettings();

      if (!settings.notificationsEnabled) {
        return false;
      }

      switch (type) {
        case 'important_event':
          return settings.notifyImportantEvents;
        case 'scheduled_item':
          return settings.notificationsEnabled;
        default:
          return true;
      }
    } catch (error) {
      console.error('🔔 [Notification] Failed to check notification settings:', error);
      return false;
    }
  }

  // ============================================
  // Recurring Schedules (CALENDAR)
  // ============================================

  /**
   * Schedule recurring notifications for a domain item using CALENDAR triggers.
   *
   * This is the preferred approach for recurring reminders in this skeleton app.
   * Call this on item create, and after item edits (with cancel + reschedule).
   */
  public async scheduleRecurringNotifications(
    input: ScheduleRecurringNotificationsInput
  ): Promise<void> {
    try {
      const shouldSend = await this.shouldSendNotification('scheduled_item');
      if (!shouldSend) {
        console.log('🔔 [Notification] Recurring schedule skipped (disabled in settings)');
        return;
      }

      const permissionStatus = await this.getPermissionStatus();
      if (permissionStatus !== 'granted') {
        console.log('🔔 [Notification] Recurring schedule skipped (no permission)');
        return;
      }

      for (const slot of input.slots) {
        const identifier = this.buildRecurringIdentifier(input.itemId, slot.slotKey);

        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: input.title,
            body: input.body,
            sound: true,
            data: {
              type: 'scheduled_item',
              itemId: input.itemId,
              slotKey: slot.slotKey,
              ...input.data,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: slot.hour,
            minute: slot.minute,
            ...(slot.weekday ? { weekday: slot.weekday } : {}),
            repeats: true,
          },
        });
      }

      console.log('🔔 [Notification] Scheduled recurring reminders for item:', input.itemId);
    } catch (error) {
      console.error('🔔 [Notification] Failed to schedule recurring notifications:', error);
    }
  }

  /**
   * Cancel recurring notifications for a domain item by deterministic identifiers.
   *
   * This avoids expensive full-list lookups and keeps delete/update paths predictable.
   */
  public async cancelRecurringNotifications(
    input: CancelRecurringNotificationsInput
  ): Promise<void> {
    try {
      for (const slotKey of input.slotKeys) {
        const identifier = this.buildRecurringIdentifier(input.itemId, slotKey);
        await Notifications.cancelScheduledNotificationAsync(identifier);
      }

      console.log('🔔 [Notification] Cancelled recurring reminders for item:', input.itemId);
    } catch (error) {
      console.error('🔔 [Notification] Failed to cancel recurring notifications:', error);
    }
  }

  /**
   * Reschedule recurring notifications after edits.
   *
   * Lifecycle: cancel previous deterministic IDs -> schedule updated slots.
   */
  public async rescheduleRecurringNotifications(params: {
    cancel: CancelRecurringNotificationsInput;
    schedule: ScheduleRecurringNotificationsInput;
  }): Promise<void> {
    await this.cancelRecurringNotifications(params.cancel);
    await this.scheduleRecurringNotifications(params.schedule);
  }

  // ============================================
  // One-shot Schedules (DATE)
  // ============================================

  /**
   * Schedule a one-shot DATE notification.
   * Intended for snooze / immediate follow-up use cases.
   */
  public async scheduleOneShotNotification(
    input: ScheduleOneShotNotificationInput
  ): Promise<string | null> {
    try {
      const permissionStatus = await this.getPermissionStatus();
      if (permissionStatus !== 'granted') {
        console.log('🔔 [Notification] One-shot schedule skipped (no permission)');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: input.identifier,
        content: {
          title: input.title,
          body: input.body,
          sound: true,
          data: input.data,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: input.date,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('🔔 [Notification] Failed to schedule one-shot notification:', error);
      return null;
    }
  }

  // ============================================
  // Local Notifications
  // ============================================

  /**
   * Send a local event notification.
   * Checks user settings before sending.
   */
  public async sendEventNotification(
    title: string,
    body: string,
    description?: string
  ): Promise<void> {
    try {
      const shouldSend = await this.shouldSendNotification('important_event');
      if (!shouldSend) {
        console.log('🔔 [Notification] Event notification skipped (disabled in settings)');
        return;
      }

      const permissionStatus = await this.getPermissionStatus();
      if (permissionStatus !== 'granted') {
        console.log('🔔 [Notification] Event notification skipped (no permission)');
        return;
      }

      let notificationBody = body;
      if (description) {
        notificationBody = `${body}\n${description}`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: notificationBody,
          sound: true,
        },
        trigger: null,
      });

      console.log('🔔 [Notification] Event notification sent:', { title, body });
    } catch (error) {
      console.error('🔔 [Notification] Failed to send event notification:', error);
    }
  }

  /**
   * Send a test notification to verify settings.
   */
  public async sendTestNotification(): Promise<void> {
    try {
      const permissionStatus = await this.getPermissionStatus();
      if (permissionStatus !== 'granted') {
        console.log('🔔 [Notification] Test notification skipped (no permission)');
        throw new Error('Notification permission not granted');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'If you see this, notifications are working correctly!',
          sound: true,
        },
        trigger: null,
      });

      console.log('🔔 [Notification] Test notification sent');
    } catch (error) {
      console.error('🔔 [Notification] Failed to send test notification:', error);
      throw error;
    }
  }

  // ============================================
  // Notification Listeners
  // ============================================

  /**
   * Add a listener for received notifications (when app is in foreground).
   * Returns a cleanup function.
   */
  public addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): () => void {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    return () => subscription.remove();
  }

  /**
   * Add a listener for notification responses (when user taps notification).
   * Returns a cleanup function.
   */
  public addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return () => subscription.remove();
  }

  // ============================================
  // Badge Management
  // ============================================

  /**
   * Get the current badge count.
   */
  public async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('🔔 [Notification] Failed to get badge count:', error);
      return 0;
    }
  }

  /**
   * Set the badge count.
   */
  public async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('🔔 [Notification] Failed to set badge count:', error);
    }
  }

  /**
   * Clear the badge count.
   */
  public async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }
}

export const notificationService = NotificationService.getInstance();
