import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme } from '../../contexts/ThemeContext';

interface ProgressRingProps {
  /** 0-100 */
  progress: number;
  value: string;
  label?: string;
  size?: number;
  strokeWidth?: number;
  /** Ring color — defaults to brand.primary */
  color?: string;
  style?: ViewStyle;
}

export function ProgressRing({
  progress,
  value,
  label,
  size = 64,
  strokeWidth = 6,
  color,
  style,
}: ProgressRingProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();
  const ringColor = color ?? brand.primary;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 100) / 100);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.surfaceVariant}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.valueOverlay}>
          <Text style={[styles.value, { color: palette.text }]}>{value}</Text>
        </View>
      </View>
      {label && <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  valueOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 12,
    fontWeight: '800',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
