import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { DREAMSHOT_STYLE_PRESETS, DREAMSHOT_STYLE_PRESETS_BY_ID } from '../../src/config/styles';
import { useAppTheme } from '../../src/contexts/ThemeContext';

type AspectRatio = '1:1' | '4:3' | '16:9' | '9:16';

const ASPECTS: AspectRatio[] = ['1:1', '4:3', '16:9', '9:16'];
const ASPECT_PREVIEW_SIZES: Record<AspectRatio, { width: number; height: number }> = {
  '1:1': { width: 42, height: 42 },
  '4:3': { width: 48, height: 36 },
  '16:9': { width: 56, height: 32 },
  '9:16': { width: 30, height: 52 },
};

export default function StyleDetailScreen(): React.JSX.Element {
  const { styleId } = useLocalSearchParams<{ styleId?: string }>();
  const defaultStyle = (styleId && DREAMSHOT_STYLE_PRESETS_BY_ID[styleId]) || DREAMSHOT_STYLE_PRESETS[0];
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [prompt, setPrompt] = useState('Dreamy cinematic portrait with soft neon rim light and rich details');
  const [focused, setFocused] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState(defaultStyle.id);
  const [selectedAspect, setSelectedAspect] = useState<AspectRatio>('16:9');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const openSettings = useCallback(async (): Promise<void> => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert('Settings', 'Unable to open Settings automatically. Please open Settings manually.');
    }
  }, []);

  const handleBlockedPermission = useCallback((title: string, message: string): void => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => void openSettings() },
    ]);
  }, [openSettings]);

  const handleTakePhoto = async (): Promise<void> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      if (permission.canAskAgain) {
        Alert.alert('Camera Access', 'Please allow camera access to take a photo.');
      } else {
        handleBlockedPermission('Camera Access Blocked', 'Camera access is blocked. Enable it in Settings to take a photo.');
      }
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const handlePickFromGallery = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      if (permission.canAskAgain) {
        Alert.alert('Photo Library', 'Please allow photo library access to upload an image.');
      } else {
        handleBlockedPermission('Photo Library Blocked', 'Photo library access is blocked. Enable it in Settings to upload an image.');
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <MaterialIcons name="arrow-back" size={22} color={palette.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Create</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={[styles.promptGlow, focused && styles.promptGlowActive]}>
          <View style={[styles.promptCard, focused && styles.promptCardActive]}>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={styles.promptInput}
              multiline
              placeholder="Describe what you want to see..."
              placeholderTextColor={palette.textSecondary}
            />
            <View style={styles.promptFooter}>
              <View style={styles.promptActions}>
                <Pressable style={styles.promptIconButton}>
                  <MaterialIcons name="history-edu" size={19} color="#CC97FF" />
                </Pressable>
                <Pressable style={styles.promptIconButton}>
                  <MaterialIcons name="auto-fix-high" size={19} color="#CC97FF" />
                </Pressable>
              </View>
              <Text style={styles.engineLabel}>AI ENGINE v4.2</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Your Photo</Text>
        </View>
        <View style={styles.photoPickerCard}>
          <View style={styles.photoPreviewWrap}>
            {selectedImageUri ? (
              <Image source={{ uri: selectedImageUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcons name="add-a-photo" size={28} color="#CC97FF" />
                <Text style={styles.photoPlaceholderText}>Select a photo to continue</Text>
              </View>
            )}
          </View>
          <View style={styles.photoActions}>
            <Pressable onPress={() => void handleTakePhoto()} style={({ pressed }) => [styles.photoActionBtn, pressed && styles.pressed]}>
              <MaterialIcons name="photo-camera" size={16} color="#53DDFC" />
              <Text style={styles.photoActionBtnText}>Take Photo</Text>
            </Pressable>
            <Pressable onPress={() => void handlePickFromGallery()} style={({ pressed }) => [styles.photoActionBtn, pressed && styles.pressed]}>
              <MaterialIcons name="photo-library" size={16} color="#53DDFC" />
              <Text style={styles.photoActionBtnText}>Upload</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Style Selector</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
          {DREAMSHOT_STYLE_PRESETS.slice(0, 8).map((item) => {
            const active = item.id === selectedStyleId;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedStyleId(item.id)}
                style={({ pressed }) => [styles.styleChip, active && styles.styleChipActive, pressed && styles.pressed]}
              >
                <Text style={[styles.styleChipText, active && styles.styleChipTextActive]}>{item.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Aspect Ratio</Text>
        </View>
        <View style={styles.aspectGrid}>
          {ASPECTS.map((ratio) => {
            const active = ratio === selectedAspect;
            return (
              <Pressable
                key={ratio}
                onPress={() => setSelectedAspect(ratio)}
                style={({ pressed }) => [styles.aspectCard, active && styles.aspectCardActive, pressed && styles.pressed]}
              >
                <View
                  style={[
                    styles.aspectPreview,
                    {
                      width: ASPECT_PREVIEW_SIZES[ratio].width,
                      height: ASPECT_PREVIEW_SIZES[ratio].height,
                    },
                    active && styles.aspectPreviewActive,
                  ]}
                />
                <Text style={[styles.aspectText, active && styles.aspectTextActive]}>{ratio}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <Pressable
          disabled={!selectedImageUri}
          onPress={() => {
            if (!selectedImageUri) {
              return;
            }

            router.push({
              pathname: '/(main)/generation-progress',
              params: {
                styleId: selectedStyleId,
                mode: 'photo',
                prompt,
                aspect: selectedAspect,
                imageUri: selectedImageUri,
              },
            });
          }}
          style={({ pressed }) => [styles.generateBtnWrap, !selectedImageUri && styles.generateBtnWrapDisabled, pressed && styles.pressed]}
        >
          <LinearGradient colors={['#9C48EA', '#53DDFC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.generateBtn}>
            <MaterialIcons name="auto-awesome" size={18} color="#000000" />
            <Text style={styles.generateBtnText}>Generate</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    content: { paddingBottom: 120 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: palette.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24 },
    promptGlow: {
      marginHorizontal: 16,
      marginTop: 10,
      borderRadius: 18,
      backgroundColor: 'rgba(83,221,252,0.04)',
      padding: 1,
    },
    promptGlowActive: {
      backgroundColor: 'rgba(156,72,234,0.35)',
      shadowColor: '#9C48EA',
      shadowOpacity: 0.4,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
    },
    promptCard: {
      borderRadius: 18,
      backgroundColor: '#000000',
      minHeight: 180,
    },
    promptCardActive: {
      backgroundColor: '#091328',
    },
    promptInput: {
      color: palette.text,
      fontSize: 19,
      lineHeight: 27,
      minHeight: 132,
      paddingHorizontal: 16,
      paddingTop: 16,
      textAlignVertical: 'top',
    },
    promptFooter: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    promptActions: { flexDirection: 'row', gap: 8 },
    promptIconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: '#141F38',
      alignItems: 'center',
      justifyContent: 'center',
    },
    engineLabel: {
      color: palette.textSecondary,
      fontSize: 10,
      letterSpacing: 1.5,
      fontFamily: 'Inter_700Bold',
    },
    sectionHead: { paddingHorizontal: 16, marginTop: 24, marginBottom: 10 },
    sectionTitle: { color: palette.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 },
    photoPickerCard: {
      marginHorizontal: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: 'rgba(109,117,140,0.3)',
      backgroundColor: '#0F1930',
      padding: 12,
      gap: 12,
    },
    photoPreviewWrap: {
      height: 180,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(109,117,140,0.35)',
      backgroundColor: '#091328',
    },
    photoPreview: {
      width: '100%',
      height: '100%',
    },
    photoPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    photoPlaceholderText: {
      color: palette.textSecondary,
      fontFamily: 'Inter_700Bold',
      fontSize: 13,
    },
    photoActions: {
      flexDirection: 'row',
      gap: 8,
    },
    photoActionBtn: {
      flex: 1,
      minHeight: 42,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#53DDFC',
      backgroundColor: '#141F38',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    photoActionBtnText: {
      color: '#53DDFC',
      fontFamily: 'Inter_700Bold',
      fontSize: 13,
    },
    chipsWrap: { paddingHorizontal: 16, gap: 8 },
    styleChip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: '#141F38',
    },
    styleChipActive: {
      backgroundColor: '#53DDFC',
    },
    styleChipText: { color: palette.textSecondary, fontSize: 12, fontFamily: 'Inter_700Bold' },
    styleChipTextActive: { color: '#003A45' },
    aspectGrid: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    aspectCard: {
      width: '47.5%',
      minHeight: 86,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(109,117,140,0.3)',
      backgroundColor: '#0F1930',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
    },
    aspectCardActive: {
      borderColor: '#53DDFC',
      backgroundColor: '#141F38',
    },
    aspectPreview: {
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'rgba(109,117,140,0.7)',
      backgroundColor: 'rgba(83,221,252,0.08)',
    },
    aspectPreviewActive: {
      borderColor: '#53DDFC',
      backgroundColor: 'rgba(83,221,252,0.22)',
    },
    aspectText: { color: palette.textSecondary, fontFamily: 'Inter_700Bold' },
    aspectTextActive: { color: '#53DDFC' },
    stickyFooter: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 22,
    },
    generateBtnWrap: { borderRadius: 999, overflow: 'hidden' },
    generateBtnWrapDisabled: { opacity: 0.45 },
    generateBtn: {
      minHeight: 56,
      borderRadius: 999,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    generateBtnText: {
      color: '#000000',
      fontFamily: 'SpaceGrotesk_700Bold',
      fontSize: 18,
    },
    pressed: { opacity: 0.86 },
  });
