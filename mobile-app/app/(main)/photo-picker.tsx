import React, { useCallback, useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { APP_THEME } from '../../src/config/theme';
import { getStylePreviewSource, DREAMSHOT_STYLE_PRESETS_BY_ID } from '../../src/config/styles';
import { useAppTheme } from '../../src/contexts/ThemeContext';

export default function PhotoPickerScreen(): React.JSX.Element {
  const { styleId, mode, animStyle } = useLocalSearchParams<{ styleId?: string; mode?: 'photo' | 'video'; animStyle?: string }>();
  const style = (styleId && DREAMSHOT_STYLE_PRESETS_BY_ID[styleId]) || Object.values(DREAMSHOT_STYLE_PRESETS_BY_ID)[0];
  const { palette, brand } = useAppTheme();
  const styles = React.useMemo(() => createStyles(palette, brand), [palette, brand]);

  const navigateToGeneration = useCallback((imageUri: string) => {
    router.push({
      pathname: '/(main)/generation-progress',
      params: { styleId: style.id, mode: mode ?? 'photo', imageUri, animStyle },
    });
  }, [mode, animStyle, style.id]);

  const handleTakePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera Access', 'Please allow camera access in Settings to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      navigateToGeneration(result.assets[0].uri);
    }
  }, [navigateToGeneration]);

  const handlePickFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo Library', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      navigateToGeneration(result.assets[0].uri);
    }
  }, [navigateToGeneration]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <Text style={styles.brand}>DREAMSHOT</Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>Frame Your Face</Text>
          <View style={styles.goldRule} />
        </View>

        <View style={styles.previewWrap}>
          <ImageBackground source={getStylePreviewSource(style)} resizeMode="cover" style={styles.preview} imageStyle={styles.previewImage}>
            <View style={styles.cropGuideOuter}>
              <View style={styles.cropGuideInner}>
                <Text style={styles.faceHint}>◌</Text>
              </View>
            </View>
            <View style={styles.cameraChip}>
              <Text style={styles.cameraChipText}>📷</Text>
            </View>
          </ImageBackground>
        </View>

        <Text style={styles.hintText}>
          Position your face within the golden guide for the best DreamShot results. Natural lighting works best.
        </Text>

        <View style={styles.actions}>
          <Pressable
            testID="continue-generation"
            style={styles.primaryBtn}
            onPress={() => void handleTakePhoto()}
          >
            <Text style={styles.primaryBtnText}>Take Photo</Text>
          </Pressable>

          <Pressable
            testID="picker-gallery"
            style={styles.secondaryBtn}
            onPress={() => void handlePickFromGallery()}
          >
            <Text style={styles.secondaryBtnText}>Upload from Gallery</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Secure & Private Processing</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette'], brand: ReturnType<typeof useAppTheme>['brand']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    content: { paddingBottom: 24 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 10,
    },
    iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    iconText: { fontSize: 24, color: palette.text },
    brand: {
      color: palette.text,
      fontWeight: '700',
      letterSpacing: 1.5,
      fontSize: 12,
    },
    titleWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 16 },
    title: { color: palette.text, fontSize: 34, fontWeight: '700', fontFamily: 'SpaceGrotesk_700Bold' },
    goldRule: { marginTop: 8, width: 52, height: 4, borderRadius: 999, backgroundColor: brand.accent },
    previewWrap: { paddingHorizontal: 18 },
    preview: {
      aspectRatio: 1,
      borderWidth: 4,
      borderColor: palette.border,
      borderRadius: APP_THEME.shape.borderRadiusLarge,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewImage: { borderRadius: APP_THEME.shape.borderRadiusLarge },
    cropGuideOuter: {
      width: 230,
      height: 300,
      borderRadius: 120,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: brand.accent,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
    cropGuideInner: { width: 150, height: 180, alignItems: 'center', justifyContent: 'center' },
    faceHint: { fontSize: 70, color: brand.accent },
    cameraChip: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: palette.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraChipText: { color: brand.accent, fontSize: 16 },
    hintText: {
      marginTop: 16,
      marginHorizontal: 24,
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      color: palette.textSecondary,
    },
    actions: { paddingHorizontal: 24, gap: 12, marginTop: 18 },
    primaryBtn: {
      height: 56,
      borderRadius: 14,
      backgroundColor: brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: { color: palette.onPrimary, fontSize: 16, fontWeight: '700' },
    secondaryBtn: {
      height: 56,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryBtnText: { color: palette.text, fontSize: 16, fontWeight: '700' },
    footer: { marginTop: 20, alignItems: 'center' },
    footerText: { color: palette.textSecondary, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  });