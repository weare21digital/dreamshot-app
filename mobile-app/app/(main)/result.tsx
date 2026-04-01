import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Image, ImageBackground, Modal, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as StoreReview from 'expo-store-review';
import { VideoView, useVideoPlayer } from 'expo-video';
import ViewShot from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANIMATION_STYLES, DREAMSHOT_STYLE_PRESETS_BY_ID } from '../../src/config/styles';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useCoins } from '../../src/features/coins/hooks/useCoins';

const GOLD = '#C9A84C';
const GENERATION_COUNT_KEY = 'royal_generation_count';
const RATING_PROMPTED_KEY = 'royal_rating_prompted';
const RATING_PROMPT_THRESHOLD = 3;
const WATERMARK_MAX_DIMENSION = 1920;
const WATERMARK_FALLBACK_SIZE = { width: 1080, height: 1543 };

export default function ResultScreen(): React.JSX.Element {
  const { styleId, mode, outputUrl } = useLocalSearchParams<{ styleId?: string; mode?: 'photo' | 'video'; outputUrl?: string }>();
  const style = (styleId && DREAMSHOT_STYLE_PRESETS_BY_ID[styleId]) || Object.values(DREAMSHOT_STYLE_PRESETS_BY_ID)[0];
  const mediaUri = outputUrl || style.exampleImageUrl;
  const isVideo = mode === 'video';
  const { palette, brand } = useAppTheme();

  const videoPlayer = useVideoPlayer(isVideo && mediaUri ? { uri: mediaUri } : null, (player) => {
    player.loop = true;
    player.play();
  });
  const isDark = palette.background === '#121316';

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAnimPicker, setShowAnimPicker] = useState(false);
  const [captureSize, setCaptureSize] = useState(WATERMARK_FALLBACK_SIZE);
  const { balance } = useCoins();
  const styles = React.useMemo(() => createStyles(palette, brand, isDark, captureSize), [palette, brand, isDark, captureSize]);

  const portraitOpacity = useRef(new Animated.Value(0)).current;
  const portraitScale = useRef(new Animated.Value(0.95)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const actionsTranslateY = useRef(new Animated.Value(12)).current;
  const revealPlayedRef = useRef(false);
  const watermarkCaptureRef = useRef<any>(null);

  useEffect(() => {
    if (revealPlayedRef.current) {
      return;
    }
    revealPlayedRef.current = true;

    Animated.parallel([
      Animated.timing(portraitOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(portraitScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(actionsOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(actionsTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [actionsOpacity, actionsTranslateY, portraitOpacity, portraitScale]);

  useEffect(() => {
    if (!outputUrl || isVideo) {
      return;
    }

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const prompted = await AsyncStorage.getItem(RATING_PROMPTED_KEY);
          if (prompted === '1') {
            return;
          }

          const currentCountRaw = await AsyncStorage.getItem(GENERATION_COUNT_KEY);
          const currentCount = Number.parseInt(currentCountRaw || '0', 10) || 0;
          const nextCount = currentCount + 1;
          await AsyncStorage.setItem(GENERATION_COUNT_KEY, String(nextCount));

          if (nextCount < RATING_PROMPT_THRESHOLD) {
            return;
          }

          const available = await StoreReview.isAvailableAsync();
          if (!available) {
            return;
          }

          await StoreReview.requestReview();
          await AsyncStorage.setItem(RATING_PROMPTED_KEY, '1');
        } catch {
          // Silent fail: rating prompt must never block result flow.
        }
      })();
    }, 1400);

    return () => clearTimeout(timer);
  }, [isVideo, outputUrl]);

  useEffect(() => {
    if (isVideo) {
      setCaptureSize(WATERMARK_FALLBACK_SIZE);
      return;
    }

    let isCancelled = false;

    Image.getSize(
      mediaUri,
      (width, height) => {
        if (isCancelled || width <= 0 || height <= 0) {
          return;
        }

        const scale = Math.min(1, WATERMARK_MAX_DIMENSION / Math.max(width, height));
        setCaptureSize({
          width: Math.max(1, Math.round(width * scale)),
          height: Math.max(1, Math.round(height * scale)),
        });
      },
      () => {
        if (!isCancelled) {
          setCaptureSize(WATERMARK_FALLBACK_SIZE);
        }
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [isVideo, mediaUri]);

  const captureWatermarkedImage = useCallback(async (): Promise<string> => {
    if (isVideo || !watermarkCaptureRef.current) {
      return mediaUri;
    }

    const captureUri = await watermarkCaptureRef.current.capture?.();
    return captureUri || mediaUri;
  }, [isVideo, mediaUri]);

  const handleShare = useCallback(async () => {
    let tempUri: string | null = null;

    try {
      const shareUri = await captureWatermarkedImage();
      if (shareUri !== mediaUri) {
        tempUri = shareUri;
      }

      await Share.share({
        message: `My DreamShot (${style.title})`,
        url: shareUri,
      });
    } catch {
      Alert.alert('Share unavailable', 'Unable to open share sheet right now.');
    } finally {
      if (tempUri) {
        try {
          await FileSystem.deleteAsync(tempUri, { idempotent: true });
        } catch {
          // Ignore temp cleanup failures.
        }
      }
    }
  }, [captureWatermarkedImage, mediaUri, style.title]);

  const handleGenerateVideoPro = useCallback(() => {
    if (balance < style.videoCost) {
      Alert.alert(
        'Not Enough Coins',
        `You need ${style.videoCost} coins but only have ${balance}. Would you like to buy more?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Coins', onPress: () => router.push('/(tabs)/coins') },
        ],
      );
      return;
    }
    setShowAnimPicker(true);
  }, [balance, style.videoCost]);

  const handleAnimStyleSelected = useCallback((animStyleId: string) => {
    setShowAnimPicker(false);
    router.push({
      pathname: '/(main)/generation-progress',
      params: { styleId: style.id, mode: 'video', imageUri: mediaUri, animStyle: animStyleId },
    });
  }, [mediaUri, style.id]);

  const handleSave = useCallback(async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow photo library access to save your portrait.');
        return;
      }

      let fileUri = mediaUri;

      // If it's a remote URL, download first
      if (mediaUri.startsWith('http')) {
        const ext = isVideo ? 'mp4' : 'png';
        const localPath = `${FileSystem.cacheDirectory}royal-portrait-${Date.now()}.${ext}`;
        const download = await FileSystem.downloadAsync(mediaUri, localPath);
        fileUri = download.uri;
      }

      await MediaLibrary.saveToLibraryAsync(fileUri);
      setSaved(true);
      Alert.alert('Saved!', 'Your dreamshot image has been saved to your photo library.');
    } catch (error) {
      Alert.alert('Save Failed', error instanceof Error ? error.message : 'Could not save the image.');
    } finally {
      setSaving(false);
    }
  }, [mediaUri, isVideo, saving, saved]);

  return (
    <SafeAreaView style={styles.container} testID="result-screen">
      <View style={styles.header}>
        <Pressable onPress={() => router.dismissAll()} style={styles.headerBtn}>
          <MaterialIcons name="close" size={22} color={palette.text} />
        </Pressable>
        <Text style={styles.brand}>ROYAL PORTRAIT</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <Animated.View
          style={[
            styles.imageWrap,
            {
              opacity: portraitOpacity,
              transform: [{ scale: portraitScale }],
            },
          ]}
        >
          {isVideo && videoPlayer ? (
            <>
              <VideoView style={styles.video} player={videoPlayer} nativeControls />
              <View style={styles.styleChipOverlay}>
                <View style={styles.styleChip}>
                  <Text style={styles.styleChipText}>{style.title}</Text>
                </View>
              </View>
            </>
          ) : (
            <ImageBackground source={{ uri: mediaUri }} resizeMode="cover" style={styles.image} imageStyle={styles.imageRadius}>
              <View style={styles.styleChip}>
                <Text style={styles.styleChipText}>{style.title}</Text>
              </View>
            </ImageBackground>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.actionsSection,
            {
              opacity: actionsOpacity,
              transform: [{ translateY: actionsTranslateY }],
            },
          ]}
        >
          {mode !== 'video' ? (
            <Pressable
              testID="generate-video-pro"
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
              onPress={handleGenerateVideoPro}
            >
              <MaterialIcons name="auto-awesome" size={20} color={isDark ? '#1A1A2E' : '#FFFFFF'} style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Generate Video</Text>
            </Pressable>
          ) : null}

          <Pressable
            testID="save-result"
            style={({ pressed }) => [styles.secondaryBtn, saved && styles.savedBtn, pressed && styles.pressed]}
            onPress={() => void handleSave()}
            disabled={saving}
          >
            <MaterialIcons
              name={saved ? 'check-circle' : 'save-alt'}
              size={20}
              color={saved ? '#FFFFFF' : palette.text}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.secondaryBtnText, saved ? styles.savedBtnText : null]}>
              {saving ? 'Saving...' : saved ? 'Saved to Gallery' : 'Save to Gallery'}
            </Text>
          </Pressable>

          <Pressable
            testID="share-result"
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={() => void handleShare()}
          >
            <MaterialIcons name="ios-share" size={20} color={palette.text} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Share</Text>
          </Pressable>

          <Pressable
            testID="go-to-gallery"
            style={({ pressed }) => [styles.tertiaryBtn, pressed && styles.pressed]}
            onPress={() => {
              router.dismissAll();
              setTimeout(() => router.replace('/(tabs)/my-gallery'), 100);
            }}
          >
            <MaterialIcons name="photo-library" size={18} color={palette.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.tertiaryBtnText}>View in Gallery</Text>
          </Pressable>

          <Pressable
            testID="back-to-styles"
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={() => router.replace('/(tabs)')}
          >
            <MaterialIcons name="home" size={20} color={isDark ? '#1A1A2E' : '#FFFFFF'} style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Back to Styles</Text>
          </Pressable>

          <Pressable
            testID="try-another-style"
            style={({ pressed }) => [styles.tertiaryBtn, pressed && styles.pressed]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.tertiaryBtnText}>Try Another Style</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {!isVideo ? (
        <View pointerEvents="none" style={styles.hiddenCaptureWrap}>
          <ViewShot
            ref={watermarkCaptureRef}
            options={{ format: 'png', quality: 1, result: 'tmpfile' }}
            style={styles.hiddenCaptureShot}
          >
            <ImageBackground source={{ uri: mediaUri }} resizeMode="cover" style={styles.hiddenCaptureImage}>
              <View style={styles.hiddenCaptureWatermark}>
                <Text style={styles.hiddenCaptureWatermarkText}>Made with DreamShot</Text>
              </View>
            </ImageBackground>
          </ViewShot>
        </View>
      ) : null}

      {/* Animation style picker modal */}
      <Modal visible={showAnimPicker} transparent animationType="slide" onRequestClose={() => setShowAnimPicker(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAnimPicker(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Choose Animation Style</Text>
            <Text style={styles.modalSubtitle}>Cost: {style.videoCost} coins</Text>
            {ANIMATION_STYLES.map((anim) => (
              <Pressable
                key={anim.id}
                style={({ pressed }) => [styles.animOption, pressed && { opacity: 0.7 }]}
                onPress={() => handleAnimStyleSelected(anim.id)}
              >
                <Text style={styles.animEmoji}>{anim.emoji}</Text>
                <View style={styles.animTextWrap}>
                  <Text style={styles.animLabel}>{anim.label}</Text>
                  <Text style={styles.animDesc} numberOfLines={1}>{anim.promptSuffix}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={palette.textSecondary} />
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (
  palette: ReturnType<typeof useAppTheme>['palette'],
  brand: ReturnType<typeof useAppTheme>['brand'],
  isDark: boolean,
  captureSize: { width: number; height: number },
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    headerBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    brand: { color: palette.text, fontSize: 14, fontWeight: '700', letterSpacing: 1.2 },
    content: { paddingHorizontal: 16, paddingBottom: 30 },
    imageWrap: {
      width: '100%',
      aspectRatio: 0.7,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: isDark ? GOLD : palette.border,
    },
    image: { flex: 1, justifyContent: 'flex-end' },
    imageRadius: { borderRadius: 13 },
    video: { flex: 1, borderRadius: 13 },
    styleChipOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
    styleChip: {
      alignSelf: 'flex-start',
      margin: 12,
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    styleChipText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12, letterSpacing: 0.6 },
    actionsSection: { paddingTop: 16, gap: 12 },
    primaryBtn: {
      height: 54,
      borderRadius: 13,
      backgroundColor: isDark ? GOLD : '#1A1A4E',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    savedBtn: { backgroundColor: isDark ? '#4CAF50' : '#2E7D32' },
    primaryBtnText: { color: isDark ? '#1A1A2E' : '#FFFFFF', fontSize: 16, fontWeight: '700' },
    secondaryBtn: {
      height: 54,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    secondaryBtnText: { color: palette.text, fontSize: 16, fontWeight: '700' },
    savedBtnText: { color: '#FFFFFF' },
    tertiaryBtn: {
      height: 48,
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tertiaryBtnText: { color: palette.textSecondary, fontSize: 15, fontWeight: '700' },
    pressed: { opacity: 0.8 },
    hiddenCaptureWrap: {
      position: 'absolute',
      left: -4000,
      top: -4000,
      opacity: 0,
    },
    hiddenCaptureShot: {
      width: captureSize.width,
      height: captureSize.height,
      backgroundColor: '#000000',
    },
    hiddenCaptureImage: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      paddingRight: Math.round(captureSize.width * 0.026),
      paddingBottom: Math.round(captureSize.height * 0.022),
    },
    hiddenCaptureWatermark: {
      borderRadius: Math.round(captureSize.width * 0.013),
      backgroundColor: 'rgba(0,0,0,0.25)',
      paddingHorizontal: Math.round(captureSize.width * 0.013),
      paddingVertical: Math.round(captureSize.height * 0.005),
    },
    hiddenCaptureWatermarkText: {
      color: '#FFFFFF',
      fontSize: Math.max(16, Math.round(captureSize.width * 0.028)),
      fontWeight: '700',
      opacity: 0.42,
      textShadowColor: 'rgba(0,0,0,0.65)',
      textShadowOffset: { width: 0, height: Math.max(1, Math.round(captureSize.height * 0.0013)) },
      textShadowRadius: Math.max(1, Math.round(captureSize.width * 0.003)),
      letterSpacing: 0.3,
    },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: palette.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 40,
    },
    modalTitle: { color: palette.text, fontSize: 20, fontWeight: '800', fontFamily: 'serif' },
    modalSubtitle: { color: palette.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 16 },
    animOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: palette.borderVariant,
      gap: 12,
    },
    animEmoji: { fontSize: 28 },
    animTextWrap: { flex: 1 },
    animLabel: { color: palette.text, fontSize: 15, fontWeight: '700' },
    animDesc: { color: palette.textSecondary, fontSize: 12, marginTop: 2 },
  });
