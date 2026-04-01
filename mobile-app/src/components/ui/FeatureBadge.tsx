import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';
import { MaterialIcons as Icon } from '@expo/vector-icons';

interface FeatureBadgeProps {
  icon?: string;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function FeatureBadge({ icon = 'star', title, subtitle, style }: FeatureBadgeProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();

  return (
    <View style={[styles.container, {
      backgroundColor: `${brand.primary}08`,
      borderColor: `${brand.primary}18`,
    }, style]}>
      <View style={[styles.iconBox, { backgroundColor: brand.primary }]}>
        <Icon name={icon as keyof typeof Icon.glyphMap} size={18} color={palette.onPrimary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
});
