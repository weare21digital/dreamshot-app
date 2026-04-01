import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useAdManager } from '../hooks';
import { AdType } from '../types';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { SPACING } from '../../../utils/constants';

interface BannerAdProps {
  style?: any;
  onAdLoaded?: () => void;
  onAdError?: (error: string) => void;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  style,
  onAdLoaded,
  onAdError,
}) => {
  const { isLoading, adConfig, error, shouldShow, trackImpression, trackClick } = useAdManager(AdType.BANNER);
  const { palette, brand } = useAppTheme();

  useEffect(() => {
    if (adConfig && shouldShow) {
      trackImpression();
      onAdLoaded?.();
    } else if (error) {
      onAdError?.(error);
    }
  }, [adConfig, shouldShow, error]);

  const handleAdPress = () => {
    if (adConfig) {
      trackClick();
      console.log('Banner ad clicked:', adConfig.adNetworkId);
    }
  };

  // Don't render anything if user shouldn't see ads or there's no ad
  if (!shouldShow || !adConfig) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: palette.surface, borderColor: palette.textSecondary + '30' }, style]}>
        <ActivityIndicator size="small" color={brand.primary} />
        <Text style={[styles.loadingText, { color: palette.textSecondary }]}>Loading ad...</Text>
      </View>
    );
  }

  if (error) {
    return null; // Silently fail for better user experience
  }

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={[styles.adContainer, { backgroundColor: palette.surface, borderColor: palette.textSecondary + '30' }]}
        onPress={handleAdPress}
        android_ripple={{ color: brand.primary + '20' }}
      >
        <View style={styles.adContent}>
          <Text style={[styles.adLabel, { color: palette.textSecondary }]}>Advertisement</Text>
          <Text style={[styles.adText, { color: palette.text }]}>
            Sample Banner Ad - Network: {adConfig.adNetworkId}
          </Text>
          <Text style={[styles.adSubtext, { color: palette.textSecondary }]}>
            Tap to learn more
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
  },
  adContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  adContent: {
    padding: SPACING.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  adLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  adText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  adSubtext: {
    fontSize: 12,
  },
});
