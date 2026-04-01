import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useGoogleLogin } from './useAuth';
import { APP_CONFIG } from '../config/app';
import { tokenService } from '../services/tokenService';

export interface GoogleSignInError {
  code: string;
  message: string;
}

// Configure once at module level
let configured = false;

function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    // webClientId is needed on BOTH platforms to get idToken for backend auth.
    // In device mode, webClientId is optional but iosClientId is still needed for the native SDK.
    ...(APP_CONFIG.authMode === 'backend' && {
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    }),
    ...(Platform.OS === 'ios' && {
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    }),
    scopes: ['email', 'profile'],
    offlineAccess: APP_CONFIG.authMode === 'backend',
  });
  configured = true;
}

/**
 * Hook to handle Google Sign-In using native @react-native-google-signin.
 * In device mode: stores user info locally, no backend call.
 * In backend mode: sends idToken to backend for verification.
 */
export function useGoogleSignIn() {
  const queryClient = useQueryClient();
  const googleLogin = useGoogleLogin();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ensureConfigured();
    setIsReady(true);
  }, []);

  const signIn = useCallback(async () => {
    if (!isReady) {
      const error: GoogleSignInError = {
        code: 'NOT_READY',
        message: 'Google Sign-In is not ready yet',
      };
      throw error;
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      if (APP_CONFIG.authMode === 'device') {
        // Device mode: store user info locally from Google response
        const userInfo = response.data?.user;
        if (!userInfo) {
          throw {
            code: 'GOOGLE_SIGN_IN_ERROR',
            message: 'No user info received from Google Sign-In',
          } as GoogleSignInError;
        }

        await tokenService.storeUser({
          id: userInfo.id,
          email: userInfo.email,
          nickname: userInfo.name || userInfo.email.split('@')[0],
          isVerified: true,
          premiumStatus: 'FREE',
        });

        console.log('🔐 [Auth] Google sign-in (device mode): stored user locally');
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } else {
        // Backend mode: send idToken to backend
        const idToken = response.data?.idToken;
        if (!idToken) {
          throw {
            code: 'GOOGLE_SIGN_IN_ERROR',
            message: 'No ID token received from Google Sign-In',
          } as GoogleSignInError;
        }

        console.log('Got ID token, authenticating with backend...');
        await googleLogin.mutateAsync(idToken);
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error
      ) {
        if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
          throw {
            code: 'SIGN_IN_CANCELLED',
            message: 'User cancelled the sign-in process',
          } as GoogleSignInError;
        }
        throw error;
      }

      throw {
        code: 'GOOGLE_SIGN_IN_ERROR',
        message: (error as Error).message || 'An error occurred during Google Sign-In',
      } as GoogleSignInError;
    }
  }, [isReady, googleLogin, queryClient]);

  return {
    signIn,
    isReady,
    isLoading: googleLogin.isPending,
    error: googleLogin.error,
  };
}
