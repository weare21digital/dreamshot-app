import React, { useState } from 'react';
import { StyleSheet, Alert, Platform, ViewStyle, StyleProp } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useAppleSignIn } from '../hooks/useAppleAuth';

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: StyleProp<ViewStyle>;
}

export default function AppleSignInButton({
  onSuccess,
  onError,
  style,
}: AppleSignInButtonProps): React.JSX.Element | null {
  if (Platform.OS !== 'ios') return null;

  const { signIn, isReady, isLoading } = useAppleSignIn();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const isDisabled = !isReady || isLoading || isSigningIn;

  const handleAppleSignIn = async (): Promise<void> => {
    if (isDisabled) {
      return;
    }

    setIsSigningIn(true);
    try {
      await signIn();
      onSuccess?.();
      router.replace('/');
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Sign-in Error', error.message || 'Apple sign-in failed');
      }
      onError?.(error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={[styles.button, style, isDisabled ? styles.buttonDisabled : null]}
      onPress={handleAppleSignIn}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    marginVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
