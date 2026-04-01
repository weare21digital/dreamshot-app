import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';
import { MaterialIcons as Icon } from '@expo/vector-icons';

interface InfoBannerProps {
  icon?: string;
  message: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<string, string> = {
  info: '#3B82F6',
  warning: '#F59E0B',
  success: '#22C55E',
  error: '#EF4444',
};

export function InfoBanner({ icon = 'info', message, variant = 'info', style }: InfoBannerProps): React.JSX.Element {
  const { palette } = useAppTheme();
  const color = VARIANT_COLORS[variant] ?? VARIANT_COLORS.info;

  return (
    <View style={[styles.banner, {
      backgroundColor: `${color}10`,
      borderColor: `${color}20`,
    }, style]}>
      <Icon name={icon as keyof typeof Icon.glyphMap} size={20} color={color} style={styles.icon} />
      <Text style={[styles.message, { color: palette.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  icon: {
    marginTop: 1,
  },
  message: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
  },
});
