import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// TODO: Re-enable when ad system is connected to a real ad backend
// import { BannerAd } from '../../ads';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';
import { useEmailLogin } from '../../../hooks';
import { APP_CONFIG } from '../../../config/app';
import GoogleSignInButton from '../../../components/GoogleSignInButton';
import AppleSignInButton from '../../../components/AppleSignInButton';

const isDeviceAuth = APP_CONFIG.authMode === 'device';

interface EmailLoginForm {
  email: string;
}

const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
});

export function WelcomeScreen(): React.JSX.Element {
  const { palette, brand } = useAppTheme();
  const emailLogin = useEmailLogin();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailLoginForm>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = (data: EmailLoginForm): void => {
    setSubmitError(null);
    setStatusMessage(null);

    emailLogin.mutate(
      { email: data.email },
      {
        onSuccess: (result) => {
          if (result.isNewUser) {
            router.replace('/');
            return;
          }

          if (result.codeSent) {
            setStatusMessage('We sent a 6-character code to your email.');
            router.push({
              pathname: '/auth/verify-code',
              params: { email: data.email },
            });
            return;
          }

          setSubmitError('Unable to start login. Please try again.');
        },
        onError: (error) => {
          setSubmitError(error.message || 'Login failed. Please try again.');
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View
                style={[
                  styles.logoPlaceholder,
                  {
                    backgroundColor: palette.cardBackground,
                    borderColor: palette.borderVariant,
                  },
                ]}
              >
                <Text style={[styles.logoIcon, { color: brand.primary }]}>✦</Text>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text variant="headlineLarge" style={[styles.title, { color: palette.text }]}>
                Welcome Back
              </Text>
              <Text variant="bodyLarge" style={[styles.subtitle, { color: palette.textSecondary }]}>
                {isDeviceAuth ? 'Sign in to get started' : 'Enter your email to get a 6-character login code'}
              </Text>
            </View>

            {!isDeviceAuth && (
              <>
                {/* Error */}
                {submitError ? (
                  <View style={[styles.alertContainer, { backgroundColor: palette.errorContainer, borderLeftColor: APP_THEME.status.error }]}>
                    <Text style={[styles.alertText, { color: palette.onErrorContainer }]}>{submitError}</Text>
                  </View>
                ) : null}

                {/* Status */}
                {statusMessage ? (
                  <View style={[styles.alertContainer, { backgroundColor: palette.infoContainer, borderLeftColor: APP_THEME.status.info }]}>
                    <Text style={[styles.alertText, { color: palette.onInfoContainer }]}>{statusMessage}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
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
                      <HelperText type="error" visible={!!errors.email}>
                        {errors.email?.message}
                      </HelperText>
                    </View>
                  )}
                />

                {/* Continue Button */}
                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  loading={emailLogin.isPending}
                  disabled={emailLogin.isPending}
                  style={[styles.submitButton, { borderRadius: APP_THEME.shape.borderRadius }]}
                  contentStyle={styles.buttonContent}
                  buttonColor={brand.primary}
                  textColor={palette.onPrimary}
                  labelStyle={styles.buttonLabel}
                >
                  Continue
                </Button>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={[styles.dividerLine, { backgroundColor: palette.borderVariant }]} />
                  <Text style={[styles.dividerText, { color: palette.textSecondary }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: palette.borderVariant }]} />
                </View>
              </>
            )}

            {/* Social Buttons */}
            <GoogleSignInButton
              mode="outlined"
              style={[styles.socialButton, { borderRadius: APP_THEME.shape.borderRadius, backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}
            />

            <AppleSignInButton
              style={[styles.socialButton, { borderRadius: APP_THEME.shape.borderRadius, backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}
            />

            {__DEV__ && (
              <Button
                mode="contained-tonal"
                onPress={() => router.push('/(main)/features')}
                icon="flask-outline"
                style={[styles.playgroundButton, { borderRadius: APP_THEME.shape.borderRadius, backgroundColor: `${brand.primary}22` }]}
                textColor={brand.primary}
              >
                Open Feature Playground
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 48,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  logoIcon: {
    fontSize: 36,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    borderRadius: APP_THEME.shape.borderRadius,
  },
  submitButton: {
    width: '100%',
    marginTop: 4,
  },
  buttonContent: {
    paddingVertical: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialButton: {
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
  },
  playgroundButton: {
    width: '100%',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.35)',
  },
  alertContainer: {
    padding: 14,
    borderRadius: APP_THEME.shape.borderRadius,
    marginBottom: 16,
    borderLeftWidth: 4,
    width: '100%',
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
