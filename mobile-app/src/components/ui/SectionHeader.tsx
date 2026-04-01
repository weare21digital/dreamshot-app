import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, actionLabel, onAction, style }: SectionHeaderProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: palette.textSecondary }]}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableRipple onPress={onAction} borderless>
          <Text style={[styles.action, { color: brand.primary }]}>{actionLabel}</Text>
        </TouchableRipple>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
  },
});
