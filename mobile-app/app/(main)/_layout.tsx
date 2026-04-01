import React from 'react';
import { Stack } from 'expo-router';
import { useAppTheme } from '../../src/contexts/ThemeContext';

export default function MainLayout(): React.JSX.Element {
  const { palette } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerTitleStyle: { color: palette.text, fontFamily: 'serif', fontWeight: '700' },
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen name="style-detail" options={{ headerShown: false }} />
      <Stack.Screen name="photo-picker" options={{ headerShown: false }} />
      <Stack.Screen name="generation-progress" options={{ headerShown: false }} />
      <Stack.Screen name="result" options={{ headerShown: false }} />
    </Stack>
  );
}
