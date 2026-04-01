import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { APP_THEME } from '../src/config/theme';

const ONBOARDING_FLAG_KEY = 'dreamshot_onboarding_complete';

export default function Index(): React.JSX.Element {
  const [target, setTarget] = useState<'/(onboarding)' | '/(main)/style-detail' | null>(null);

  useEffect(() => {
    let mounted = true;

    const resolveInitialRoute = async (): Promise<void> => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_FLAG_KEY);
        if (!mounted) {
          return;
        }
        setTarget(completed === '1' ? '/(main)/style-detail' : '/(onboarding)');
      } catch (error) {
        console.error('[Index] Failed to read onboarding flag:', error);
        if (mounted) {
          setTarget('/(onboarding)');
        }
      }
    };

    void resolveInitialRoute();

    return () => {
      mounted = false;
    };
  }, []);

  if (!target) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_THEME.brand.primary} />
      </View>
    );
  }

  return <Redirect href={target} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: APP_THEME.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
