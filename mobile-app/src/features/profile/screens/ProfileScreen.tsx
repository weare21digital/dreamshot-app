import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { TextInput, Button, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from 'expo-router';
import { useUserProfile, useUpdateProfile, useLogout } from '../hooks';
import { PremiumStatus } from '../../../types';
import { IAP_CONFIG } from '../../../config/iap';
import { useDevicePremiumStatus } from '../../payments/hooks/useDevicePremiumStatus';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';
import { useCoins } from '../../coins/hooks/useCoins';

interface ProfileFormData {
  nickname: string;
  email: string;
}

const schema = yup.object({
  nickname: yup
    .string()
    .required('Nickname is required')
    .min(2, 'Nickname must be at least 2 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
});

export function ProfileScreen(): React.JSX.Element {
  const { palette, brand, status: themeStatus } = useAppTheme();
  const { balance } = useCoins();
  const { data: profile, isLoading, error: profileError, refetch } = useUserProfile();
  const { data: devicePremium } = useDevicePremiumStatus();
  const isDeviceMode = IAP_CONFIG.paymentMode === 'device';

  const effectivePremiumStatus: PremiumStatus = isDeviceMode && devicePremium
    ? (devicePremium.premiumStatus as PremiumStatus)
    : (profile?.premiumStatus ?? PremiumStatus.FREE);
  const updateProfile = useUpdateProfile();
  const logout = useLogout();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (profile) {
      setValue('nickname', profile.nickname);
      setValue('email', profile.email);
    }
  }, [profile, setValue]);

  const onSubmit = (data: ProfileFormData): void => {
    if (!profile) return;

    const updateData: { nickname?: string; email?: string } = {};

    if (data.nickname !== profile.nickname) {
      updateData.nickname = data.nickname;
    }

    if (data.email !== profile.email) {
      updateData.email = data.email;
    }

    if (Object.keys(updateData).length === 0) {
      Alert.alert('No Changes', 'No changes were made to your profile.');
      return;
    }

    updateProfile.mutate(updateData, {
      onSuccess: () => {
        Alert.alert(
          'Profile Updated',
          updateData.email
            ? 'Profile updated successfully. Please verify your new email address.'
            : 'Profile updated successfully.'
        );
      },
      onError: (err) => {
        Alert.alert('Update Failed', err.message || 'Failed to update profile');
      },
    });
  };

  const getPremiumStatusColor = (status: PremiumStatus): string => {
    switch (status) {
      case PremiumStatus.PREMIUM_LIFETIME:
        return themeStatus.success;
      case PremiumStatus.PREMIUM_SUBSCRIPTION:
        return themeStatus.info;
      default:
        return APP_THEME.status.neutral;
    }
  };

  const getPremiumStatusText = (status: PremiumStatus): string => {
    switch (status) {
      case PremiumStatus.PREMIUM_LIFETIME:
        return 'Premium (Lifetime)';
      case PremiumStatus.PREMIUM_SUBSCRIPTION:
        return 'Premium (Subscription)';
      default:
        return 'Free';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brand.primary} />
          <Text style={[styles.loadingText, { color: palette.textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = (): void => {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.replace('/auth/welcome');
      },
      onError: () => {
        router.replace('/auth/welcome');
      },
    });
  };

  if (profileError && !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.errorFullContainer}>
          <Text style={[styles.errorFullText, { color: themeStatus.error }]}>{profileError.message || 'Failed to load profile'}</Text>
          <View style={styles.errorButtons}>
            <Button
              mode="contained"
              onPress={() => refetch()}
              style={[styles.errorButton, { borderRadius: APP_THEME.shape.borderRadius }]}
              buttonColor={brand.primary}
              textColor={palette.onPrimary}
            >
              Retry
            </Button>
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={[styles.errorButton, { borderRadius: APP_THEME.shape.borderRadius, borderColor: palette.borderVariant }]}
              textColor={palette.text}
            >
              Logout
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text variant="headlineMedium" style={[styles.title, { color: palette.text }]}> 
              Profile
            </Text>
            <Pressable
              onPress={() => router.push('/(main)/coins-purchase')}
              accessibilityRole="button"
              accessibilityLabel="Open coins purchase"
              style={[styles.coinBadge, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}
            >
              <Text style={[styles.coinBadgeText, { color: brand.primary }]}>🪙 {balance}</Text>
            </Pressable>
          </View>

          {/* Account Status */}
          {profile && (
            <>
              <Text style={[styles.sectionHeader, { color: palette.textSecondary }]}>
                ACCOUNT STATUS
              </Text>
              <View style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
                <View style={[styles.cardAccent, { backgroundColor: brand.primary }]} />
                <View style={styles.cardInner}>
                  <View style={styles.statusRow}>
                    <Text variant="titleSmall" style={{ color: palette.text }}>Status</Text>
                    <View style={styles.statusChips}>
                      <Chip
                        style={[styles.statusChip, { backgroundColor: profile.isVerified ? themeStatus.success : themeStatus.warning }]}
                        textStyle={styles.chipText}
                        compact
                      >
                        {profile.isVerified ? 'Verified' : 'Unverified'}
                      </Chip>
                      <Chip
                        style={[styles.statusChip, { backgroundColor: getPremiumStatusColor(effectivePremiumStatus) }]}
                        textStyle={styles.chipText}
                        compact
                      >
                        {getPremiumStatusText(effectivePremiumStatus)}
                      </Chip>
                    </View>
                  </View>
                  {IAP_CONFIG.accessMode !== 'unlocked' && (
                    <View style={[styles.premiumSection, { borderTopColor: palette.borderVariant }]}>
                      {effectivePremiumStatus === PremiumStatus.FREE ? (
                        <Button
                          mode="contained"
                          onPress={() => router.push('/(main)/premium')}
                          style={[styles.premiumButton, { borderRadius: APP_THEME.shape.borderRadius }]}
                          contentStyle={styles.buttonContent}
                          buttonColor={brand.primary}
                          textColor={palette.onPrimary}
                          icon="crown"
                        >
                          Upgrade to Premium
                        </Button>
                      ) : (
                        <Button
                          mode="text"
                          onPress={() => router.push('/(main)/premium')}
                          icon="crown"
                          textColor={brand.primary}
                        >
                          Manage Premium
                        </Button>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Error Banner */}
          {updateProfile.error && (
            <View style={[styles.alertContainer, { backgroundColor: palette.errorContainer, borderLeftColor: themeStatus.error }]}>
              <Text style={[styles.alertText, { color: palette.onErrorContainer }]}>{updateProfile.error.message}</Text>
            </View>
          )}

          {/* Personal Information */}
          <Text style={[styles.sectionHeader, { color: palette.textSecondary }]}>
            PERSONAL INFORMATION
          </Text>
          <View style={[styles.formCard, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Nickname"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.nickname}
                    style={[styles.input, { backgroundColor: palette.inputBackground }]}
                    mode="flat"
                    textColor={palette.text}
                    underlineColor="transparent"
                    activeUnderlineColor={brand.primary}
                    theme={{ roundness: APP_THEME.shape.borderRadius }}
                  />
                  {errors.nickname && (
                    <Text style={[styles.fieldError, { color: themeStatus.error }]}>{errors.nickname.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.email}
                    style={[styles.input, { backgroundColor: palette.inputBackground }]}
                    mode="flat"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textColor={palette.text}
                    underlineColor="transparent"
                    activeUnderlineColor={brand.primary}
                    theme={{ roundness: APP_THEME.shape.borderRadius }}
                  />
                  {errors.email && (
                    <Text style={[styles.fieldError, { color: themeStatus.error }]}>{errors.email.message}</Text>
                  )}
                </View>
              )}
            />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={updateProfile.isPending}
              disabled={updateProfile.isPending || !isDirty}
              style={[styles.updateButton, { borderRadius: APP_THEME.shape.borderRadius }]}
              contentStyle={styles.buttonContent}
              buttonColor={brand.primary}
              textColor={palette.onPrimary}
              labelStyle={styles.buttonLabel}
            >
              Update Profile
            </Button>
          </View>

          {/* Account Information */}
          {profile && (
            <>
              <Text style={[styles.sectionHeader, { color: palette.textSecondary }]}>
                ACCOUNT INFORMATION
              </Text>
              <View style={[styles.infoCard, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
                <View style={[styles.infoRow, { borderBottomColor: palette.borderVariant }]}>
                  <Text variant="bodyMedium" style={[styles.infoLabel, { color: palette.textSecondary }]}>Member since</Text>
                  <Text variant="bodyMedium" style={{ color: palette.text }}>{new Date(profile.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomColor: palette.borderVariant }]}>
                  <Text variant="bodyMedium" style={[styles.infoLabel, { color: palette.textSecondary }]}>Last updated</Text>
                  <Text variant="bodyMedium" style={{ color: palette.text }}>{new Date(profile.updatedAt).toLocaleDateString()}</Text>
                </View>
                {profile.premiumExpiry && (
                  <View style={styles.infoRowLast}>
                    <Text variant="bodyMedium" style={[styles.infoLabel, { color: palette.textSecondary }]}>Premium expires</Text>
                    <Text variant="bodyMedium" style={{ color: palette.text }}>{new Date(profile.premiumExpiry).toLocaleDateString()}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorFullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorFullText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 15,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  errorButton: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    marginBottom: 0,
  },
  coinBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  coinBadgeText: {
    fontWeight: '700',
    fontSize: 13,
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
    flexDirection: 'row',
    borderRadius: APP_THEME.shape.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardAccent: {
    width: 4,
  },
  cardInner: {
    flex: 1,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChips: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  premiumSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  premiumButton: {},
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
  formCard: {
    borderRadius: APP_THEME.shape.borderRadius,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
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
  updateButton: {
    width: '100%',
    marginTop: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: APP_THEME.shape.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  infoRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  infoLabel: {
    fontWeight: '500',
  },
});
