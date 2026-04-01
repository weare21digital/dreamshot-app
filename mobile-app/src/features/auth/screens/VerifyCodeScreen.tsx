import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useVerifyCode } from '../../../hooks';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';

interface VerifyCodeForm {
  code: string;
}

const schema = yup.object({
  code: yup
    .string()
    .required('Code is required')
    .matches(/^[A-Z0-9]{6}$/, 'Enter the 6-character code'),
});

export function VerifyCodeScreen(): React.JSX.Element {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { palette, brand } = useAppTheme();
  const verifyCode = useVerifyCode();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeForm>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = (data: VerifyCodeForm): void => {
    setSubmitError(null);

    if (!email) {
      setSubmitError('Missing email. Please start again.');
      return;
    }

    verifyCode.mutate(
      { email, code: data.code },
      {
        onSuccess: () => {
          router.replace('/');
        },
        onError: (error) => {
          setSubmitError(error.message || 'Invalid code. Please try again.');
        },
      }
    );
  };

  const handleChangeEmail = (): void => {
    router.replace('/auth/welcome');
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
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
              <Text style={[styles.iconText, { color: brand.primary }]}>✉</Text>
            </View>

            <Text variant="headlineMedium" style={[styles.title, { color: palette.text }]}>
              Enter Your Code
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: palette.textSecondary }]}>
              We sent a 6-character code to{'\n'}
              <Text style={{ color: palette.text, fontWeight: '600' }}>{email || 'your email'}</Text>
            </Text>

            {submitError ? (
              <View style={[styles.errorContainer, { backgroundColor: palette.errorContainer, borderLeftColor: APP_THEME.status.error }]}>
                <Text style={[styles.errorText, { color: palette.onErrorContainer }]}>{submitError}</Text>
              </View>
            ) : null}

            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Login Code"
                    value={value}
                    onChangeText={(text) => onChange(text.toUpperCase())}
                    onBlur={onBlur}
                    error={!!errors.code}
                    style={[styles.input, { backgroundColor: palette.inputBackground }]}
                    mode="flat"
                    autoCapitalize="characters"
                    keyboardType="default"
                    textColor={palette.text}
                    maxLength={6}
                    underlineColor="transparent"
                    activeUnderlineColor={brand.primary}
                    theme={{ roundness: APP_THEME.shape.borderRadius }}
                  />
                  <HelperText type="error" visible={!!errors.code}>
                    {errors.code?.message}
                  </HelperText>
                </View>
              )}
            />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={verifyCode.isPending}
              disabled={verifyCode.isPending}
              style={[styles.submitButton, { borderRadius: APP_THEME.shape.borderRadius }]}
              contentStyle={styles.buttonContent}
              buttonColor={brand.primary}
              textColor={palette.onPrimary}
              labelStyle={styles.buttonLabel}
            >
              Verify
            </Button>

            <Button
              mode="text"
              onPress={handleChangeEmail}
              style={styles.changeEmailButton}
              textColor={palette.textSecondary}
            >
              Change email
            </Button>
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
    paddingHorizontal: 28,
    paddingTop: 80,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 32,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 4,
  },
  input: {
    borderRadius: APP_THEME.shape.borderRadius,
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 8,
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
  changeEmailButton: {
    marginTop: 16,
  },
  errorContainer: {
    padding: 14,
    borderRadius: APP_THEME.shape.borderRadius,
    marginBottom: 16,
    borderLeftWidth: 4,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
