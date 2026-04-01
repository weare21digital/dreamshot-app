import React from 'react';
import { View, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';
import { MaterialIcons as Icon } from '@expo/vector-icons';

export interface CategoryItem {
  icon: string;
  label: string;
  onPress?: () => void;
}

interface CategoryGridProps {
  items: CategoryItem[];
  columns?: number;
  style?: ViewStyle;
}

export function CategoryGrid({ items, columns = 4, style }: CategoryGridProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();

  return (
    <View style={[styles.grid, style]}>
      {items.map((item, index) => (
        <Pressable
          key={index}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.item,
            {
              backgroundColor: `${brand.primary}10`,
              borderColor: `${brand.primary}10`,
              width: `${(100 / columns) - 3}%` as unknown as number,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Icon name={item.icon as keyof typeof Icon.glyphMap} size={28} color={brand.primary} />
          <Text style={[styles.label, { color: palette.text, opacity: 0.7 }]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  item: {
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
