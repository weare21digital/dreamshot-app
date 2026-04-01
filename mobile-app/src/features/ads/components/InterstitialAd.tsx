import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useAdManager } from '../hooks';
import { AdType } from '../types';
import { SPACING } from '../../../utils/constants';
import { APP_THEME } from '../../../config/theme';

/**
 * Interstitial ad colors — always uses dark palette since this is
 * a fullscreen dark modal regardless of the app's current theme.
 */
const AD_COLORS = {
  background: APP_THEME.dark.text,       // black
  surface: APP_THEME.dark.surface,        // dark surface for close button
  text: APP_THEME.dark.onPrimary,         // white text on dark bg
  textSecondary: APP_THEME.dark.textSecondary,
  primary: APP_THEME.brand.primary,
} as const;

interface InterstitialAdProps {
  visible: boolean;
  onClose: () => void;
  onAdLoaded?: () => void;
  onAdError?: (error: string) => void;
}

export const InterstitialAd: React.FC<InterstitialAdProps> = ({
  visible,
  onClose,
  onAdLoaded,
  onAdError,
}) => {
  const { isLoading, adConfig, error, shouldShow, trackImpression, trackClick, trackClose } = useAdManager(AdType.INTERSTITIAL);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  useEffect(() => {
    const setNavBar = async () => {
      await NavigationBar.setBackgroundColorAsync('#000000');
      await NavigationBar.setButtonStyleAsync('light');
    };

    setNavBar();

    return () => {
      NavigationBar.setBackgroundColorAsync('#ffffff');
      NavigationBar.setButtonStyleAsync('dark');
    };
  }, []);

  // Track impression once when ad is ready
  useEffect(() => {
    if (adConfig && shouldShow && visible && !hasTrackedImpression) {
      trackImpression();
      setHasTrackedImpression(true);
      onAdLoaded?.();
    } else if (error && visible) {
      console.log('InterstitialAd: Ad loading failed:', error);
      onAdError?.(error);
      onClose();
    } else if (!shouldShow && !isLoading && visible) {
      console.log('InterstitialAd: User should not see ads (premium user)');
      onClose();
    }
  }, [adConfig, shouldShow, visible, error, isLoading, hasTrackedImpression]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setShowCloseButton(false);
      setVideoProgress(0);
      setHasTrackedImpression(false);
    }
  }, [visible]);

  // Video progress timer
  useEffect(() => {
    if (adConfig && shouldShow && visible) {
      const duration = 5000;
      const interval = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += interval;
        const progress = Math.min(elapsed / duration, 1);
        setVideoProgress(progress);

        if (progress >= 1) {
          setShowCloseButton(true);
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [adConfig, shouldShow, visible]);

  const handleClose = () => {
    if (adConfig) {
      trackClose();
    }
    onClose();
  };

  const handleAdPress = () => {
    if (adConfig) {
      trackClick();
      console.log('Interstitial ad clicked:', adConfig.adNetworkId);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={showCloseButton ? handleClose : undefined}
    >
      {/* Black status bar for fullscreen experience */}
      <StatusBar style="light" backgroundColor={AD_COLORS.background} translucent={true} />
      <View style={styles.container}>
        {/* Always reserve space for close button to prevent layout shift */}
        <View style={styles.closeButtonPlaceholder} />

        <View style={styles.contentArea}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AD_COLORS.primary} />
              <Text style={styles.loadingText}>Loading advertisement...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load advertisement</Text>
            </View>
          ) : adConfig && shouldShow ? (
            <View style={styles.adContainer}>
              {/* Video placeholder */}
              <Pressable style={styles.videoContainer} onPress={handleAdPress}>
                <View style={styles.videoPlaceholder}>
                  <Text style={styles.videoText}>🎥</Text>
                  <Text style={styles.videoTitle}>Sample Video Advertisement</Text>
                  <Text style={styles.videoSubtitle}>
                    Network: {adConfig.adNetworkId}
                  </Text>
                  <Text style={styles.tapToLearnMore}>Tap to learn more</Text>
                </View>
              </Pressable>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${videoProgress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(videoProgress * 100)}%
                </Text>
              </View>

              {/* Ad info */}
              <View style={styles.adInfo}>
                <Text style={styles.adLabel}>Advertisement</Text>
                {/* Always reserve space for wait text to prevent layout shift */}
                <View style={styles.waitTextContainer}>
                  {!showCloseButton ? (
                    <Text style={styles.adWaitText}>
                      Please wait {Math.ceil((1 - videoProgress) * 5)} seconds...
                    </Text>
                  ) : (
                    <Text style={styles.adWaitTextPlaceholder}> </Text>
                  )}
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {/* Close button - positioned absolutely outside SafeAreaView */}
        {showCloseButton && (
          <Pressable
            style={styles.closeButtonAbsolute}
            onPress={handleClose}
            android_ripple={{ color: AD_COLORS.surface }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AD_COLORS.background,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  closeButtonPlaceholder: {
    height: 100,
    backgroundColor: 'transparent',
  },
  contentArea: {
    flex: 1,
  },
  closeButtonAbsolute: {
    position: 'absolute',
    top: 60,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AD_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AD_COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AD_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AD_COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: AD_COLORS.text,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AD_COLORS.background,
    padding: SPACING.lg,
  },
  errorText: {
    color: AD_COLORS.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: AD_COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: AD_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  adContainer: {
    flex: 1,
    backgroundColor: AD_COLORS.background,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  videoText: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  videoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AD_COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  videoSubtitle: {
    fontSize: 16,
    color: AD_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  tapToLearnMore: {
    fontSize: 14,
    color: AD_COLORS.primary,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: AD_COLORS.textSecondary,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: AD_COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    color: AD_COLORS.text,
    fontSize: 12,
    minWidth: 35,
    textAlign: 'right',
  },
  adInfo: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  adLabel: {
    fontSize: 12,
    color: AD_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  waitTextContainer: {
    minHeight: 20,
    justifyContent: 'center',
  },
  adWaitText: {
    fontSize: 14,
    color: AD_COLORS.text,
    textAlign: 'center',
  },
  adWaitTextPlaceholder: {
    fontSize: 14,
    color: 'transparent',
    textAlign: 'center',
  },
});
