import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';

interface CompactMetric {
  label: string;
  value: string;
}

interface CompactDataCardProps {
  title: string;
  metrics?: CompactMetric[];
  highlightValue?: string;
  highlightLabel?: string;
  style?: ViewStyle;
}

export function CompactDataCard({
  title,
  metrics,
  highlightValue,
  highlightLabel,
  style,
}: CompactDataCardProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();

  return (
    <View style={[styles.card, {
      backgroundColor: `${brand.primary}06`,
      borderColor: `${brand.primary}12`,
    }, style]}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        {metrics && metrics.length > 0 && (
          <View style={styles.metricsRow}>
            {metrics.map((m, i) => (
              <Text key={i} style={[styles.metric, { color: palette.textSecondary }]}>
                {m.label}: {m.value}
              </Text>
            ))}
          </View>
        )}
      </View>
      {highlightValue && (
        <View style={styles.right}>
          <Text style={[styles.highlightValue, { color: palette.text }]}>{highlightValue}</Text>
          {highlightLabel && (
            <Text style={[styles.highlightLabel, { color: palette.textSecondary }]}>{highlightLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 5,
  },
  metric: {
    fontSize: 10,
    fontWeight: '700',
  },
  right: {
    alignItems: 'flex-end',
  },
  highlightValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  highlightLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
