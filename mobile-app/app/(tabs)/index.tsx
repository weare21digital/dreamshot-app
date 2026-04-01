import React, { useMemo } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStylePreviewSource, DREAMSHOT_STYLE_PRESETS } from '../../src/config/styles';
import { useAppTheme } from '../../src/contexts/ThemeContext';

type CreationCard = {
  id: string;
  title: string;
  author: string;
  large?: boolean;
};

const POPULAR_CREATIONS: CreationCard[] = [
  { id: 'the-queen', title: 'Cyber Ethereal', author: '@lucid_dreamer', large: true },
  { id: 'the-diamond', title: 'Liquid Gold Dragon', author: '@goldenvoid' },
  { id: 'midnight-court', title: 'Vaporwave Dawn', author: '@neonatlas' },
  { id: 'the-coronation', title: 'Crystal Library', author: '@phasecraft' },
];

export default function HomeScreen(): React.JSX.Element {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <MaterialIcons name="blur-on" size={21} color="#9C48EA" />
            <Text style={styles.logoText}>DreamShot</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.notifyButton, pressed && styles.pressed]}>
            <MaterialIcons name="notifications-none" size={22} color={palette.textSecondary} />
          </Pressable>
        </View>

        <ImageBackground
          source={getStylePreviewSource(DREAMSHOT_STYLE_PRESETS[0])}
          imageStyle={styles.heroImage}
          style={styles.heroSection}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>JOIN 1M+ CREATORS</Text>
            <Text style={styles.heroTitle}>Imagine it.{"\n"}<Text style={styles.heroTitleAccent}>Create it.</Text></Text>
            <View style={styles.heroActions}>
              <Pressable
                style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]}
                onPress={() => router.push('/(main)/photo-picker')}
              >
                <Text style={styles.ctaPrimaryText}>Start Creating</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.ctaGhost, pressed && styles.pressed]}
                onPress={() => router.push('/(tabs)/my-gallery')}
              >
                <Text style={styles.ctaGhostText}>View Gallery</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionTitle}>Popular Creations</Text>
            <Text style={styles.sectionSub}>Trending artworks from the community</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        <View style={styles.bentoGrid}>
          {POPULAR_CREATIONS.map((creation, index) => {
            const stylePreset = DREAMSHOT_STYLE_PRESETS.find((preset) => preset.id === creation.id) ?? DREAMSHOT_STYLE_PRESETS[index];
            return (
              <Pressable
                key={creation.title}
                style={({ pressed }) => [styles.card, creation.large ? styles.cardLarge : styles.cardSmall, pressed && styles.pressed]}
                onPress={() => router.push({ pathname: '/(main)/style-detail', params: { styleId: stylePreset.id } })}
              >
                <Image source={getStylePreviewSource(stylePreset)} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardTitle}>{creation.title}</Text>
                  <Text style={styles.cardAuthor}>{creation.author}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    content: { paddingBottom: 104 },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    logoText: {
      fontSize: 27,
      fontFamily: 'SpaceGrotesk_700Bold',
      color: '#CC97FF',
      includeFontPadding: false,
    },
    notifyButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(20, 31, 56, 0.6)',
    },
    heroSection: {
      marginHorizontal: 16,
      borderRadius: 24,
      overflow: 'hidden',
      minHeight: 332,
      justifyContent: 'flex-end',
      marginBottom: 24,
      backgroundColor: palette.surfaceVariant,
    },
    heroImage: { opacity: 0.56 },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(6, 14, 32, 0.5)',
    },
    heroContent: {
      paddingHorizontal: 20,
      paddingVertical: 24,
      gap: 12,
    },
    heroEyebrow: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: 'rgba(15, 25, 48, 0.7)',
      color: '#53DDFC',
      fontFamily: 'Inter_700Bold',
      fontSize: 11,
      letterSpacing: 1,
    },
    heroTitle: {
      color: '#DEE5FF',
      fontFamily: 'SpaceGrotesk_700Bold',
      fontSize: 42,
      lineHeight: 46,
    },
    heroTitleAccent: { color: '#53DDFC' },
    heroActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
    ctaPrimary: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 13,
      alignItems: 'center',
      backgroundColor: '#9C48EA',
    },
    ctaPrimaryText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 },
    ctaGhost: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 13,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(83, 221, 252, 0.35)',
      backgroundColor: 'rgba(20, 31, 56, 0.45)',
    },
    ctaGhostText: { color: '#DEE5FF', fontFamily: 'Inter_700Bold', fontSize: 15 },
    sectionHead: {
      paddingHorizontal: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    sectionTitle: { color: palette.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28 },
    sectionSub: { color: palette.textSecondary, fontSize: 13, marginTop: 2 },
    viewAllBtn: { paddingVertical: 6, paddingHorizontal: 8 },
    viewAllText: { color: '#53DDFC', fontFamily: 'Inter_700Bold', fontSize: 13 },
    bentoGrid: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 20,
    },
    card: {
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: palette.surfaceContainerHigh,
      position: 'relative',
    },
    cardLarge: { width: '64%', minHeight: 250 },
    cardSmall: { width: '33%', minHeight: 120 },
    cardImage: { width: '100%', height: '100%' },
    cardOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    cardTitle: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 12 },
    cardAuthor: { color: '#C7D2FF', fontSize: 10, marginTop: 2 },
    pressed: { opacity: 0.85 },
  });
