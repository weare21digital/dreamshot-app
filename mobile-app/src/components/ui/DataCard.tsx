import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';
import { MetricBadge } from './MetricBadge';

export interface DataCardMetric {
  label: string;
  value: string;
  color?: string;
}

interface DataCardProps {
  title: string;
  subtitle?: string;
  highlightValue?: string;
  highlightLabel?: string;
  metrics?: DataCardMetric[];
  onPress?: () => void;
  style?: ViewStyle;
}

export function DataCard({
  title,
  subtitle,
  highlightValue,
  highlightLabel,
  metrics,
  style,
}: DataCardProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();

  return (
    <View style={[styles.card, {
      backgroundColor: `${brand.primary}06`,
      borderColor: `${brand.primary}12`,
    }, style]}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: `${brand.primary}30` }]} />

      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{subtitle}</Text>}
          </View>
          {highlightValue && (
            <View style={[styles.highlightBadge, { backgroundColor: brand.primary }]}>
              <Text style={[styles.highlightText, { color: palette.onPrimary }]}>
                {highlightValue} {highlightLabel}
              </Text>
            </View>
          )}
        </View>
        {metrics && metrics.length > 0 && (
          <View style={styles.metricsRow}>
            {metrics.map((metric, index) => (
              <MetricBadge key={index} label={metric.label} value={metric.value} color={metric.color} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  highlightBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
