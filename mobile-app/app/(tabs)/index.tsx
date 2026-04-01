import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCoins } from '../../src/features/coins/hooks/useCoins';
import { getStylePreviewSource, ROYAL_STYLE_PRESETS } from '../../src/config/styles';
import { useAppTheme } from '../../src/contexts/ThemeContext';

const FILTERS = [
  { key: 'all', label: 'All Styles' },
  { key: 'new', label: 'New Releases' },
  { key: 'trending', label: 'Trending' },
  { key: 'historical', label: 'Historical' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const NEW_RELEASE_IDS = new Set(['the-heiress', 'regency-masquerade', 'the-coronation']);
const TRENDING_IDS = new Set(['the-queen', 'the-diamond', 'midnight-court']);
const HISTORICAL_IDS = new Set(['the-duke', 'the-coronation']);

const matchesFilter = (styleId: string, filter: FilterKey): boolean => {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'new') {
    return NEW_RELEASE_IDS.has(styleId);
  }

  if (filter === 'trending') {
    return TRENDING_IDS.has(styleId);
  }

  return HISTORICAL_IDS.has(styleId);
};

export default function HomeScreen(): React.JSX.Element {
  const { balance, reload } = useCoins();
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('all');

  useFocusEffect(useCallback(() => { void reload(); }, [reload]));
  const { palette, brand } = useAppTheme();
  const styles = useMemo(() => createStyles(palette, brand), [palette, brand]);
  const filteredStyles = useMemo(
    () => ROYAL_STYLE_PRESETS.filter((style) => matchesFilter(style.id, selectedFilter)),
    [selectedFilter],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="emoji-events" size={28} color={palette.text} />
        <Text style={styles.brandTitle}>DreamShot</Text>
        <Pressable
          testID="global-header-coin-balance"
          onPress={() => router.push('/(tabs)/coins')}
          style={({ pressed }) => [styles.coinBadge, pressed && styles.pressed]}
        >
          <MaterialIcons name="monetization-on" size={16} color={brand.accent} />
          <Text style={styles.coinText}>{balance}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Style Gallery</Text>
        <Text style={styles.subtitle}>Transform your image into timeless majesty</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersWrap}
          style={styles.filtersStrip}
        >
          {FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter.key;

            return (
              <Pressable
                key={filter.key}
                testID={`home-filter-${filter.key}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedFilter(filter.key)}
                style={({ pressed }) => [
                  styles.filterItem,
                  isSelected && styles.filterItemActive,
                  pressed && styles.filterPressed,
                ]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.grid}>
          {filteredStyles.map((style) => (
            <Pressable
              key={style.id}
              accessibilityRole="button"
              testID={`style-card-${style.id}`}
              onPress={() => router.push({ pathname: '/(main)/style-detail', params: { styleId: style.id } })}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.imageWrap}>
                <Image source={getStylePreviewSource(style)} style={styles.image} resizeMode="cover" />
              </View>
              <Text style={styles.cardTitle}>{style.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {style.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette'], brand: ReturnType<typeof useAppTheme>['brand']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: palette.borderVariant,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    brandTitle: { flex: 1, marginLeft: 8, fontSize: 24, color: palette.text, fontWeight: '700', fontFamily: 'serif' },
    coinBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: palette.secondaryContainer,
      borderColor: palette.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    coinText: { color: palette.text, fontWeight: '700', fontSize: 13 },
    content: { paddingHorizontal: 16, paddingBottom: 20 },
    screenTitle: { marginTop: 14, fontSize: 33, color: palette.text, fontWeight: '700', fontFamily: 'serif' },
    subtitle: { fontSize: 14, color: palette.textSecondary, marginTop: 2 },
    filtersStrip: { marginTop: 10, marginHorizontal: -16, borderBottomWidth: 1, borderBottomColor: palette.borderVariant },
    filtersWrap: { paddingHorizontal: 16, gap: 18 },
    filterItem: { paddingTop: 14, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    filterItemActive: { borderBottomColor: palette.text },
    filterPressed: { opacity: 0.75 },
    filterText: { color: palette.textSecondary, fontSize: 13, fontWeight: '500' },
    filterTextActive: { color: palette.text, fontWeight: '700' },
    grid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
    card: { width: '48%' },
    imageWrap: {
      width: '100%',
      aspectRatio: 0.52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      overflow: 'hidden',
      backgroundColor: palette.surfaceVariant,
    },
    image: { width: '100%', height: '100%' },
    cardTitle: { marginTop: 6, fontSize: 20, lineHeight: 22, color: palette.text, fontWeight: '700', fontFamily: 'serif' },
    cardSubtitle: { marginTop: 1, fontSize: 12, lineHeight: 15, color: palette.textSecondary },
    pressed: { opacity: 0.8 },
  });
