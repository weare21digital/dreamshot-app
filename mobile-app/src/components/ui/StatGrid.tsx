import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';

export interface StatItem {
  label: string;
  value: string;
}

interface StatGridProps {
  items: StatItem[];
  columns?: number;
  style?: ViewStyle;
}

export function StatGrid({ items, columns = 2, style }: StatGridProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();

  return (
    <View style={[styles.grid, style]}>
      {items.map((item, index) => (
        <View
          key={index}
          style={[styles.cell, {
            backgroundColor: `${brand.primary}06`,
            borderColor: `${brand.primary}10`,
            width: `${(100 / columns) - 2}%` as unknown as number,
          }]}
        >
          <Text style={[styles.label, { color: palette.textSecondary }]}>{item.label}</Text>
          <Text style={[styles.value, { color: palette.text }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
});
