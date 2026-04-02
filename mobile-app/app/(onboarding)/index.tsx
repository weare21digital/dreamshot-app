import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { APP_THEME } from '../../src/config/theme';

const ONBOARDING_FLAG_KEY = 'dreamshot_onboarding_complete';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingCard = {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  style: string;
  colors: [string, string];
  flowText?: string;
};

const ONBOARDING_CARDS: OnboardingCard[] = [
  {
    id: 'hero',
    title: 'Imagine Anything',
    subtitle: 'Describe your idea and turn any selfie into AI-generated art in seconds.',
    prompt: 'Cyberpunk portrait with neon rain reflections',
    style: 'Neon Synth',
    colors: ['#8F5CFF', '#35D9FF'],
  },
  {
    id: 'flow',
    title: 'Choose Your Style',
    subtitle: 'Try cinematic, anime, neon, or fantasy looks tailored to your prompt.',
    prompt: 'Anime hero close-up with glowing energy aura',
    style: 'Anime Pulse',
    colors: ['#A34DFF', '#5FE3C6'],
    flowText: 'Upload  →  Pick a style  →  Generate',
  },
  {
    id: 'gallery',
    title: 'Create in Seconds',
    subtitle: 'Generate, save, and share polished visuals in just a few taps.',
    prompt: 'Cinematic city rooftop portrait at blue hour',
    style: 'Cine Glow',
    colors: ['#7E59FF', '#3BB8FF'],
  },
];

const GALLERY_IMAGES: Array<{ prompt: string; colors: [string, string] }> = [
  { prompt: 'Futuristic athlete with holographic trails', colors: ['#9C48EA', '#53DDFC'] },
  { prompt: 'Fantasy forest mage with bioluminescent particles', colors: ['#B05CFF', '#4CE0D1'] },
  { prompt: 'Retro film-noir portrait with dramatic rim light', colors: ['#8458FF', '#53B8FF'] },
  { prompt: 'Surreal desert traveler with floating geometry', colors: ['#9A52FF', '#59D8FF'] },
];

const navigateToMain = async (): Promise<void> => {
  await AsyncStorage.setItem(ONBOARDING_FLAG_KEY, '1');
  router.replace('/(main)/style-detail');
};

export default function OnboardingScreen(): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<OnboardingCard>>(null);

  const handleSkip = useCallback(() => {
    void navigateToMain();
  }, []);

  const handleGetStarted = useCallback(() => {
    void navigateToMain();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    const nextIndex = viewableItems[0]?.index;
    if (nextIndex !== null && nextIndex !== undefined) {
      setCurrentIndex(nextIndex);
    }
  }).current;

  const viewabilityConfig = useMemo(() => ({ viewAreaCoveragePercentThreshold: 60 }), []);

  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<OnboardingCard>) => {
    const isLast = index === ONBOARDING_CARDS.length - 1;

    return (
      <View style={styles.slide}>
        {!isLast ? (
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.skipSpacer} />
        )}

        <Text style={styles.brand}>DREAMSHOT</Text>

        <View style={isLast ? styles.heroImageSmall : styles.heroImage}>
          <LinearGradient colors={item.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiPreviewCard}>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>{item.style}</Text>
            </View>
            <Text style={styles.previewPrompt}>{item.prompt}</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>

        {item.flowText ? <Text style={styles.flowText}>{item.flowText}</Text> : null}

        {isLast ? (
          <View style={styles.galleryWrap}>
            {GALLERY_IMAGES.map((preview, galleryIndex) => (
              <LinearGradient key={`gallery-${galleryIndex}`} colors={preview.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.galleryImageSmall}>
                <Text style={styles.galleryPrompt} numberOfLines={2}>{preview.prompt}</Text>
              </LinearGradient>
            ))}
          </View>
        ) : null}

        {isLast ? (
          <Pressable onPress={handleGetStarted} style={styles.getStartedButtonWrap}>
            <LinearGradient colors={['#9C48EA', '#53DDFC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.getStartedButton}>
              <Text style={styles.getStartedText}>Get Started</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable style={styles.nextButton} onPress={() => listRef.current?.scrollToIndex({ index: index + 1, animated: true })}>
            <Text style={styles.nextText}>Next</Text>
          </Pressable>
        )}
      </View>
    );
  }, [handleGetStarted, handleSkip]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={ONBOARDING_CARDS}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      <View style={styles.indicatorsWrap}>
        {ONBOARDING_CARDS.map((card, index) => (
          <View key={card.id} style={[styles.dot, index === currentIndex ? styles.dotActive : null]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.dark.background,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  skipSpacer: {
    height: 32,
    alignSelf: 'stretch',
  },
  skipText: {
    color: APP_THEME.dark.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  brand: {
    color: APP_THEME.brand.secondary,
    letterSpacing: 2,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    maxWidth: 320,
    height: 320,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: APP_THEME.dark.borderVariant,
    overflow: 'hidden',
  },
  heroImageSmall: {
    width: '100%',
    maxWidth: 280,
    height: 240,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: APP_THEME.dark.borderVariant,
    overflow: 'hidden',
  },
  aiPreviewCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  previewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(9, 19, 40, 0.6)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  previewBadgeText: {
    color: '#EAF1FF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  previewPrompt: {
    color: '#F6F8FF',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter_600SemiBold',
  },
  title: {
    marginTop: 20,
    color: APP_THEME.dark.text,
    fontSize: 31,
    lineHeight: 37,
    fontFamily: 'SpaceGrotesk_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    color: APP_THEME.dark.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  flowText: {
    marginTop: 12,
    color: APP_THEME.brand.secondary,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  galleryWrap: {
    marginTop: 18,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  galleryImageSmall: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.dark.borderVariant,
    padding: 8,
    justifyContent: 'flex-end',
  },
  galleryPrompt: {
    color: '#F5F8FF',
    fontSize: 10,
    lineHeight: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  nextButton: {
    marginTop: 'auto',
    width: '100%',
    maxWidth: 320,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(83, 221, 252, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_THEME.dark.surfaceContainerHigh,
  },
  nextText: {
    color: APP_THEME.brand.secondary,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  getStartedButtonWrap: {
    marginTop: 'auto',
    width: '100%',
    maxWidth: 320,
    borderRadius: 14,
    overflow: 'hidden',
  },
  getStartedButton: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedText: {
    color: APP_THEME.dark.onPrimary,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  indicatorsWrap: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(163,170,196,0.45)',
  },
  dotActive: {
    width: 22,
    borderRadius: 999,
    backgroundColor: APP_THEME.brand.primary,
  },
});
