import React, { useCallback } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStylePreviewSource, DREAMSHOT_STYLE_PRESETS_BY_ID } from '../../src/config/styles';
import { useCoins } from '../../src/features/coins/hooks/useCoins';
import { useAppTheme } from '../../src/contexts/ThemeContext';

export default function StyleDetailScreen(): React.JSX.Element {
  const { styleId } = useLocalSearchParams<{ styleId?: string }>();
  const style = (styleId && DREAMSHOT_STYLE_PRESETS_BY_ID[styleId]) || Object.values(DREAMSHOT_STYLE_PRESETS_BY_ID)[0];
  const { balance, reload } = useCoins();
  const { palette, brand } = useAppTheme();
  const styles = React.useMemo(() => createStyles(palette, brand), [palette, brand]);

  const canAffordPhoto = balance >= style.photoCost;

  useFocusEffect(useCallback(() => { void reload(); }, [reload]));

  const handleCreatePhoto = () => {
    if (balance < style.photoCost) {
      Alert.alert(
        'Not Enough Coins',
        `You need ${style.photoCost} coins but only have ${balance}. Would you like to buy more?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Coins', onPress: () => router.push('/(tabs)/coins') },
        ],
      );
      return;
    }
    router.push({ pathname: '/(main)/photo-picker', params: { styleId: style.id, mode: 'photo' } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable testID="style-detail-back" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={palette.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Style Detail</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Style details info"
          onPress={() => Alert.alert('Style details', `${style.title}\n\nPhoto: ${style.photoCost} coins`)}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="info-outline" size={24} color={palette.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={getStylePreviewSource(style)} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroShade} />
          <Text style={styles.heroCaption}>Example: {style.title} Style</Text>
        </ImageBackground>

        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{style.title}</Text>
          <View style={styles.premiumBadge}>
            <MaterialIcons name="auto-awesome" size={16} color={brand.accent} />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        </View>

        <View style={styles.goldLine} />

        <Text style={styles.description}>{style.description}</Text>

        <View style={styles.featuresWrap}>
          <Text style={styles.featuresTitle}>Style Features</Text>
          <View style={styles.featuresRow}>
            <Feature icon="palette" label="Soft Tones" color={palette.textSecondary} styles={styles} />
            <Feature icon="auto-awesome" label="Glow Filter" color={palette.textSecondary} styles={styles} />
            <Feature icon="check-circle" label="HD Detail" color={palette.textSecondary} styles={styles} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <Pressable
          testID="create-photo-button"
          accessibilityRole="button"
          accessibilityLabel={`Create photo for ${style.photoCost} coins`}
          onPress={handleCreatePhoto}
          style={({ pressed }) => [styles.primaryAction, !canAffordPhoto && styles.actionDisabled, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>📸 Create Photo — {style.photoCost} coins</Text>
        </Pressable>

        <View style={styles.balanceRow}>
          <MaterialIcons name="monetization-on" size={16} color={brand.accent} />
          <Text style={styles.balanceText}>Your balance: {balance} coins</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Feature({
  icon,
  label,
  color,
  styles,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  color: string;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  return (
    <View style={styles.featureItem}>
      <MaterialIcons name={icon} size={20} color={color} />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette'], brand: ReturnType<typeof useAppTheme>['brand']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: palette.borderVariant,
    },
    headerTitle: { fontSize: 22, color: palette.text, fontWeight: '700', fontFamily: 'serif' },
    iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
    hero: { width: '100%', aspectRatio: 4 / 5, justifyContent: 'flex-end', marginBottom: 20 },
    heroImage: { borderRadius: 12 },
    heroShade: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    heroCaption: {
      color: palette.onPrimary,
      fontSize: 13,
      marginHorizontal: 14,
      marginBottom: 14,
      fontStyle: 'italic',
      zIndex: 1,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    title: { fontSize: 40, color: palette.text, fontWeight: '700', fontFamily: 'serif', flex: 1, flexShrink: 1 },
    premiumBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: palette.secondaryContainer,
    },
    premiumText: { textTransform: 'uppercase', color: palette.text, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
    goldLine: { width: 64, height: 4, borderRadius: 999, backgroundColor: brand.accent, marginTop: 10, marginBottom: 16 },
    description: { color: palette.textSecondary, fontSize: 17, lineHeight: 27 },
    stickyFooter: {
      borderTopWidth: 1,
      borderTopColor: palette.borderVariant,
      backgroundColor: palette.surface,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 14,
      gap: 10,
    },
    primaryAction: {
      minHeight: 58,
      borderRadius: 14,
      backgroundColor: '#0F2345',
      borderWidth: 1,
      borderColor: '#D7B86E',
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionText: { color: '#D7B86E', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center' },
    featuresWrap: { marginTop: 34, borderTopWidth: 1, borderTopColor: palette.borderVariant, paddingTop: 20, alignItems: 'center' },
    featuresTitle: {
      textTransform: 'uppercase',
      color: palette.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 3,
      marginBottom: 16,
    },
    featuresRow: { flexDirection: 'row', gap: 26 },
    featureItem: { alignItems: 'center', gap: 4 },
    featureLabel: { color: palette.textSecondary, fontSize: 12 },
    actionDisabled: { opacity: 0.5 },
    qaAction: {
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    qaActionText: { color: palette.text, fontSize: 13, fontWeight: '700' },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 4,
    },
    balanceText: { color: palette.textSecondary, fontSize: 13, fontWeight: '600' },
    pressed: { opacity: 0.85 },
    // Animation picker modal
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: palette.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 40,
    },
    modalTitle: { color: palette.text, fontSize: 20, fontWeight: '800', fontFamily: 'serif' },
    modalSubtitle: { color: palette.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 16 },
    animOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: palette.borderVariant,
      gap: 12,
    },
    animEmoji: { fontSize: 28 },
    animTextWrap: { flex: 1 },
    animLabel: { color: palette.text, fontSize: 15, fontWeight: '700' },
    animDesc: { color: palette.textSecondary, fontSize: 12, marginTop: 2 },
  });