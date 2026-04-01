import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Button, Card, Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { APP_THEME } from '../../../config/theme';
import { useCoins } from '../../coins/hooks/useCoins';
import { useVideoGeneration, type VideoDanceStyle } from '../hooks/useVideoGeneration';

const VIDEO_COST = 60;
const VIDEO_ALBUM_NAME = 'Mobile Skeleton AI Videos';

const DANCE_STYLES: VideoDanceStyle[] = [
  { id: 'fun', label: '🎉 Fun Dance', prompt: 'A joyful upbeat dance, playful and energetic movements.', icon: 'emoticon-happy-outline' },
  { id: 'smooth', label: '🎵 Smooth', prompt: 'Smooth rhythmic dance moves, stylish and controlled.', icon: 'music-note-eighth' },
  { id: 'party', label: '🥳 Party', prompt: 'High energy party dance with dynamic and expressive motion.', icon: 'party-popper' },
  { id: 'elegant', label: '✨ Elegant', prompt: 'Graceful elegant dance with refined fluid choreography.', icon: 'star-four-points-outline' },
];

type ScreenMode = 'gallery' | 'generate';

export function AiDanceScreen(): React.JSX.Element {
  const { palette, brand } = useAppTheme();
  const { balance, reload } = useCoins();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const { jobs, isRestoring, isSubmitting, hasPendingJobs, latestJob, submit, cancel, clearHistory } = useVideoGeneration();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<VideoDanceStyle>(DANCE_STYLES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVideoJobId, setSelectedVideoJobId] = useState<string | null>(null);

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.status === 'completed' && !!job.videoUrl),
    [jobs]
  );

  const hasVideos = completedJobs.length > 0;

  // Default to gallery if user has videos, generate if not
  const [mode, setMode] = useState<ScreenMode>(hasVideos ? 'gallery' : 'generate');

  // Auto-select newly completed video only during active generation
  const [waitingForCompletion, setWaitingForCompletion] = useState(false);
  React.useEffect(() => {
    if (hasPendingJobs) {
      setWaitingForCompletion(true);
    }
  }, [hasPendingJobs]);
  React.useEffect(() => {
    if (waitingForCompletion && latestJob?.status === 'completed' && latestJob.videoUrl) {
      setSelectedVideoJobId(latestJob.requestId);
      setWaitingForCompletion(false);
    }
  }, [waitingForCompletion, latestJob]);

  // Video to play: selected from list, or latest completed
  const activeJob = useMemo(() => {
    if (selectedVideoJobId) {
      return completedJobs.find((j) => j.requestId === selectedVideoJobId) || null;
    }
    return null;
  }, [selectedVideoJobId, completedJobs]);

  const activeVideoUrl = activeJob?.videoUrl || null;

  const videoPlayer = useVideoPlayer(activeVideoUrl ? { uri: activeVideoUrl } : null, (player) => {
    player.loop = true;
    player.play();
  });

  const pickFromLibrary = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to choose a source photo.');
      return;
    }

    const selected = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
    });

    if (!selected.canceled && selected.assets[0]?.uri) {
      setSourceImage(selected.assets[0].uri);
    }
  };

  const startGeneration = async (): Promise<void> => {
    if (!sourceImage) {
      Alert.alert('Select a photo', 'Please choose a source photo first.');
      return;
    }

    try {
      await submit({
        imageUri: sourceImage,
        danceStyle: selectedStyle,
        coinsCost: VIDEO_COST,
      });
      await reload();
    } catch (error) {
      Alert.alert('Generation failed', error instanceof Error ? error.message : 'Failed to submit generation request.');
    }
  };

  const saveVideo = async (): Promise<void> => {
    if (!activeVideoUrl || isSaving) return;

    setIsSaving(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow Photos access to save generated videos.');
        return;
      }

      const destination = `${FileSystem.cacheDirectory}ai-video-${Date.now()}.mp4`;
      const download = await FileSystem.downloadAsync(activeVideoUrl, destination);

      const asset = await MediaLibrary.createAssetAsync(download.uri);
      const existingAlbum = await MediaLibrary.getAlbumAsync(VIDEO_ALBUM_NAME);
      if (existingAlbum) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], existingAlbum, false);
      } else {
        await MediaLibrary.createAlbumAsync(VIDEO_ALBUM_NAME, asset, false);
      }

      Alert.alert('Saved', `Video saved to Photos in album: ${VIDEO_ALBUM_NAME}.`);
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Could not save video.');
    } finally {
      setIsSaving(false);
    }
  };

  const shareVideo = async (): Promise<void> => {
    if (!activeVideoUrl) return;

    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Unavailable', 'Sharing is not available on this device.');
      return;
    }

    try {
      const destination = `${FileSystem.cacheDirectory}ai-video-share-${Date.now()}.mp4`;
      const download = await FileSystem.downloadAsync(activeVideoUrl, destination);
      await Sharing.shareAsync(download.uri);
    } catch (error) {
      Alert.alert('Share failed', error instanceof Error ? error.message : 'Could not prepare video for sharing.');
    }
  };

  // ─── RENDER: Video Player (when a video is selected) ───
  const renderVideoPlayer = () => {
    if (!activeVideoUrl) return null;

    return (
      <View style={styles.playerSection}>
        <View style={styles.playerHeader}>
          <Text style={[styles.playerTitle, { color: palette.text }]}>
            {activeJob?.danceStyleLabel || 'Video'}
          </Text>
          <IconButton
            icon="close"
            size={20}
            onPress={() => setSelectedVideoJobId(null)}
            iconColor={palette.textSecondary}
          />
        </View>
        <VideoView style={styles.videoPreview} player={videoPlayer} nativeControls />
        <View style={styles.actionsRow}>
          <Button mode="contained" onPress={saveVideo} loading={isSaving} style={styles.actionButton} buttonColor={brand.primary} textColor={palette.onPrimary} icon="content-save">
            Save
          </Button>
          <Button mode="outlined" onPress={shareVideo} style={styles.actionButton} icon="share-variant">
            Share
          </Button>
        </View>
      </View>
    );
  };

  // ─── RENDER: Progress indicator ───
  const renderProgress = () => {
    if (!hasPendingJobs && !isRestoring) return null;

    return (
      <View style={[styles.progressCard, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
        <ActivityIndicator size="large" color={brand.primary} />
        <Text style={[styles.progressTitle, { color: palette.text }]}>Generating video…</Text>
        <Text style={[styles.progressSubtitle, { color: palette.textSecondary }]}>
          {latestJob?.providerStatus === 'IN_PROGRESS' ? 'AI is working its magic ✨' : 'Waiting in queue…'}
        </Text>
        {latestJob?.status === 'pending' && (
          <Button
            mode="text"
            onPress={() => { if (latestJob) void cancel(latestJob.requestId); }}
            textColor={palette.textSecondary}
            compact
            style={{ marginTop: 4 }}
          >
            Cancel & Refund
          </Button>
        )}
      </View>
    );
  };

  // ─── RENDER: Gallery (My Videos) ───
  const renderGallery = () => (
    <View style={{ gap: 12 }}>
      {completedJobs.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
          <Text style={{ fontSize: 48 }}>🎬</Text>
          <Text style={[styles.emptyTitle, { color: palette.text }]}>No videos yet</Text>
          <Text style={[styles.emptySubtitle, { color: palette.textSecondary }]}>
            Generate your first dancing video!
          </Text>
          <Button
            mode="contained"
            onPress={() => setMode('generate')}
            buttonColor={brand.primary}
            textColor={palette.onPrimary}
            style={{ marginTop: 12 }}
            icon="plus"
          >
            Create Video
          </Button>
        </View>
      ) : (
        <>
          {completedJobs.map((job) => {
            const isSelected = selectedVideoJobId === job.requestId;
            return (
              <TouchableOpacity
                key={job.requestId}
                activeOpacity={0.7}
                onPress={() => setSelectedVideoJobId(isSelected ? null : job.requestId)}
                style={[
                  styles.videoItem,
                  {
                    borderColor: isSelected ? brand.primary : palette.borderVariant,
                    backgroundColor: isSelected ? `${brand.primary}10` : palette.cardBackground,
                  },
                ]}
              >
                {job.photoUri ? (
                  <Image source={{ uri: job.photoUri }} style={styles.videoItemThumb} />
                ) : (
                  <View style={[styles.videoItemThumb, { backgroundColor: palette.surface, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 20 }}>🎥</Text>
                  </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: palette.text, fontWeight: '700', fontSize: 15 }}>{job.danceStyleLabel}</Text>
                  <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                    {new Date(job.createdAt).toLocaleDateString()} · {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={[styles.playBadge, { backgroundColor: isSelected ? brand.primary : palette.surface }]}>
                  <Text style={{ color: isSelected ? '#fff' : palette.textSecondary, fontSize: 11, fontWeight: '700' }}>
                    {isSelected ? '▶' : '▷'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </View>
  );

  // ─── RENDER: Generate form ───
  const renderGenerateForm = () => (
    <View style={{ gap: 12 }}>
      {/* Photo picker */}
      <Card style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>📷 Choose Photo</Text>
          {sourceImage ? (
            <TouchableOpacity onPress={pickFromLibrary} activeOpacity={0.8}>
              <Image source={{ uri: sourceImage }} style={styles.previewImage} resizeMode="cover" />
              <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 6, textAlign: 'center' }}>Tap to change</Text>
            </TouchableOpacity>
          ) : (
            <Button mode="outlined" onPress={pickFromLibrary} icon="image" style={{ borderStyle: 'dashed' } as any}>
              Choose from Gallery
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Style picker */}
      <Card style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>💃 Dance Style</Text>
          <View style={styles.styleGrid}>
            {DANCE_STYLES.map((style) => {
              const isActive = style.id === selectedStyle.id;
              return (
                <TouchableOpacity
                  key={style.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedStyle(style)}
                  style={[
                    styles.styleCard,
                    {
                      borderColor: isActive ? brand.primary : palette.borderVariant,
                      backgroundColor: isActive ? `${brand.primary}15` : palette.surface,
                    },
                  ]}
                >
                  <Text style={{ color: isActive ? brand.primary : palette.text, fontWeight: '700', fontSize: 14 }}>
                    {style.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      {/* Generate button */}
      <Button
        mode="contained"
        onPress={startGeneration}
        loading={isSubmitting}
        disabled={!sourceImage || isSubmitting || hasPendingJobs}
        style={styles.generateButton}
        buttonColor={brand.primary}
        textColor={palette.onPrimary}
        icon="movie-open-play"
        contentStyle={{ paddingVertical: 6 }}
      >
        {hasPendingJobs ? 'Generating…' : `Generate · ${VIDEO_COST} 🪙`}
      </Button>
    </View>
  );

  // ─── MAIN RENDER ───
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineMedium" style={[styles.title, { color: palette.text }]}>Make It Dance</Text>
            {hasVideos && mode === 'gallery' && (
              <Button mode="contained" onPress={() => setMode('generate')} buttonColor={brand.primary} textColor={palette.onPrimary} icon="plus" compact>
                New
              </Button>
            )}
            {mode === 'generate' && hasVideos && (
              <Button mode="outlined" onPress={() => setMode('gallery')} compact icon="play-box-multiple">
                My Videos
              </Button>
            )}
          </View>

          {/* Coin bar + cost */}
          <View style={[styles.coinBar, { backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }]}>
            <Text style={{ color: palette.text, fontWeight: '600' }}>🪙 Balance: {balance} coins</Text>
            <Button mode="text" compact onPress={() => router.push('/(main)/coins-purchase')} textColor={brand.primary}>
              Buy more
            </Button>
          </View>
          <Text style={{ color: palette.textSecondary, fontSize: 12, fontWeight: '600' }}>Cost per generation: {VIDEO_COST} coins</Text>

          {/* Video player (shows when a video is selected regardless of mode) */}
          {renderVideoPlayer()}

          {/* Progress */}
          {renderProgress()}

          {/* Mode content */}
          {mode === 'generate' ? renderGenerateForm() : renderGallery()}

          {/* Clear history (small, at bottom) */}
          {jobs.length > 0 && (
            <Button
              mode="text"
              onPress={() => {
                Alert.alert('Clear History', 'Delete all video history?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: () => void clearHistory() },
                ]);
              }}
              textColor={palette.textSecondary}
              compact
              style={{ marginTop: 8 }}
            >
              Clear History
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '700' },

  // Player
  playerSection: { gap: 10 },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerTitle: { fontWeight: '700', fontSize: 16 },
  videoPreview: { width: '100%', height: 300, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1 },

  // Progress
  progressCard: {
    borderWidth: 1,
    borderRadius: APP_THEME.shape.borderRadius,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: { fontSize: 16, fontWeight: '700' },
  progressSubtitle: { fontSize: 13 },

  // Gallery
  emptyState: {
    borderWidth: 1,
    borderRadius: APP_THEME.shape.borderRadius,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },

  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    gap: 12,
  },
  videoItemThumb: { width: 52, height: 52, borderRadius: 10 },
  playBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Generate form
  coinBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: APP_THEME.shape.borderRadius,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  card: { borderRadius: APP_THEME.shape.borderRadius, borderWidth: 1 },
  sectionTitle: { fontWeight: '700', marginBottom: 10, fontSize: 15 },
  previewImage: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#E0E0E0' },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: '45%',
    alignItems: 'center',
  },
  generateButton: { borderRadius: APP_THEME.shape.borderRadius },
});
