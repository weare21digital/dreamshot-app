import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeMode } from '../../../types/settings';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';

interface ThemePickerProps {
  selectedTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  isLoading?: boolean;
}

type PreviewConfig = {
  background: string;
  surface: string;
  card: string;
  text: string;
  accent: string;
};

const PREVIEW_CONFIG: Record<'light' | 'dark', PreviewConfig> = {
  light: {
    background: '#ffffff',
    surface: '#f7f8fb',
    card: '#e5e7eb',
    text: '#0f172a',
    accent: APP_THEME.brand.primary,
  },
  dark: {
    background: APP_THEME.dark.background,
    surface: APP_THEME.dark.surface,
    card: '#23243a',
    text: '#f8fafc',
    accent: '#7c7aff',
  },
};

const THEME_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright backgrounds and crisp surfaces',
    icon: 'weather-sunny',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'High-contrast night friendly palette',
    icon: 'weather-night',
  },
  {
    value: 'auto',
    label: 'Auto',
    description: 'Follows your system appearance',
    icon: 'theme-light-dark',
  },
];

function PreviewCard({ config }: { config: PreviewConfig }): React.JSX.Element {
  return (
    <View style={[styles.previewCard, { backgroundColor: config.background, borderColor: config.card }]}> 
      <View style={[styles.previewHeader, { backgroundColor: config.surface }]} />
      <View style={styles.previewBody}>
        <View style={[styles.previewChip, { backgroundColor: config.accent }]} />
        <View style={styles.previewLines}>
          <View style={[styles.previewLine, { backgroundColor: config.text, opacity: 0.35 }]} />
          <View style={[styles.previewLine, { backgroundColor: config.text, opacity: 0.2, width: '60%' }]} />
        </View>
      </View>
      <View style={styles.previewFooter}>
        <View style={[styles.previewDot, { backgroundColor: config.accent }]} />
        <View style={[styles.previewDot, { backgroundColor: config.card }]} />
        <View style={[styles.previewDot, { backgroundColor: config.text, opacity: 0.15 }]} />
      </View>
    </View>
  );
}

function ThemePreview({ mode }: { mode: ThemeMode }): React.JSX.Element {
  if (mode === 'auto') {
    return (
      <View style={styles.previewAutoRow}>
        <PreviewCard config={PREVIEW_CONFIG.light} />
        <PreviewCard config={PREVIEW_CONFIG.dark} />
      </View>
    );
  }

  return <PreviewCard config={PREVIEW_CONFIG[mode]} />;
}

export function ThemePicker({ selectedTheme, onThemeChange, isLoading }: ThemePickerProps): React.JSX.Element {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}> 
      <View style={styles.header}>
        <MaterialCommunityIcons name="palette" size={24} color={APP_THEME.brand.primary} />
        <Text style={[styles.title, { color: palette.text }]}>Appearance</Text>
      </View>
      <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Preview each theme before applying it.</Text>

      <View style={styles.optionsContainer}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = selectedTheme === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  borderColor: isSelected ? APP_THEME.brand.primary : palette.border,
                  backgroundColor: isSelected ? palette.primaryContainer : palette.surfaceVariant,
                },
              ]}
              onPress={() => onThemeChange(option.value)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionHeaderLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: isSelected ? palette.secondaryContainer : palette.surface },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={24}
                      color={isSelected ? APP_THEME.brand.primary : palette.textSecondary}
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionLabel, { color: isSelected ? palette.onPrimaryContainer : palette.text }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDescription, { color: palette.textSecondary }]}>{option.description}</Text>
                  </View>
                </View>
                <View style={[styles.radio, { borderColor: isSelected ? APP_THEME.brand.primary : palette.border }]}> 
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: APP_THEME.brand.primary }]} />}
                </View>
              </View>

              <Text style={[styles.previewLabel, { color: palette.textSecondary }]}>Live preview</Text>
              <ThemePreview mode={option.value} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  optionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionTextContainer: {
    flexShrink: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  previewCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  previewHeader: {
    height: 10,
    borderRadius: 999,
  },
  previewBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewChip: {
    width: 32,
    height: 32,
    borderRadius: 12,
  },
  previewLines: {
    flex: 1,
    gap: 8,
  },
  previewLine: {
    height: 8,
    borderRadius: 6,
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  previewAutoRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
