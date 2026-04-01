import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, RadioButton, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppLanguage } from '../../../contexts';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { SupportedLanguage } from '../../../types/settings';

/**
 * Language Settings Screen for selecting app language.
 * Allows manual language selection or automatic detection based on IP location.
 */
export function LanguageSettingsScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const {
    currentLanguage,
    isManuallySet,
    isLoading,
    t,
    setLanguage,
    resetToAuto,
    getSupportedLanguages,
  } = useAppLanguage();

  // Value for the radio group - 'auto' if not manually set, otherwise the current language
  const selectedValue = isManuallySet ? currentLanguage : 'auto';

  const handleSelectionChange = async (value: string): Promise<void> => {
    try {
      if (value === 'auto') {
        await resetToAuto();
      } else {
        await setLanguage(value as SupportedLanguage);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const supportedLanguages = getSupportedLanguages();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header with back button */}
          <View style={styles.header}>
            <Button
              icon="arrow-left"
              mode="text"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              {t('common.back')}
            </Button>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
              {t('languageSettings.title')}
            </Text>
          </View>

          {/* Language Selection */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('languageSettings.selectLanguage')}
              </Text>

              <RadioButton.Group
                onValueChange={handleSelectionChange}
                value={selectedValue}
              >
                {/* Automatic Option */}
                <List.Item
                  title={t('languageSettings.automatic')}
                  description={t('languageSettings.automaticDescription')}
                  left={() => (
                    <RadioButton
                      value="auto"
                      status={selectedValue === 'auto' ? 'checked' : 'unchecked'}
                    />
                  )}
                  onPress={() => handleSelectionChange('auto')}
                  style={styles.languageItem}
                />

                {/* Language Options */}
                {supportedLanguages.map((lang) => (
                  <List.Item
                    key={lang.code}
                    title={lang.nativeName}
                    description={lang.name}
                    left={() => (
                      <RadioButton
                        value={lang.code}
                        status={selectedValue === lang.code ? 'checked' : 'unchecked'}
                      />
                    )}
                    onPress={() => handleSelectionChange(lang.code)}
                    style={styles.languageItem}
                  />
                ))}
              </RadioButton.Group>
            </Card.Content>
          </Card>

          {/* Info about auto detection */}
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content>
              <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onPrimaryContainer }]}>
                {t('languageSettings.autoDetectDescription')}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    marginTop: 8,
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  languageItem: {
    paddingVertical: 4,
  },
  infoText: {
    opacity: 0.9,
    lineHeight: 18,
  },
});

