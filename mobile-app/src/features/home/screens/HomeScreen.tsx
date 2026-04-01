import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BannerAd, InterstitialAd, useInterstitialAd } from '../../ads';
import { useAuth } from '../../../hooks/useAuth';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';

export function HomeScreen(): React.JSX.Element {
  const { palette, brand } = useAppTheme();
  const interstitialAd = useInterstitialAd();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/welcome');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = async (): Promise<void> => {
    try {
      const { tokenService } = await import('../../../services/tokenService');
      await tokenService.clearAuth();
      await checkAuth();
    } catch (error) {
      console.error('Logout error:', error);
      await checkAuth();
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brand.primary} />
          <Text style={[styles.loadingText, { color: palette.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: palette.text }]}>
            Dashboard
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: palette.textSecondary }]}>
            Welcome back!
          </Text>
        </View>

        {/* Quick Actions Section */}
        <Text style={[styles.sectionHeader, { color: palette.textSecondary }]}>
          QUICK ACTIONS
        </Text>

        <View style={styles.cardGrid}>
          {/* Profile Card */}
          <View
            style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}
          >
            <View style={[styles.cardAccent, { backgroundColor: brand.primary }]} />
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>My Profile</Text>
              <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
                View and edit your profile
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/(main)/profile')}
                style={[styles.cardButton, { borderRadius: APP_THEME.shape.borderRadiusSmall }]}
                contentStyle={styles.cardButtonContent}
                buttonColor={brand.primary}
                textColor={palette.onPrimary}
                labelStyle={styles.cardButtonLabel}
                compact
              >
                Open
              </Button>
            </View>
          </View>

          {/* Settings Card */}
          <View
            style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}
          >
            <View style={[styles.cardAccent, { backgroundColor: brand.primary }]} />
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>Settings</Text>
              <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>
                App preferences & security
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/(main)/settings')}
                style={[styles.cardButton, { borderRadius: APP_THEME.shape.borderRadiusSmall }]}
                contentStyle={styles.cardButtonContent}
                buttonColor={brand.primary}
                textColor={palette.onPrimary}
                labelStyle={styles.cardButtonLabel}
                compact
              >
                Open
              </Button>
            </View>
          </View>
        </View>

        {/* More Section */}
        <Text style={[styles.sectionHeader, { color: palette.textSecondary }]}>
          MORE
        </Text>

        <Button
          mode="outlined"
          onPress={interstitialAd.showAd}
          loading={interstitialAd.isLoading}
          disabled={interstitialAd.isLoading}
          style={[styles.fullButton, { borderColor: palette.borderVariant, borderRadius: APP_THEME.shape.borderRadius }]}
          textColor={palette.text}
        >
          Show Interstitial Ad
        </Button>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.fullButton, { borderColor: palette.borderVariant, borderRadius: APP_THEME.shape.borderRadius }]}
          textColor={APP_THEME.status.error}
        >
          Logout
        </Button>

        {__DEV__ && (
          <Button
            mode="contained-tonal"
            onPress={() => router.push('/(main)/features')}
            icon="flask-outline"
            style={[styles.playgroundButton, { borderRadius: APP_THEME.shape.borderRadius, backgroundColor: `${brand.primary}22` }]}
            textColor={brand.primary}
          >
            Open Feature Playground
          </Button>
        )}
      </View>

      <BannerAd
        style={styles.bannerAd}
        onAdLoaded={() => console.log('Banner ad loaded')}
        onAdError={(error) => console.log('Banner ad error:', error)}
      />

      <InterstitialAd
        visible={interstitialAd.isVisible}
        onClose={interstitialAd.hideAd}
        onAdLoaded={interstitialAd.onAdLoaded}
        onAdError={interstitialAd.onAdError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 22,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },
  cardGrid: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    borderRadius: APP_THEME.shape.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  cardButton: {
    alignSelf: 'flex-start',
  },
  cardButtonContent: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  cardButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fullButton: {
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
  },
  playgroundButton: {
    width: '100%',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.35)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  bannerAd: {
    marginBottom: 16,
  },
});
