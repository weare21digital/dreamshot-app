import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';

export interface ChipOption {
  label: string;
  value: string;
}

interface ChipSelectorProps {
  options: ChipOption[];
  selected?: string;
  onSelect?: (value: string) => void;
  style?: ViewStyle;
}

export function ChipSelector({ options, selected, onSelect, style }: ChipSelectorProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();

  return (
    <View style={[styles.row, style]}>
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect?.(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? `${brand.primary}20` : `${brand.primary}06`,
                borderColor: isSelected ? `${brand.primary}50` : `${brand.primary}12`,
              },
            ]}
          >
            <Text style={[
              styles.label,
              {
                color: isSelected ? brand.primary : palette.text,
                fontWeight: isSelected ? '800' : '600',
              },
            ]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
  },
});
