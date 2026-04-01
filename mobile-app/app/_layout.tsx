import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';
import { initializeDeepLinking } from '../src/utils/deepLinking';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { securityService } from '../src/services/securityService';
import { Text } from 'react-native';

export default function RootLayout(): React.JSX.Element {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    const initializeServices = async (): Promise<void> => {
      try {
        initializeDeepLinking();
        await securityService.initialize();
        const defaultProps = (Text as unknown as { defaultProps?: { style?: object } }).defaultProps || {};
        (Text as unknown as { defaultProps?: { style?: object } }).defaultProps = {
          ...defaultProps,
          style: [defaultProps.style, { fontFamily: 'Inter_400Regular' }],
        };
      } catch (error) {
        console.error('[App] Failed to initialize services:', error);
      }
    };
    initializeServices();
  }, []);

  if (!fontsLoaded) return <></>;

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
