import React from 'react';
import { Stack } from 'expo-router';
import { useAppTheme } from '../../src/contexts/ThemeContext';

export default function AuthLayout(): React.JSX.Element {
  const { theme } = useAppTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.surface,
    },
    headerTintColor: theme.colors.onSurface,
    headerTitleStyle: {
      color: theme.colors.onSurface,
    },
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
  };

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen 
        name="welcome" 
        options={{ 
          headerShown: false,
          animation: 'none',
          gestureEnabled: false
        }} 
      />
      <Stack.Screen name="verify-code" options={{ title: 'Enter Code' }} />
    </Stack>
  );
}
