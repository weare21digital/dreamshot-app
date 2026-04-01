import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, List, Switch, Button, ActivityIndicator, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSecurity } from '../../../hooks';
import { useAppLanguage } from '../../../contexts/LanguageContext';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { AutoLockTimeout } from '../../../types/settings';

/**
 * Auto-lock timeout options with their values and translation keys
 */
const AUTO_LOCK_OPTIONS: { value: AutoLockTimeout; labelKey: string }[] = [
  { value: 0, labelKey: 'securitySettings.timeout.disabled' },
  { value: 300, labelKey: 'securitySettings.timeout.5min' },
  { value: 900, labelKey: 'securitySettings.timeout.15min' },
  { value: 1800, labelKey: 'securitySettings.timeout.30min' },
  { value: 3600, labelKey: 'securitySettings.timeout.1hr' },
  { value: 7200, labelKey: 'securitySettings.timeout.2hr' },
];

export function SecuritySettingsScreen(): React.JSX.Element {
  const { t } = useAppLanguage();
  const { theme } = useAppTheme();
  const {
    isLocked,
    config,
    biometricInfo,
    isLoading,
    error,
    lockWallet,
    authenticateWithBiometric,
    setAutoLockTimeout,
    setBiometricEnabled,
  } = useSecurity();

  const [savingBiometric, setSavingBiometric] = useState(false);
  const [savingTimeout, setSavingTimeout] = useState(false);
  const [locking, setLocking] = useState(false);

  // Handle biometric toggle
  const handleBiometricToggle = useCallback(async (enabled: boolean): Promise<void> => {
    if (!biometricInfo?.isAvailable) {
      Alert.alert(t('common.error'), t('securitySettings.biometricNotAvailable'));
      return;
    }

    if (!biometricInfo?.isEnrolled) {
      Alert.alert(t('common.error'), t('securitySettings.biometricNotEnrolled'));
      return;
    }

    setSavingBiometric(true);
    try {
      if (enabled) {
        // Authenticate first before enabling
        const result = await authenticateWithBiometric(t('securitySettings.enableBiometricFirst'));
        if (!result.success) {
          Alert.alert(t('common.error'), result.error || t('errors.generic'));
          return;
        }
      }

      await setBiometricEnabled(enabled);
      Alert.alert(
        t('common.success'),
        enabled ? t('securitySettings.biometricEnabled') : t('securitySettings.biometricDisabled')
      );
    } catch (err) {
      console.error('Failed to toggle biometric:', err);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    } finally {
      setSavingBiometric(false);
    }
  }, [biometricInfo, authenticateWithBiometric, setBiometricEnabled, t]);

  // Handle auto-lock timeout change
  const handleTimeoutChange = useCallback(async (value: string): Promise<void> => {
    const timeout = parseInt(value, 10) as AutoLockTimeout;
    setSavingTimeout(true);
    try {
      await setAutoLockTimeout(timeout);
    } catch (err) {
      console.error('Failed to set auto-lock timeout:', err);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    } finally {
      setSavingTimeout(false);
    }
  }, [setAutoLockTimeout, t]);

  // Handle lock now button
  const handleLockNow = useCallback(async (): Promise<void> => {
    setLocking(true);
    try {
      await lockWallet();
    } catch (err) {
      console.error('Failed to lock wallet:', err);
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setLocking(false);
    }
  }, [lockWallet, t]);

  // Get biometric type display name
  const getBiometricTypeDisplay = (): string => {
    if (!biometricInfo) return '';
    const typeKey = `securitySettings.biometricType.${biometricInfo.biometricType}`;
    return t(typeKey);
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
            {t('securitySettings.title')}
          </Text>

          {/* Biometric Authentication Card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('securitySettings.biometric')}
              </Text>

              <List.Item
                title={t('securitySettings.biometric')}
                description={
                  biometricInfo?.isAvailable
                    ? `${getBiometricTypeDisplay()} - ${t('securitySettings.biometricDescription')}`
                    : t('securitySettings.biometricNotAvailable')
                }
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={biometricInfo?.biometricType === 'facial' ? 'face-recognition' : 'fingerprint'}
                  />
                )}
                right={() => (
                  <Switch
                    value={config.biometricEnabled}
                    onValueChange={handleBiometricToggle}
                    disabled={
                      savingBiometric ||
                      !biometricInfo?.isAvailable ||
                      !biometricInfo?.isEnrolled
                    }
                  />
                )}
              />
            </Card.Content>
          </Card>

          {/* Auto-Lock Card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('securitySettings.autoLock')}
              </Text>

              <Text variant="bodyMedium" style={styles.description}>
                {t('securitySettings.autoLockDescription')}
              </Text>

              <RadioButton.Group
                onValueChange={handleTimeoutChange}
                value={config.autoLockTimeout.toString()}
              >
                {AUTO_LOCK_OPTIONS.map((option) => (
                  <RadioButton.Item
                    key={option.value}
                    label={t(option.labelKey)}
                    value={option.value.toString()}
                    disabled={savingTimeout}
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>

              {savingTimeout && (
                <ActivityIndicator size="small" style={styles.savingIndicator} />
              )}
            </Card.Content>
          </Card>

          {/* Lock Now Card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('securitySettings.lockNow')}
              </Text>

              <Text variant="bodyMedium" style={styles.description}>
                {t('securitySettings.lockNowDescription')}
              </Text>

              <Button
                mode="contained"
                onPress={handleLockNow}
                loading={locking}
                disabled={locking || isLocked}
                style={styles.lockButton}
                icon="lock"
              >
                {t('securitySettings.lockNow')}
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
  radioItem: {
    paddingVertical: 4,
  },
  savingIndicator: {
    marginTop: 8,
  },
  lockButton: {
    marginTop: 8,
  },
});

