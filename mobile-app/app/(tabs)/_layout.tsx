import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../../src/contexts/ThemeContext';

export default function TabsLayout(): React.JSX.Element {
  const { palette } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#53DDFC',
        tabBarInactiveTintColor: '#64748b',
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(9,19,40,0.6)' }]} />
          </View>
        ),
        tabBarStyle: {
          position: 'absolute',
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          marginHorizontal: 12,
          marginBottom: 10,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
          overflow: 'hidden',
          shadowColor: '#9C48EA',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          backgroundColor: 'transparent',
        },
        tabBarItemStyle: {
          borderRadius: 999,
          marginHorizontal: 3,
          marginVertical: 4,
        },
        tabBarActiveBackgroundColor: palette.surfaceContainerHigh,
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
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coins"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="smart-button" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-gallery"
        options={{
          title: 'Styles',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="grid-view" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
