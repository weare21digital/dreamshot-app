import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useQueryClient } from '@tanstack/react-query';
import { useAppleLogin } from './useAuth';
import { APP_CONFIG } from '../config/app';
import { tokenService } from '../services/tokenService';

export function useAppleSignIn() {
  const queryClient = useQueryClient();
  const appleLogin = useAppleLogin();
  const [isReady] = useState(Platform.OS === 'ios');

  const signIn = useCallback(async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (APP_CONFIG.authMode === 'device') {
        // Device mode: store user info locally from Apple credentials
        const fullName = credential.fullName
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : '';

        await tokenService.storeUser({
          id: credential.user, // Apple's stable user ID
          email: credential.email || '',
          nickname: fullName || credential.email?.split('@')[0] || 'User',
          isVerified: true,
          premiumStatus: 'FREE',
        });

        console.log('🔐 [Auth] Apple sign-in (device mode): stored user locally');
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } else {
        // Backend mode: send identityToken to backend
        if (!credential.identityToken) {
          throw { code: 'APPLE_SIGN_IN_ERROR', message: 'No identity token received' };
        }

        const fullName = credential.fullName
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : undefined;

        await appleLogin.mutateAsync({ identityToken: credential.identityToken, fullName });
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        throw { code: 'SIGN_IN_CANCELLED', message: 'User cancelled' };
      }
      throw { code: 'APPLE_SIGN_IN_ERROR', message: error.message || 'Apple Sign-In failed' };
    }
  }, [appleLogin, queryClient]);

  return { signIn, isReady, isLoading: appleLogin.isPending };
}
