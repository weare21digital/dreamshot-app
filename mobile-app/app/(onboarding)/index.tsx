import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { APP_THEME } from '../../src/config/theme';

const ONBOARDING_FLAG_KEY = 'dreamshot_onboarding_complete';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingCard = {
  id: string;
  title: string;
  subtitle: string;
  image: number;
  flowText?: string;
};

const ONBOARDING_CARDS: OnboardingCard[] = [
  {
    id: 'hero',
    title: 'Transform your photos into DreamShot art',
    subtitle: 'Turn any selfie into a cinematic AI style in seconds.',
    image: require('../../assets/styles/the-queen.jpg'),
  },
  {
    id: 'flow',
    title: 'Take a selfie → Pick a style → Generate your image',
    subtitle: 'Three simple steps from camera to stylized image in seconds.',
    image: require('../../assets/styles/the-duke.jpg'),
    flowText: 'Take a selfie  →  Pick a style  →  Generate your image',
  },
  {
    id: 'gallery',
    title: 'Your DreamShot gallery starts now',
    subtitle: 'Explore a selection of best-in-class styles and create your own.',
    image: require('../../assets/styles/the-coronation.jpg'),
  },
];

const GALLERY_IMAGES: number[] = [
  require('../../assets/styles/the-queen.jpg'),
  require('../../assets/styles/the-duke.jpg'),
  require('../../assets/styles/garden-soiree.jpg'),
  require('../../assets/styles/the-coronation.jpg'),
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

        <View style={[isLast ? styles.heroImageSmall : styles.heroImage, { overflow: 'hidden' }]}>
          <Image source={item.image} style={{ width: '100%', height: '130%', top: 0 }} resizeMode="cover" />
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>

        {item.flowText ? <Text style={styles.flowText}>{item.flowText}</Text> : null}

        {isLast ? (
          <View style={styles.galleryWrap}>
            {GALLERY_IMAGES.map((source, galleryIndex) => (
              <View key={`gallery-${galleryIndex}`} style={[styles.galleryImageSmall, { overflow: 'hidden' }]}>
                <Image source={source} style={{ width: '100%', height: '130%', top: 0 }} resizeMode="cover" />
              </View>
            ))}
          </View>
        ) : null}

        <Pressable style={isLast ? styles.getStartedButton : styles.nextButton} onPress={isLast ? handleGetStarted : () => listRef.current?.scrollToIndex({ index: index + 1, animated: true })}>
          <Text style={isLast ? styles.getStartedText : styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </Pressable>
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
    color: APP_THEME.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  brand: {
    color: APP_THEME.brand.primary,
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    maxWidth: 320,
    height: 320,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: APP_THEME.brand.primary,
  },
  heroImageSmall: {
    width: '100%',
    maxWidth: 280,
    height: 240,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: APP_THEME.brand.primary,
  },
  title: {
    marginTop: 20,
    color: APP_THEME.dark.text,
    fontSize: 31,
    lineHeight: 37,
    fontFamily: 'serif',
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
    color: APP_THEME.brand.primary,
    fontSize: 14,
    fontWeight: '700',
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
  galleryImage: {
    width: 138,
    height: 138,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_THEME.brand.primary,
  },
  galleryImageSmall: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.brand.primary,
  },
  nextButton: {
    marginTop: 'auto',
    width: '100%',
    maxWidth: 320,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_THEME.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_THEME.dark.surfaceVariant,
  },
  nextText: {
    color: APP_THEME.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
  getStartedButton: {
    marginTop: 'auto',
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_THEME.brand.primary,
  },
  getStartedText: {
    color: APP_THEME.dark.onPrimary,
    fontSize: 16,
    fontWeight: '800',
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
