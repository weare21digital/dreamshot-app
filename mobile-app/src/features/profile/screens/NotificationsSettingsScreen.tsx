import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, Platform } from 'react-native';
import { Text, Card, List, Switch, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// TODO: Re-enable when push notifications backend is ready
// import { useNotifications } from '../../../hooks';
import { useNotifications } from '../../../hooks/useNotifications';
import { useAppLanguage } from '../../../contexts/LanguageContext';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';

export function NotificationsSettingsScreen(): React.JSX.Element {
  const { t } = useAppLanguage();
  const { theme } = useAppTheme();
  const {
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    sendTestNotification,
  } = useNotifications();

  // Local state for notification preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(permissionStatus === 'granted');
  const [notifyImportantEvents, setNotifyImportantEvents] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingImportantEvents, setSavingImportantEvents] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Handle push notifications toggle
  const handleNotificationsToggle = useCallback(async (enabled: boolean): Promise<void> => {
    setSavingNotifications(true);
    try {
      if (enabled && permissionStatus !== 'granted') {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            t('notificationSettings.permissionRequired'),
            t('notificationSettings.permissionDenied'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('settings.title'),
                onPress: () => {
                  // Open app settings on the device
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ]
          );
          return;
        }
      }
      setNotificationsEnabled(enabled);
    } catch (err) {
      console.error('Failed to toggle notifications:', err);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    } finally {
      setSavingNotifications(false);
    }
  }, [permissionStatus, requestPermission, t]);

  // Handle important events toggle
  const handleImportantEventsToggle = useCallback(async (enabled: boolean): Promise<void> => {
    setSavingImportantEvents(true);
    try {
      setNotifyImportantEvents(enabled);
    } catch (err) {
      console.error('Failed to toggle important events:', err);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    } finally {
      setSavingImportantEvents(false);
    }
  }, [t]);

  // Handle test notification
  const handleTestNotification = useCallback(async (): Promise<void> => {
    if (permissionStatus !== 'granted') {
      Alert.alert(
        t('notificationSettings.permissionRequired'),
        t('notificationSettings.permissionDenied')
      );
      return;
    }

    setSendingTest(true);
    try {
      await sendTestNotification();
      Alert.alert(t('common.success'), t('notificationSettings.testNotificationSent'));
    } catch (err) {
      console.error('Failed to send test notification:', err);
      Alert.alert(t('common.error'), t('notificationSettings.testNotificationFailed'));
    } finally {
      setSendingTest(false);
    }
  }, [permissionStatus, sendTestNotification, t]);

  // Get permission status display
  const getPermissionStatusDisplay = (): string => {
    switch (permissionStatus) {
      case 'granted':
        return t('common.yes');
      case 'denied':
        return t('common.no');
      default:
        return t('languageSettings.unknown');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <Button mode="contained" onPress={() => {}} style={styles.retryButton}>
            {t('common.retry')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            {t('notificationSettings.title')}
          </Text>

          {/* Push Notifications Card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('notificationSettings.pushNotifications')}
              </Text>

              <List.Item
                title={t('notificationSettings.pushNotifications')}
                description={t('notificationSettings.pushNotificationsDescription')}
                left={(props) => <List.Icon {...props} icon="bell" />}
                right={() => (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleNotificationsToggle}
                    disabled={savingNotifications}
                  />
                )}
              />

              {/* Permission Status */}
              <List.Item
                title={t('notificationSettings.permissionRequired')}
                description={getPermissionStatusDisplay()}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={permissionStatus === 'granted' ? 'check-circle' : 'alert-circle'}
                    color={permissionStatus === 'granted' ? APP_THEME.status.success : APP_THEME.status.warning}
                  />
                )}
              />
            </Card.Content>
          </Card>

          {/* Notification Types Card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('notificationSettings.importantEvents')}
              </Text>

              <List.Item
                title={t('notificationSettings.importantEvents')}
                description={t('notificationSettings.importantEventsDescription')}
                left={(props) => <List.Icon {...props} icon="star" />}
                right={() => (
                  <Switch
                    value={notifyImportantEvents}
                    onValueChange={handleImportantEventsToggle}
                    disabled={savingImportantEvents || !notificationsEnabled}
                  />
                )}
              />
            </Card.Content>
          </Card>

          {/* Test Notification Card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('notificationSettings.testNotification')}
              </Text>

              <Text variant="bodyMedium" style={styles.description}>
                {t('notificationSettings.testNotificationDescription')}
              </Text>

              <Button
                mode="contained"
                onPress={handleTestNotification}
                loading={sendingTest}
                disabled={sendingTest || permissionStatus !== 'granted'}
                style={styles.testButton}
                icon="send"
              >
                {t('notificationSettings.testNotification')}
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  testButton: {
    marginTop: 8,
  },
});

