import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';

interface MetricBadgeProps {
  label: string;
  value: string;
  /** Accent color — defaults to brand.primary. Tints the background and label. */
  color?: string;
  style?: ViewStyle;
}

export function MetricBadge({ label, value, color, style }: MetricBadgeProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();
  const accent = color ?? brand.primary;

  return (
    <View style={[styles.badge, {
      backgroundColor: `${accent}12`,
      borderColor: `${accent}20`,
    }, style]}>
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
      <Text style={[styles.value, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
  },
});
