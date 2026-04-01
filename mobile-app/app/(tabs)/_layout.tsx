import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../src/contexts/ThemeContext';

export default function TabsLayout(): React.JSX.Element {
  const { palette } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.text,
        tabBarInactiveTintColor: palette.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(15, 25, 48, 0.78)',
          borderTopColor: 'rgba(83, 221, 252, 0.2)',
          borderTopWidth: 1,
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: 24,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Styles',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="photo-library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-gallery"
        options={{
          title: 'My Gallery',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coins"
        options={{
          title: 'Coins',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="monetization-on" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
