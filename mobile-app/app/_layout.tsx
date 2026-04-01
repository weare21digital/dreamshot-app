import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';
import { initializeDeepLinking } from '../src/utils/deepLinking';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { securityService } from '../src/services/securityService';

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    const initializeServices = async (): Promise<void> => {
      try {
        initializeDeepLinking();
        await securityService.initialize();
      } catch (error) {
        console.error('[App] Failed to initialize services:', error);
      }
    };
    initializeServices();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ animation: 'none', gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(main)" />
          </Stack>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
