import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, List, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from 'expo-router';
import { useChangePassword, useDeleteAccount } from '../../../hooks';
import { useLogout } from '../hooks';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';
import { useAppLanguage } from '../../../contexts/LanguageContext';
import { ThemePicker } from '../../settings/components/ThemePicker';
import { useCoins } from '../../coins/hooks/useCoins';
// Debug imports removed - reset button moved to PremiumScreen

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export function SettingsScreen(): React.JSX.Element {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settingsLoading, setSettingsLoading] = useState(true);

  const { palette, brand, themeMode, setThemeMode, isLoading: themeLoading } = useAppTheme();
  const { balance } = useCoins();
  const { t, currentLanguage } = useAppLanguage();

  const changePassword = useChangePassword();
  const logout = useLogout();
  const deleteAccount = useDeleteAccount();

  useEffect(() => {
    setSettingsLoading(false);
  }, []);

  const handleThemeChange = useCallback(async (mode: 'light' | 'dark' | 'auto'): Promise<void> => {
    try {
      await setThemeMode(mode);
    } catch (err) {
      console.error('Failed to update theme:', err);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    }
  }, [setThemeMode, t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    mode: 'onBlur',
  });

  const onPasswordSubmit = (data: PasswordFormData): void => {
    setError(null);

    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          Alert.alert(
            t('dialogs.passwordChangedTitle'),
            t('dialogs.passwordChangedMessage'),
            [
              {
                text: t('common.ok'),
                onPress: (): void => {
                  setShowPasswordForm(false);
                  reset();
                  handleLogout();
                },
              },
            ]
          );
        },
        onError: (err: Error) => {
          setError(err.message || t('errors.generic'));
        },
      }
    );
  };

  const handleLogout = (): void => {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.replace('/auth/welcome');
      },
      onError: (err: Error) => {
        Alert.alert(t('settings.logout'), err.message || t('errors.generic'));
      },
    });
  };

  const handleDeleteAccount = (): void => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        Alert.alert(
          t('dialogs.deleteAccountTitle'),
          t('dialogs.deleteAccountConfirm'),
          [
            {
              text: t('common.ok'),
              onPress: (): void => router.replace('/auth/welcome'),
            },
          ]
        );
      },
      onError: (err: Error) => {
        Alert.alert(t('common.error'), err.message || t('errors.generic'));
      },
      onSettled: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  const confirmDeleteAccount = (): void => {
    Alert.alert(
      t('dialogs.deleteAccountTitle'),
      t('dialogs.deleteAccountMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => setShowDeleteDialog(true),
        },
      ]
    );
  };

  const navigateToLanguageSettings = (): void => {
    router.push('/(main)/language-settings');
  };

  const navigateToSecuritySettings = (): void => {
    router.push('/(main)/security-settings');
  };

  const navigateToNotificationsSettings = (): void => {
    router.push('/(main)/notifications-settings');
  };

  const navigateToCoinsPurchase = (): void => {
    router.push('/(main)/coins-purchase');
  };

  const navigateToAiDance = (): void => {
    router.push('/(main)/ai-dance');
  };

  const getCurrentLanguageDisplay = (): string => {
    return currentLanguage === 'en' ? 'English' : 'Български';
  };

  if (settingsLoading || themeLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brand.primary} />
          <Text style={[styles.loadingText, { color: palette.textSecondary }]}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={[styles.title, { color: palette.text }]}>
            {t('settings.title')}
          </Text>

          {/* App Preferences */}
          <Text style={[styles.sectionHeader, { color: palette.textSecondary }]}>
            {t('settings.appPreferences').toUpperCase()}
          </Text>
          <ThemePicker
            selectedTheme={themeMode}
            onThemeChange={handleThemeChange}
            isLoading={themeLoading}
          />

          <View style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}> 
            <List.Item
              title={t('settings.language')}
              description={getCurrentLanguageDisplay()}
              titleStyle={{ color: palette.text }}
              descriptionStyle={{ color: palette.textSecondary }}
              left={(props) => <List.Icon {...props} icon="translate" color={brand.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={palette.textSecondary} />}
              onPress={navigateToLanguageSettings}
            />
            <View style={[styles.listDivider, { backgroundColor: palette.borderVariant }]} />
            <List.Item
              title={t('settings.notifications')}
              description={t('settings.notificationsDescription')}
              titleStyle={{ color: palette.text }}
              descriptionStyle={{ color: palette.textSecondary }}
              left={(props) => <List.Icon {...props} icon="bell" color={brand.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={palette.textSecondary} />}
              onPress={navigateToNotificationsSettings}
            />
            <View style={[styles.listDivider, { backgroundColor: palette.borderVariant }]} />
            <List.Item
              title="Purchase Coins"
              description={`Current balance: ${balance} coins`}
              titleStyle={{ color: palette.text }}
              descriptionStyle={{ color: palette.textSecondary }}
              left={(props) => <List.Icon {...props} icon="cash-plus" color={brand.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={palette.textSecondary} />}
              onPress={navigateToCoinsPurchase}
            />
            <View style={[styles.listDivider, { backgroundColor: palette.borderVariant }]} />
            <List.Item
              title="Make It Dance"
              description="Generate an AI dancing video from a photo"
              titleStyle={{ color: palette.text }}
              descriptionStyle={{ color: palette.textSecondary }}
              left={(props) => <List.Icon {...props} icon="movie-open-play" color={brand.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={palette.textSecondary} />}
              onPress={navigateToAiDance}
            />
          </View>

          {/* Security */}
          <Text style={[styles.sectionHeader, { color: palette.textSecondary }]}>
            {t('settings.accountSecurity').toUpperCase()}
          </Text>
          <View style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
            <List.Item
              title={t('securitySettings.title')}
              description={t('securitySettings.biometricDescription')}
              titleStyle={{ color: palette.text }}
              descriptionStyle={{ color: palette.textSecondary }}
              left={(props) => <List.Icon {...props} icon="shield-lock" color={brand.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={palette.textSecondary} />}
              onPress={navigateToSecuritySettings}
            />
            <View style={[styles.listDivider, { backgroundColor: palette.borderVariant }]} />
            <List.Item
              title={t('settings.changePassword')}
              description={t('settings.changePasswordDescription')}
              titleStyle={{ color: palette.text }}
              descriptionStyle={{ color: palette.textSecondary }}
              left={(props) => <List.Icon {...props} icon="lock" color={brand.primary} />}
              onPress={() => setShowPasswordForm(true)}
            />
          </View>

          {/* Account Actions */}
          <Text style={[styles.sectionHeader, { color: palette.textSecondary }]}>
            {t('settings.accountActions').toUpperCase()}
          </Text>
          <View style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
            <List.Item
              title={t('settings.logout')}
              description={t('settings.logoutDescription')}
              titleStyle={{ color: palette.text }}
              descriptionStyle={{ color: palette.textSecondary }}
              left={(props) => <List.Icon {...props} icon="logout" color={palette.textSecondary} />}
              onPress={handleLogout}
              disabled={logout.isPending}
            />
            <View style={[styles.listDivider, { backgroundColor: palette.borderVariant }]} />
            <List.Item
              title={t('settings.deleteAccount')}
              description={t('settings.deleteAccountDescription')}
              titleStyle={{ color: APP_THEME.status.error }}
              descriptionStyle={{ color: palette.textSecondary }}
              left={(props) => <List.Icon {...props} icon="delete" color={APP_THEME.status.error} />}
              onPress={confirmDeleteAccount}
              disabled={deleteAccount.isPending}
            />
          </View>
        </View>
      </ScrollView>

      {/* Password Change Dialog */}
      <Portal>
        <Dialog
          visible={showPasswordForm}
          onDismiss={() => setShowPasswordForm(false)}
          style={{ backgroundColor: palette.surface, borderRadius: APP_THEME.shape.borderRadiusLarge }}
        >
          <Dialog.Title style={{ color: palette.text }}>{t('settings.changePassword')}</Dialog.Title>
          <Dialog.Content>
            {error && (
              <View style={[styles.alertContainer, { backgroundColor: palette.errorContainer, borderLeftColor: APP_THEME.status.error }]}>
                <Text style={[styles.alertText, { color: palette.onErrorContainer }]}>{error}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label={t('auth.currentPassword')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.currentPassword}
                    style={[styles.input, { backgroundColor: palette.inputBackground }]}
                    mode="flat"
                    textColor={palette.text}
                    underlineColor="transparent"
                    activeUnderlineColor={brand.primary}
                    secureTextEntry={!showCurrentPassword}
                    theme={{ roundness: APP_THEME.shape.borderRadius }}
                    right={
                      <TextInput.Icon
                        icon={showCurrentPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      />
                    }
                  />
                  {errors.currentPassword && (
                    <Text style={[styles.fieldError, { color: APP_THEME.status.error }]}>{errors.currentPassword.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label={t('auth.newPassword')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.newPassword}
                    style={[styles.input, { backgroundColor: palette.inputBackground }]}
                    mode="flat"
                    textColor={palette.text}
                    underlineColor="transparent"
                    activeUnderlineColor={brand.primary}
                    secureTextEntry={!showNewPassword}
                    theme={{ roundness: APP_THEME.shape.borderRadius }}
                    right={
                      <TextInput.Icon
                        icon={showNewPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                      />
                    }
                  />
                  {errors.newPassword && (
                    <Text style={[styles.fieldError, { color: APP_THEME.status.error }]}>{errors.newPassword.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label={t('auth.confirmPassword')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.confirmPassword}
                    style={[styles.input, { backgroundColor: palette.inputBackground }]}
                    mode="flat"
                    textColor={palette.text}
                    underlineColor="transparent"
                    activeUnderlineColor={brand.primary}
                    secureTextEntry={!showConfirmPassword}
                    theme={{ roundness: APP_THEME.shape.borderRadius }}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                  />
                  {errors.confirmPassword && (
                    <Text style={[styles.fieldError, { color: APP_THEME.status.error }]}>{errors.confirmPassword.message}</Text>
                  )}
                </View>
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPasswordForm(false)} textColor={palette.textSecondary}>{t('common.cancel')}</Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onPasswordSubmit)}
              loading={changePassword.isPending}
              disabled={changePassword.isPending}
              buttonColor={brand.primary}
              textColor={palette.onPrimary}
            >
              {t('settings.changePassword')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Account Dialog */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
          style={{ backgroundColor: palette.surface, borderRadius: APP_THEME.shape.borderRadiusLarge }}
        >
          <Dialog.Title style={{ color: palette.text }}>{t('dialogs.deleteAccountTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: palette.text }}>
              {t('dialogs.deleteAccountConfirm')}
            </Text>
            <Text variant="bodyMedium" style={[styles.warningText, { color: APP_THEME.status.error }]}>
              {t('dialogs.deleteAccountMessage')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)} textColor={palette.textSecondary}>{t('common.cancel')}</Button>
            <Button
              mode="contained"
              buttonColor={APP_THEME.status.error}
              textColor="#FFFFFF"
              onPress={handleDeleteAccount}
              loading={deleteAccount.isPending}
              disabled={deleteAccount.isPending}
            >
              {t('settings.deleteAccount')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontWeight: '700',
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    borderRadius: APP_THEME.shape.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  listDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  alertContainer: {
    padding: 14,
    borderRadius: APP_THEME.shape.borderRadius,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderRadius: APP_THEME.shape.borderRadius,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
  },
  warningText: {
    marginTop: 16,
    fontWeight: 'bold',
  },
});
