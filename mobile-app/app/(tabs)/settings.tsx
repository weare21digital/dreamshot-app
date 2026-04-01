import { MaterialIcons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import React, { useCallback } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/contexts/ThemeContext';

const GOLD = '#B08D57';
const NAVY = '#1B1F5E';

export default function SettingsScreen(): React.JSX.Element {
  const { resolvedThemeMode, toggleTheme, palette, brand } = useAppTheme();
  const isDark = resolvedThemeMode === 'dark';
  const styles = React.useMemo(() => createStyles(palette, brand, isDark), [palette, brand, isDark]);

  const handleRateApp = useCallback(async () => {
    const canRequestReview = await StoreReview.hasAction();

    if (canRequestReview) {
      await StoreReview.requestReview();
      return;
    }

    const configuredStoreUrl = StoreReview.storeUrl();

    if (configuredStoreUrl) {
      await Linking.openURL(configuredStoreUrl);
      return;
    }

    await Linking.openURL('https://apps.apple.com/');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="settings" size={22} color={isDark ? GOLD : NAVY} />
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel label="Appearance" styles={styles} />
        <View style={styles.groupCard}>
          <View style={styles.row}>
            <RowLeft icon="dark-mode" label="Dark Mode" styles={styles} />
            <Switch
              testID="toggle-theme"
              value={isDark}
              onValueChange={() => void toggleTheme()}
              trackColor={{ false: '#D0BE98', true: GOLD }}
              thumbColor="#fff"
              ios_backgroundColor="#D0BE98"
              style={{ marginRight: -4 }}
            />
          </View>
        </View>

        <SectionLabel label="Legal & Feedback" styles={styles} />
        <View style={styles.groupCard}>
          <MenuItem icon="star" label="Rate App" onPress={() => void handleRateApp()} styles={styles} />
          <View style={styles.divider} />
          <MenuItem icon="gavel" label="Terms of Service" onPress={() => Linking.openURL('https://example.com/terms')} styles={styles} />
          <View style={styles.divider} />
          <MenuItem icon="privacy-tip" label="Privacy Policy" onPress={() => Linking.openURL('https://example.com/privacy')} styles={styles} />
        </View>

        <Text style={styles.version}>DreamShot v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Sub-components ---------- */

function SectionLabel({ label, styles }: { label: string; styles: ReturnType<typeof createStyles> }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function RowLeft({
  icon,
  label,
  styles,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.rowLeft}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={18} color={styles.iconColor.color as string} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  styles,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]} onPress={onPress}>
      <RowLeft icon={icon} label={label} styles={styles} />
      <MaterialIcons name="chevron-right" size={20} color={styles.chevronColor.color as string} />
    </Pressable>
  );
}

/* ---------- Styles ---------- */

const createStyles = (
  palette: ReturnType<typeof useAppTheme>['palette'],
  brand: ReturnType<typeof useAppTheme>['brand'],
  isDark: boolean,
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: palette.borderVariant,
    },
    title: {
      color: palette.text,
      fontSize: 20,
      fontFamily: 'serif',
      fontWeight: '700',
    },
    content: { paddingHorizontal: 16, paddingBottom: 40 },
    sectionLabel: {
      color: isDark ? GOLD : NAVY,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      fontWeight: '700',
      marginTop: 24,
      marginBottom: 8,
      marginLeft: 4,
    },
    groupCard: {
      backgroundColor: palette.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.borderVariant,
      overflow: 'hidden',
    },
    row: {
      minHeight: 52,
      paddingHorizontal: 14,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(176,141,87,0.15)' : 'rgba(27,31,94,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: { color: isDark ? GOLD : NAVY },
    rowLabel: { color: palette.text, fontSize: 15, fontWeight: '500' },
    menuRow: {
      height: 56,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: palette.borderVariant,
      marginLeft: 60,
    },
    chevronColor: { color: palette.textSecondary },
    version: {
      textAlign: 'center',
      marginTop: 32,
      color: palette.textSecondary,
      fontSize: 12,
      fontWeight: '500',
    },
    pressed: { opacity: 0.7 },
  });
