import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../contexts/ThemeContext';
import { SearchInput } from './SearchInput';
import { CategoryGrid } from './CategoryGrid';
import { DataCard } from './DataCard';
import { CompactDataCard } from './CompactDataCard';
import { ProgressRing } from './ProgressRing';
import { StatGrid } from './StatGrid';
import { InfoBanner } from './InfoBanner';
import { ChipSelector } from './ChipSelector';
import { FeatureBadge } from './FeatureBadge';
import { SectionHeader } from './SectionHeader';

export function ComponentShowcase(): React.JSX.Element {
  const { palette, brand, status } = useAppTheme();
  const [selectedChip, setSelectedChip] = useState('200');
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: palette.text }]}>Component Library</Text>
        <Text style={[styles.pageSubtitle, { color: palette.textSecondary }]}>
          Reusable UI components — all themed
        </Text>

        {/* Search Input */}
        <View style={styles.section}>
          <SectionHeader title="Search Input" />
          <SearchInput
            placeholder="Search 10,000+ items..."
            value={searchText}
            onChangeText={setSearchText}
            rightIcon="mic"
          />
        </View>

        {/* Category Grid */}
        <View style={styles.section}>
          <SectionHeader title="Category Grid" />
          <CategoryGrid items={[
            { icon: 'local-dining', label: 'Fruits' },
            { icon: 'eco', label: 'Veggie' },
            { icon: 'restaurant', label: 'Protein' },
            { icon: 'cake', label: 'Snacks' },
          ]} />
        </View>

        {/* Data Cards */}
        <View style={styles.section}>
          <SectionHeader title="Data Cards" actionLabel="See All" onAction={() => {}} />
          <DataCard
            title="Avocado, Medium"
            subtitle="1 unit (201g)"
            highlightValue="322"
            highlightLabel="KCAL"
            metrics={[
              { label: 'Protein', value: '4g' },
              { label: 'Carbs', value: '17g', color: brand.accent },
              { label: 'Fat', value: '29g', color: status.warning },
            ]}
          />
          <View style={{ height: 10 }} />
          <DataCard
            title="Greek Yogurt, Plain"
            subtitle="1 cup (245g)"
            highlightValue="145"
            highlightLabel="KCAL"
            metrics={[
              { label: 'Protein', value: '24g' },
              { label: 'Carbs', value: '9g', color: brand.accent },
              { label: 'Fat', value: '1g', color: status.warning },
            ]}
          />
        </View>

        {/* Compact Data Cards */}
        <View style={styles.section}>
          <SectionHeader title="Compact Cards" />
          <CompactDataCard
            title="Whole Milk"
            metrics={[
              { label: 'P', value: '8g' },
              { label: 'C', value: '12g' },
              { label: 'F', value: '8g' },
            ]}
            highlightValue="150 KCAL"
            highlightLabel="240ml"
          />
          <View style={{ height: 10 }} />
          <CompactDataCard
            title="Banana, Raw"
            metrics={[
              { label: 'P', value: '1g' },
              { label: 'C', value: '27g' },
              { label: 'F', value: '0g' },
            ]}
            highlightValue="105 KCAL"
            highlightLabel="118g"
          />
        </View>

        {/* Progress Rings */}
        <View style={styles.section}>
          <SectionHeader title="Progress Rings" />
          <View style={styles.ringRow}>
            <View style={[styles.ringCard, {
              backgroundColor: `${brand.primary}06`,
              borderColor: `${brand.primary}12`,
            }]}>
              <ProgressRing progress={20} value="4g" label="Protein" />
            </View>
            <View style={[styles.ringCard, {
              backgroundColor: `${brand.accent}06`,
              borderColor: `${brand.accent}12`,
            }]}>
              <ProgressRing progress={55} value="17g" label="Carbs" color={brand.accent} />
            </View>
            <View style={[styles.ringCard, {
              backgroundColor: `${status.warning}06`,
              borderColor: `${status.warning}12`,
            }]}>
              <ProgressRing progress={80} value="29g" label="Fats" color={status.warning} />
            </View>
          </View>
        </View>

        {/* Chip Selector */}
        <View style={styles.section}>
          <SectionHeader title="Chip Selector" />
          <ChipSelector
            options={[
              { label: '50g', value: '50' },
              { label: '100g', value: '100' },
              { label: '200g', value: '200' },
              { label: '500g', value: '500' },
            ]}
            selected={selectedChip}
            onSelect={setSelectedChip}
          />
        </View>

        {/* Stat Grid */}
        <View style={styles.section}>
          <SectionHeader title="Stat Grid" />
          <StatGrid items={[
            { label: 'Fiber', value: '13.4g' },
            { label: 'Sugar', value: '1.3g' },
            { label: 'Potassium', value: '970mg' },
            { label: 'Sodium', value: '14mg' },
            { label: 'Vit C', value: '20mg' },
            { label: 'Magnesium', value: '58mg' },
          ]} />
        </View>

        {/* Info Banners */}
        <View style={styles.section}>
          <SectionHeader title="Info Banners" />
          <InfoBanner
            icon="info"
            message="Nutritional values are calculated based on average USDA data. Actual values may vary."
          />
          <View style={{ height: 10 }} />
          <InfoBanner
            icon="warning"
            variant="warning"
            message="This item contains allergens. Please check the full ingredient list."
          />
        </View>

        {/* Feature Badge */}
        <View style={styles.section}>
          <SectionHeader title="Feature Badge" />
          <FeatureBadge
            icon="star"
            title="Lifetime Pro Access"
            subtitle="Offline search enabled. No monthly fees."
          />
          <View style={{ height: 10 }} />
          <FeatureBadge
            icon="verified-user"
            title="Privacy-First Guarantee"
            subtitle="100% offline. No tracking. No accounts."
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  ringRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ringCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
});
