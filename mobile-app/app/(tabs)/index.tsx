import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStylePreviewSource, DREAMSHOT_STYLE_PRESETS } from '../../src/config/styles';
import { useAppTheme } from '../../src/contexts/ThemeContext';

type StyleCategory = 'All' | 'Portraits' | 'Landscapes' | 'Abstract' | 'Fantasy';

const STYLE_CATEGORIES: StyleCategory[] = ['All', 'Portraits', 'Landscapes', 'Abstract', 'Fantasy'];
const FAVORITE_STYLE_ORDER_KEY = '@dreamshot/favorite_style_order';
const FIRST_TIME_TOOLTIP_DISMISSED_KEY = '@dreamshot/first_time_tooltip_dismissed';

const STYLE_CATEGORY_MAP: Record<string, Exclude<StyleCategory, 'All'>> = {
  'cinematic-vibe': 'Portraits',
  'render-3d': 'Abstract',
  'oil-painting': 'Portraits',
  'watercolor-dream': 'Landscapes',
  'anime-glow': 'Fantasy',
  'photoreal-pro': 'Portraits',
  'pixel-pop': 'Abstract',
  'fantasy-matte': 'Fantasy',
};

export default function HomeScreen(): React.JSX.Element {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [selectedCategory, setSelectedCategory] = useState<StyleCategory>('All');
  const [selectedStyleId, setSelectedStyleId] = useState<string>(DREAMSHOT_STYLE_PRESETS[0]?.id ?? '');
  const [loadedStyleImages, setLoadedStyleImages] = useState<Record<string, boolean>>({});
  const [favoriteStyleOrder, setFavoriteStyleOrder] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showFirstTimeTooltip, setShowFirstTimeTooltip] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrateScreenState = async (): Promise<void> => {
      try {
        const [favoriteRaw, tooltipDismissedRaw] = await Promise.all([
          AsyncStorage.getItem(FAVORITE_STYLE_ORDER_KEY),
          AsyncStorage.getItem(FIRST_TIME_TOOLTIP_DISMISSED_KEY),
        ]);

        if (!mounted) return;

        if (favoriteRaw) {
          const parsed = JSON.parse(favoriteRaw);
          if (Array.isArray(parsed)) {
            const validIds = parsed.filter(
              (id): id is string => typeof id === 'string' && DREAMSHOT_STYLE_PRESETS.some((style) => style.id === id),
            );
            setFavoriteStyleOrder(Array.from(new Set(validIds)));
          }
        }

        setShowFirstTimeTooltip(tooltipDismissedRaw !== 'true');
      } catch (error) {
        console.warn('[HomeScreen] failed to hydrate home screen state', error);
      }
    };

    void hydrateScreenState();
    return () => {
      mounted = false;
    };
  }, []);

  const persistFavoriteStyleOrder = useCallback(async (nextOrder: string[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(FAVORITE_STYLE_ORDER_KEY, JSON.stringify(nextOrder));
    } catch (error) {
      console.warn('[HomeScreen] failed to persist favorite style order', error);
    }
  }, []);

  const toggleFavorite = useCallback((styleId: string) => {
    setFavoriteStyleOrder((currentOrder) => {
      const isFavorite = currentOrder.includes(styleId);
      const nextOrder = isFavorite
        ? currentOrder.filter((id) => id !== styleId)
        : [styleId, ...currentOrder.filter((id) => id !== styleId)];
      void persistFavoriteStyleOrder(nextOrder);
      return nextOrder;
    });
  }, [persistFavoriteStyleOrder]);

  const dismissFirstTimeTooltip = useCallback(() => {
    setShowFirstTimeTooltip(false);
    void AsyncStorage.setItem(FIRST_TIME_TOOLTIP_DISMISSED_KEY, 'true').catch((error) => {
      console.warn('[HomeScreen] failed to persist tooltip dismissal', error);
    });
  }, []);

  const filteredStyles = useMemo(() => {
    const categoryFiltered = selectedCategory === 'All'
      ? DREAMSHOT_STYLE_PRESETS
      : DREAMSHOT_STYLE_PRESETS.filter((style) => STYLE_CATEGORY_MAP[style.id] === selectedCategory);

    const favoriteSet = new Set(favoriteStyleOrder);
    const favoriteStyles: typeof categoryFiltered = [];
    const regularStyles: typeof categoryFiltered = [];

    categoryFiltered.forEach((style) => {
      if (favoriteSet.has(style.id)) {
        favoriteStyles.push(style);
      } else {
        regularStyles.push(style);
      }
    });

    favoriteStyles.sort((a, b) => favoriteStyleOrder.indexOf(a.id) - favoriteStyleOrder.indexOf(b.id));
    return [...favoriteStyles, ...regularStyles];
  }, [favoriteStyleOrder, selectedCategory]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <MaterialIcons name="blur-on" size={21} color="#9C48EA" />
            <Svg width={184} height={34} viewBox="0 0 184 34" accessible={false}>
              <Defs>
                <SvgLinearGradient id="dreamshotWordmark" x1="0" y1="0" x2="184" y2="0">
                  <Stop offset="0" stopColor="#9C48EA" />
                  <Stop offset="1" stopColor="#53DDFC" />
                </SvgLinearGradient>
              </Defs>
              <SvgText x="0" y="27" fill="url(#dreamshotWordmark)" fontSize="27" fontFamily="SpaceGrotesk_700Bold">
                DreamShot
              </SvgText>
            </Svg>
          </View>
          <Pressable
            style={({ pressed }) => [styles.notifyButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            testID="home-notifications-button"
          >
            <MaterialIcons name="notifications-none" size={22} color={palette.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.heroWrap}>
          <Text style={styles.heroTitle}>
            Style <Text style={styles.heroTitleAccent}>Gallery</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Choose the visual language for your next generation.
          </Text>
          <View style={styles.heroActions}>
            <Text style={styles.helperCopy}>Long press a style to favorite it and pin it to the top.</Text>
            <Pressable
              style={({ pressed }) => [styles.editModeButton, editMode && styles.editModeButtonActive, pressed && styles.pressed]}
              onPress={() => setEditMode((current) => !current)}
            >
              <MaterialIcons name={editMode ? 'check' : 'edit'} size={16} color={editMode ? '#0F1426' : '#C6D0EA'} />
              <Text style={[styles.editModeButtonText, editMode && styles.editModeButtonTextActive]}>
                {editMode ? 'Done' : 'Reorder Favorites'}
              </Text>
            </Pressable>
          </View>
        </View>

        {showFirstTimeTooltip ? (
          <View style={styles.tooltipCard}>
            <View style={styles.tooltipHeader}>
              <MaterialIcons name="tips-and-updates" size={16} color="#F8D968" />
              <Text style={styles.tooltipTitle}>Quick tip</Text>
              <Pressable
                onPress={dismissFirstTimeTooltip}
                style={({ pressed }) => [styles.tooltipDismiss, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Dismiss first-time style tips"
              >
                <MaterialIcons name="close" size={14} color="#C8D0EA" />
              </Pressable>
            </View>
            <Text style={styles.tooltipBody}>Styles with richer detail usually cost more coins. Start with simpler styles for faster, cheaper tests.</Text>
            <View style={styles.tooltipBulletList}>
              <Text style={styles.tooltipBullet}>• Photo generations use the style photo coin cost.</Text>
              <Text style={styles.tooltipBullet}>• Premium cinematic/3D looks trade more coins for higher output detail.</Text>
              <Text style={styles.tooltipBullet}>• Long-press any style to pin favorites to the top.</Text>
            </View>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {STYLE_CATEGORIES.map((category) => {
            const active = category === selectedCategory;
            return (
              <Pressable
                key={category}
                style={({ pressed }) => [styles.categoryChip, active && styles.categoryChipActive, pressed && styles.pressed]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.grid}>
          {filteredStyles.map((stylePreset) => {
            const selected = selectedStyleId === stylePreset.id;
            const isFavorite = favoriteStyleOrder.includes(stylePreset.id);

            return (
              <Pressable
                key={stylePreset.id}
                style={({ pressed }) => [styles.styleCard, pressed && styles.pressed]}
                delayLongPress={220}
                onLongPress={() => {
                  if (!editMode) setEditMode(true);
                  toggleFavorite(stylePreset.id);
                }}
                onPress={() => {
                  if (editMode) {
                    toggleFavorite(stylePreset.id);
                    return;
                  }
                  setSelectedStyleId(stylePreset.id);
                  router.push({ pathname: '/(main)/style-detail', params: { styleId: stylePreset.id } });
                }}
              >
                {!loadedStyleImages[stylePreset.id] ? <View style={styles.styleSkeleton} /> : null}
                <Image
                  source={getStylePreviewSource(stylePreset)}
                  style={[styles.styleImage, !loadedStyleImages[stylePreset.id] && styles.hiddenStyleImage]}
                  resizeMode="cover"
                  onLoadEnd={() => {
                    setLoadedStyleImages((current) => {
                      if (current[stylePreset.id]) return current;
                      return { ...current, [stylePreset.id]: true };
                    });
                  }}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(6, 14, 32, 0.94)']}
                  start={{ x: 0.5, y: 0.25 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.styleGradientOverlay}
                />
                <View style={styles.styleFooter}>
                  <View style={styles.styleBadgeRow}>
                    <View style={[styles.favoritePill, isFavorite && styles.favoritePillActive]}>
                      <MaterialIcons name={isFavorite ? 'star' : 'star-border'} size={13} color={isFavorite ? '#0E0A00' : '#E2E8FF'} />
                      <Text style={[styles.favoritePillText, isFavorite && styles.favoritePillTextActive]}>
                        {isFavorite ? 'Favorite' : 'Not favorite'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.styleName}>{stylePreset.title}</Text>
                  <View style={[styles.selectPill, selected && styles.selectPillActive]}>
                    <Text style={[styles.selectPillText, selected && styles.selectPillTextActive]}>
                      {editMode ? (isFavorite ? 'Tap to Unpin' : 'Tap to Pin') : selected ? 'Selected' : 'Select'}
                    </Text>
                  </View>
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
      paddingBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    notifyButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(20, 31, 56, 0.45)',
    },
    heroWrap: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    heroActions: {
      marginTop: 12,
      gap: 10,
    },
    helperCopy: {
      color: palette.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    editModeButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(99, 116, 153, 0.5)',
      backgroundColor: 'rgba(16, 27, 49, 0.65)',
    },
    editModeButtonActive: {
      backgroundColor: '#CC97FF',
      borderColor: '#CC97FF',
    },
    editModeButtonText: {
      color: '#C6D0EA',
      fontFamily: 'Inter_700Bold',
      fontSize: 12,
    },
    editModeButtonTextActive: {
      color: '#0F1426',
    },
    heroTitle: {
      color: palette.text,
      fontFamily: 'SpaceGrotesk_700Bold',
      fontSize: 42,
      lineHeight: 46,
      letterSpacing: -0.5,
    },
    heroTitleAccent: { color: '#53DDFC' },
    heroSubtitle: {
      marginTop: 10,
      color: palette.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 300,
    },
    tooltipCard: {
      marginHorizontal: 16,
      marginBottom: 14,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: 'rgba(248, 217, 104, 0.35)',
      backgroundColor: 'rgba(18, 27, 49, 0.92)',
    },
    tooltipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tooltipTitle: {
      color: '#F8D968',
      fontFamily: 'Inter_700Bold',
      fontSize: 12,
      flex: 1,
    },
    tooltipDismiss: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tooltipBody: {
      marginTop: 7,
      color: '#DFE6FF',
      fontSize: 12,
      lineHeight: 18,
    },
    tooltipBulletList: {
      marginTop: 7,
      gap: 4,
    },
    tooltipBullet: {
      color: '#C8D0EA',
      fontSize: 11,
      lineHeight: 16,
    },
    categoriesScroll: {
      marginBottom: 16,
    },
    categoriesContent: {
      paddingHorizontal: 16,
      gap: 10,
    },
    categoryChip: {
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: 'rgba(20, 31, 56, 0.58)',
    },
    categoryChipActive: {
      backgroundColor: '#CC97FF',
    },
    categoryChipText: {
      color: palette.textSecondary,
      fontFamily: 'Inter_700Bold',
      fontSize: 13,
    },
    categoryChipTextActive: {
      color: '#000000',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    styleCard: {
      width: '47%',
      borderRadius: 32,
      overflow: 'hidden',
      minHeight: 214,
      backgroundColor: 'rgba(15, 25, 48, 0.45)',
    },
    styleImage: {
      width: '100%',
      height: 214,
    },
    hiddenStyleImage: {
      opacity: 0,
    },
    styleSkeleton: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(20, 31, 56, 0.8)',
    },
    styleGradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(6, 14, 32, 0.18)',
    },
    styleFooter: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 12,
      paddingVertical: 11,
      backgroundColor: 'rgba(6, 14, 32, 0.25)',
    },
    styleBadgeRow: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    favoritePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 4,
      backgroundColor: 'rgba(18, 27, 49, 0.85)',
    },
    favoritePillActive: {
      backgroundColor: '#F8D968',
    },
    favoritePillText: {
      color: '#E2E8FF',
      fontFamily: 'Inter_700Bold',
      fontSize: 10,
    },
    favoritePillTextActive: {
      color: '#0E0A00',
    },
    styleName: {
      color: '#FFFFFF',
      fontFamily: 'SpaceGrotesk_700Bold',
      fontSize: 17,
      marginBottom: 8,
    },
    selectPill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: 'rgba(20, 31, 56, 0.7)',
    },
    selectPillActive: {
      backgroundColor: '#CC97FF',
    },
    selectPillText: {
      color: '#DEE5FF',
      fontFamily: 'Inter_700Bold',
      fontSize: 12,
    },
    selectPillTextActive: {
      color: '#000000',
    },
    pressed: { opacity: 0.86 },
  });
