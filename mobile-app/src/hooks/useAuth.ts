import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { tokenService } from '../services/tokenService';
import { APP_CONFIG } from '../config/app';
import { User } from '../types';

// Auth state types
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

// Request/Response types
export interface EmailLoginRequest {
  email: string;
}

export interface EmailLoginResponse {
  isNewUser: boolean;
  codeSent?: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Hook to check authentication state.
 * In device mode: checks if user data exists locally.
 * In backend mode: checks if access token exists.
 */
export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      if (APP_CONFIG.authMode === 'device') {
        // Device mode: user data in AsyncStorage = authenticated
        const user = await tokenService.getUser();
        setIsAuthenticated(!!user);
      } else {
        const authenticated = await tokenService.isAuthenticated();
        setIsAuthenticated(authenticated);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
  };
}

/**
 * Hook to start email-only login (magic link).
 * Only works in backend mode — email login requires a server to send codes.
 */
export function useEmailLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EmailLoginRequest) => {
      if (APP_CONFIG.authMode === 'device') {
        throw new Error('Email login is not available in device auth mode');
      }

      const result = await apiClient.post<EmailLoginResponse>('/auth/email-login', data);
      const authData = result as unknown as EmailLoginResponse;

      if (authData.tokens) {
        await tokenService.storeTokens({
          accessToken: authData.tokens.accessToken,
          refreshToken: authData.tokens.refreshToken,
        });
      }

      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Hook to verify email login code.
 * Only works in backend mode.
 */
export function useVerifyCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VerifyCodeRequest) => {
      if (APP_CONFIG.authMode === 'device') {
        throw new Error('Email verification is not available in device auth mode');
      }

      const result = await apiClient.post<VerifyCodeResponse>('/auth/verify-code', data);
      const authData = result as unknown as VerifyCodeResponse;

      await tokenService.storeTokens({
        accessToken: authData.tokens.accessToken,
        refreshToken: authData.tokens.refreshToken,
      });

      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Hook to login with Google.
 * In device mode: stores user info locally from Google response.
 * In backend mode: sends idToken to backend for verification.
 */
export function useGoogleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idToken: string) => {
      if (APP_CONFIG.authMode === 'device') {
        // Device mode: we don't use the idToken for backend auth.
        // The actual user info storage happens in useGoogleAuth.ts.
        // This mutation is effectively a no-op in device mode.
        return { user: await tokenService.getUser(), tokens: null } as any;
      }

      const result = await apiClient.post<AuthResponse>('/auth/google', { idToken });
      const authData = result as unknown as AuthResponse;

      await tokenService.storeTokens({
        accessToken: authData.tokens.accessToken,
        refreshToken: authData.tokens.refreshToken,
      });
      await tokenService.storeUser(authData.user);

      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Hook to login with Apple.
 * In device mode: stores user info locally from Apple credentials.
 * In backend mode: sends identityToken to backend for verification.
 */
export function useAppleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identityToken, fullName }: { identityToken: string; fullName?: string }) => {
      if (APP_CONFIG.authMode === 'device') {
        // Device mode: user info storage happens in useAppleAuth.ts.
        return { user: await tokenService.getUser(), tokens: null } as any;
      }

      const result = await apiClient.post<AuthResponse>('/auth/apple', { identityToken, fullName });
      const authData = result as unknown as AuthResponse;

      await tokenService.storeTokens({
        accessToken: authData.tokens.accessToken,
        refreshToken: authData.tokens.refreshToken,
      });
      await tokenService.storeUser(authData.user);

      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Hook to refresh access token.
 * No-op in device mode (no JWT tokens to refresh).
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      if (APP_CONFIG.authMode === 'device') {
        return { accessToken: 'device-mode' };
      }

      const refreshToken = await tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const result = await apiClient.post<{ accessToken: string }>('/auth/refresh-token', {
        refreshToken,
      });
      const data = result as unknown as { accessToken: string };

      await tokenService.storeTokens({
        accessToken: data.accessToken,
        refreshToken,
      });

      return data;
    },
  });
}

/**
 * Hook to logout.
 * In device mode: just clears local storage.
 * In backend mode: calls logout API then clears local storage.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (APP_CONFIG.authMode === 'backend') {
        const refreshToken = await tokenService.getRefreshToken();
        if (refreshToken) {
          try {
            await apiClient.post('/auth/logout', { refreshToken });
          } catch {
            // Ignore logout API errors — we're clearing locally anyway
          }
        }
      }
      await tokenService.clearAuth();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
