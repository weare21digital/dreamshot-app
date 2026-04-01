import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View, Platform, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';
import { useCoins } from '../../coins/hooks/useCoins';
import { submitImageGeneration } from '../services/aiImageProviders';

// Legacy compat wrapper — this screen is from the skeleton and not used in RoyalPortrait
const generateAiBackgroundImage = async (request: { imageUri: string; prompt: string; stylePreset: string; backgroundImageUrl?: string }): Promise<string> => {
  const result = await submitImageGeneration(request);
  // This is a stub — the skeleton's background screen would need queue-based polling to work properly
  return result.requestId;
};

const BACKGROUNDS = [
  {
    id: 'beach',
    label: 'Beach / Tropical',
    prompt: 'tropical beach with warm sunlight and soft ocean horizon',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
  },
  {
    id: 'city',
    label: 'City Skyline',
    prompt: 'modern city skyline at golden hour, realistic perspective',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=80',
  },
  {
    id: 'mountain',
    label: 'Mountain Landscape',
    prompt: 'dramatic mountain landscape with natural daylight',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80',
  },
  {
    id: 'studio',
    label: 'Studio Gradient',
    prompt: 'clean studio backdrop with smooth professional gradient',
    thumbnail: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=500&q=80',
  },
  {
    id: 'space',
    label: 'Space / Galaxy',
    prompt: 'deep space galaxy scene with stars and nebulae',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&q=80',
  },
  {
    id: 'forest',
    label: 'Forest / Nature',
    prompt: 'lush green forest with natural depth of field',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80',
  },
  {
    id: 'abstract',
    label: 'Abstract Colorful',
    prompt: 'vibrant abstract colorful artistic background',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80',
  },
] as const;

type BackgroundOption = (typeof BACKGROUNDS)[number];
type StylePreset = 'realistic' | 'anime' | 'cinematic' | 'illustration' | 'fantasy' | 'studio';

const STYLE_PRESETS: Array<{ id: StylePreset; label: string }> = [
  { id: 'realistic', label: 'Realistic' },
  { id: 'anime', label: 'Anime' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'illustration', label: 'Illustration' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'studio', label: 'Studio' },
];

const AI_DEMO_MODE = process.env.EXPO_PUBLIC_AI_BG_DEMO_MODE === '1';
const AI_ALBUM_NAME = 'Mobile Skeleton AI';
const AI_IMAGE_COST = 15;

async function callAiBackgroundApi(imageUri: string, background: BackgroundOption, stylePreset: StylePreset): Promise<string> {
  if (AI_DEMO_MODE) {
    const outputPath = `${FileSystem.cacheDirectory}ai-bg-demo-${Date.now()}.jpg`;
    const downloaded = await FileSystem.downloadAsync(background.thumbnail, outputPath);
    return downloaded.uri;
  }

  return generateAiBackgroundImage({
    imageUri,
    prompt: background.prompt,
    stylePreset,
    backgroundImageUrl: background.thumbnail,
  });
}

export function AiBackgroundScreen(): React.JSX.Element {
  const { palette, brand } = useAppTheme();
  const { balance: coinBalance, hasEnough, spendCoins, reload: reloadCoins } = useCoins();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(BACKGROUNDS[0]);
  const [selectedStylePreset, setSelectedStylePreset] = useState<StylePreset>('realistic');
  const [isApplying, setIsApplying] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<Array<{ id: string; uri: string }>>([]);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [hasFullPhotosAccess, setHasFullPhotosAccess] = useState(true);
  const [showFullAccessPrompt, setShowFullAccessPrompt] = useState(false);

  const canApply = useMemo(
    () => !!sourceImage && !!selectedBackground && !isApplying,
    [sourceImage, selectedBackground, isApplying]
  );

  const promptOpenSettings = (title: string, message: string): void => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings().catch(() => {
            Alert.alert('Unable to open settings', 'Please open iOS Settings manually and allow permissions.');
          });
        },
      },
    ]);
  };

  const hasFullMediaAccess = (permission: MediaLibrary.PermissionResponse): boolean => {
    if (!permission.granted) return false;
    if (Platform.OS !== 'ios') return true;
    const accessPrivileges = (permission as unknown as { accessPrivileges?: string }).accessPrivileges;
    return accessPrivileges === undefined || accessPrivileges === 'all';
  };

  const requestRequiredPermissions = useCallback(async (): Promise<void> => {
    try {
      const camera = await ImagePicker.requestCameraPermissionsAsync();
      const existingLibrary = await MediaLibrary.getPermissionsAsync(false);
      const library = existingLibrary.granted
        ? existingLibrary
        : await MediaLibrary.requestPermissionsAsync(false);

      const ok = camera.granted && library.granted;
      setHasPermissions(ok);

      const fullAccess = hasFullMediaAccess(library);
      setHasFullPhotosAccess(fullAccess);
      setShowFullAccessPrompt(ok && !fullAccess);

      if (!ok && (!camera.canAskAgain || !library.canAskAgain)) {
        promptOpenSettings(
          'Permissions needed',
          'Camera and Photos permissions are required for AI background generation and saving results.'
        );
      }
    } catch {
      setHasPermissions(false);
    }
  }, []);

  const loadGeneratedAssets = useCallback(async (): Promise<void> => {
    try {
      const permission = await MediaLibrary.getPermissionsAsync(false);
      if (!permission.granted) {
        setGeneratedAssets([]);
        setHasFullPhotosAccess(false);
        return;
      }

      const fullAccess = hasFullMediaAccess(permission);
      setHasFullPhotosAccess(fullAccess);
      if (!fullAccess) {
        setShowFullAccessPrompt(true);
        setGeneratedAssets([]);
        return;
      }

      const album = await MediaLibrary.getAlbumAsync(AI_ALBUM_NAME);
      if (!album) {
        setGeneratedAssets([]);
        return;
      }

      const result = await MediaLibrary.getAssetsAsync({
        album,
        sortBy: [MediaLibrary.SortBy.creationTime],
        mediaType: [MediaLibrary.MediaType.photo],
        first: 50,
      });

      const resolved = await Promise.all(
        result.assets.map(async (asset) => {
          const info = await MediaLibrary.getAssetInfoAsync(asset.id);
          return {
            id: asset.id,
            uri: info.localUri || info.uri || asset.uri,
          };
        })
      );
      setGeneratedAssets(resolved);
    } catch {
      setGeneratedAssets([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGeneratedAssets();
    }, [loadGeneratedAssets])
  );

  useEffect(() => {
    requestRequiredPermissions().catch(() => {
      setHasPermissions(false);
    });
  }, [requestRequiredPermissions]);

  const pickFromLibrary = async (): Promise<void> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          promptOpenSettings(
            'Photo permission needed',
            'Please enable Photos access in Settings to choose an image.'
          );
        } else {
          Alert.alert('Permission needed', 'Please allow photo library access to pick an image.');
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSourceImage(result.assets[0].uri);
        setResultImage(null);
      }
    } catch (error) {
      Alert.alert('Gallery error', error instanceof Error ? error.message : 'Failed to open photo library');
    }
  };

  const pickFromCamera = async (): Promise<void> => {
    try {
      if (Platform.OS === 'ios') {
        const available = await ImagePicker.getCameraPermissionsAsync();
        if (!available.canAskAgain && !available.granted) {
          promptOpenSettings(
            'Camera permission needed',
            'Please enable Camera access in Settings to take a photo.'
          );
          return;
        }
      }

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          promptOpenSettings(
            'Camera permission needed',
            'Please enable Camera access in Settings to take a photo.'
          );
        } else {
          Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSourceImage(result.assets[0].uri);
        setResultImage(null);
      }
    } catch (error) {
      Alert.alert('Camera error', error instanceof Error ? error.message : 'Failed to open camera');
    }
  };

  const applyBackground = async (): Promise<void> => {
    if (!sourceImage) return;

    if (!(await hasEnough(AI_IMAGE_COST))) {
      Alert.alert(
        'Not enough coins',
        `Each AI generation costs ${AI_IMAGE_COST} coins. Please top up to continue.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Purchase Coins',
            onPress: () => router.push('/(main)/coins-purchase'),
          },
        ]
      );
      return;
    }

    try {
      setIsApplying(true);
      const outputUri = await callAiBackgroundApi(sourceImage, selectedBackground, selectedStylePreset);
      setResultImage(outputUri);

      const spent = await spendCoins(AI_IMAGE_COST);
      if (!spent) {
        Alert.alert('Coin update failed', 'Image generated but coin deduction failed. Please try again.');
      } else {
        await reloadCoins();
      }
    } catch (error) {
      Alert.alert('AI processing failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsApplying(false);
    }
  };

  const saveImage = async (): Promise<void> => {
    if (!resultImage) return;

    try {
      // Write permission is enough for saving to Photos.
      const writePermission = await MediaLibrary.requestPermissionsAsync(true);
      if (!writePermission.granted) {
        if (!writePermission.canAskAgain) {
          promptOpenSettings(
            'Photos permission needed',
            'Please enable Photos access in Settings so the app can save images.'
          );
        } else {
          Alert.alert('Permission needed', 'Please allow Photos access to save the edited image.');
        }
        return;
      }

      // Always save to Photos first (works even when full read access is unavailable)
      await MediaLibrary.saveToLibraryAsync(resultImage);

      // Try album placement + in-app list only when full media access is granted.
      const readPermission = await MediaLibrary.getPermissionsAsync(false);
      const fullAccess = hasFullMediaAccess(readPermission);
      setHasFullPhotosAccess(fullAccess);

      if (fullAccess) {
        const asset = await MediaLibrary.createAssetAsync(resultImage);
        const existingAlbum = await MediaLibrary.getAlbumAsync(AI_ALBUM_NAME);
        if (existingAlbum) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], existingAlbum, false);
        } else {
          await MediaLibrary.createAlbumAsync(AI_ALBUM_NAME, asset, false);
        }
        await loadGeneratedAssets();
        Alert.alert('Saved', `Image saved to Photos in album: ${AI_ALBUM_NAME}.`);
      } else {
        setShowFullAccessPrompt(true);
        Alert.alert(
          'Saved',
          'Image saved to Photos. To show your saved images in-app, allow Full Photos access in Settings.',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings().catch(() => {}),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Could not save image to Photos.');
    }
  };

  const shareImage = async (): Promise<void> => {
    if (!resultImage) return;

    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Unavailable', 'Sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(resultImage);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={[styles.title, { color: palette.text }]}>AI Background Changer</Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Pick a photo, choose a background, and generate an AI-edited result.</Text>
          <View style={[styles.coinBar, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
            <Text testID="ai-bg-coin-balance" style={{ color: palette.text, fontWeight: '600' }}>🪙 Balance: {coinBalance} coins</Text>
            <Button mode="text" compact onPress={() => router.push('/(main)/coins-purchase')} textColor={brand.primary}>
              Buy more
            </Button>
          </View>
          <Text style={[styles.costText, { color: palette.textSecondary }]}>Cost per generation: {AI_IMAGE_COST} coins</Text>

          {hasPermissions === false && (
            <Card style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}> 
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>Permissions required</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Please allow Camera and Photos access to use this feature.</Text>
                <View style={{ marginTop: 10 }}>
                  <Button mode="contained" onPress={requestRequiredPermissions} buttonColor={brand.primary} textColor={palette.onPrimary}>
                    Grant permissions
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}

          <Card style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>1) Choose Photo</Text>
              <View style={styles.rowButtons}>
                <Button testID="ai-bg-pick-gallery" mode="outlined" onPress={pickFromLibrary} icon="image" style={styles.actionButton}>Gallery</Button>
                <Button testID="ai-bg-pick-camera" mode="outlined" onPress={pickFromCamera} icon="camera" style={styles.actionButton}>Camera</Button>
              </View>

              {sourceImage && <Image testID="ai-bg-source-preview" source={{ uri: sourceImage }} style={styles.previewImage} resizeMode="cover" />}
            </Card.Content>
          </Card>

          <Card style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>2) Select Background</Text>
              <View style={styles.grid}>
                {BACKGROUNDS.map((bg) => {
                  const selected = bg.id === selectedBackground.id;
                  return (
                    <TouchableOpacity
                      testID={`ai-bg-option-${bg.id}`}
                      key={bg.id}
                      activeOpacity={0.85}
                      onPress={() => setSelectedBackground(bg)}
                      style={[
                        styles.thumbnailCard,
                        { borderColor: selected ? brand.primary : palette.borderVariant },
                      ]}
                    >
                      <ImageBackground source={{ uri: bg.thumbnail }} style={styles.thumbnailImage} imageStyle={styles.thumbnailImageInner}>
                        <View style={styles.thumbnailOverlay}>
                          <Text style={[styles.thumbnailLabel, { color: '#fff' }]}>{bg.label}</Text>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>3) Select Style</Text>
              <View style={styles.styleRow}>
                {STYLE_PRESETS.map((preset) => {
                  const selected = preset.id === selectedStylePreset;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      testID={`ai-bg-style-${preset.id}`}
                      activeOpacity={0.85}
                      onPress={() => setSelectedStylePreset(preset.id)}
                      style={[
                        styles.styleChip,
                        {
                          borderColor: selected ? brand.primary : palette.borderVariant,
                          backgroundColor: selected ? `${brand.primary}22` : palette.cardBackground,
                        },
                      ]}
                    >
                      <Text style={{ color: selected ? brand.primary : palette.text, fontWeight: selected ? '700' : '600' }}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card.Content>
          </Card>

          <Button
            testID="ai-bg-apply"
            mode="contained"
            onPress={applyBackground}
            disabled={!canApply}
            loading={isApplying}
            style={styles.applyButton}
            buttonColor={brand.primary}
            textColor={palette.onPrimary}
            icon="auto-fix"
          >
            {`Apply · ${AI_IMAGE_COST} 🪙`}
          </Button>

          {AI_DEMO_MODE && (
            <Text testID="ai-bg-demo-warning" style={[styles.warningText, { color: '#0f766e' }]}>
              Demo mode enabled. Apply uses sample backgrounds without calling AI API.
            </Text>
          )}


          {resultImage && (
            <Card style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}> 
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>4) Result</Text>
                <Image testID="ai-bg-result-preview" source={{ uri: resultImage }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.rowButtons}>
                  <Button testID="ai-bg-save" mode="contained" onPress={saveImage} icon="content-save" style={styles.actionButton} buttonColor={brand.primary} textColor={palette.onPrimary}>Save</Button>
                  <Button testID="ai-bg-share" mode="outlined" onPress={shareImage} icon="share-variant" style={styles.actionButton}>Share</Button>
                </View>
              </Card.Content>
            </Card>
          )}

          {!hasFullPhotosAccess && showFullAccessPrompt && (
            <Card style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}> 
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>Show saved images in app</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Give Full Photos access so the app can read your {AI_ALBUM_NAME} album and display it here.</Text>
                <View style={styles.rowButtons}>
                  <Button mode="outlined" onPress={() => setShowFullAccessPrompt(false)} style={styles.actionButton}>Continue</Button>
                  <Button mode="contained" onPress={() => Linking.openSettings()} style={styles.actionButton} buttonColor={brand.primary} textColor={palette.onPrimary}>Open Settings</Button>
                </View>
              </Card.Content>
            </Card>
          )}

          <Card style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}> 
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>My AI Images ({generatedAssets.length})</Text>
              {generatedAssets.length === 0 ? (
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  {hasFullPhotosAccess ? 'Save a generated image to see it here.' : `Saved images are in Photos. Enable Full Photos access to show ${AI_ALBUM_NAME} here.`}
                </Text>
              ) : (
                <View style={styles.savedGrid}>
                  {generatedAssets.map((asset) => (
                    <Image key={asset.id} source={{ uri: asset.uri }} style={styles.savedImage} resizeMode="cover" />
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      {isApplying && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={[styles.loadingCard, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
            <ActivityIndicator size="large" color={brand.primary} />
            <Text style={[styles.loadingTitle, { color: palette.text }]}>Generating image...</Text>
            <Text style={[styles.loadingSubtitle, { color: palette.textSecondary }]}>This can take up to 30-45 seconds.</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  title: { fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  costText: { fontSize: 12, fontWeight: '600' },
  coinBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: APP_THEME.shape.borderRadius,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  card: {
    borderRadius: APP_THEME.shape.borderRadius,
    borderWidth: 1,
  },
  sectionTitle: { fontWeight: '700', marginBottom: 10 },
  rowButtons: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionButton: { flex: 1 },
  previewImage: { width: '100%', height: 260, borderRadius: 12, backgroundColor: '#E0E0E0' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbnailCard: {
    width: '48%',
    height: 104,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  thumbnailImage: { flex: 1, justifyContent: 'flex-end' },
  thumbnailImageInner: { borderRadius: 10 },
  thumbnailOverlay: { backgroundColor: 'rgba(0,0,0,0.42)', padding: 8 },
  thumbnailLabel: { fontSize: 12, fontWeight: '700' },
  applyButton: { marginTop: 4, borderRadius: APP_THEME.shape.borderRadius },
  styleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  savedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  savedImage: {
    width: 104,
    height: 104,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  warningText: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: APP_THEME.shape.borderRadius,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  loadingSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
