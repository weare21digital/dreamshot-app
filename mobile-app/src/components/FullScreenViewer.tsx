import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons as MI2 } from '@expo/vector-icons';
import type { RoyalGenerationJob } from '../features/royal/types';
import { ANIMATION_STYLES, ROYAL_STYLE_PRESETS_BY_ID } from '../config/styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 120;

type Props = {
  items: RoyalGenerationJob[];
  initialIndex: number;
  onDismiss: () => void;
  onDelete?: (jobId: string) => void;
  onMakeVideo?: (job: RoyalGenerationJob, animStyleId: string) => void;
};

function VideoCard({ uri }: { uri: string }): React.JSX.Element {
  const player = useVideoPlayer(uri ? { uri } : null, (p) => {
    p.loop = true;
    p.play();
  });
  return <VideoView style={styles.media} player={player} nativeControls />;
}

function ImageCard({ uri }: { uri: string }): React.JSX.Element {
  return <Image source={{ uri }} style={styles.media} resizeMode="contain" />;
}

export default function FullScreenViewer({ items, initialIndex, onDismiss, onDelete, onMakeVideo }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [saving, setSaving] = useState(false);
  const [showAnimPicker, setShowAnimPicker] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const currentItem = items[currentIndex];
  const style = currentItem ? ROYAL_STYLE_PRESETS_BY_ID[currentItem.styleId] : undefined;
  const isVideo = currentItem?.kind === 'video';

  const translateX = useRef(new Animated.Value(0)).current;
  const gestureAxisRef = useRef<'x' | 'y' | null>(null);
  const startXRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt: GestureResponderEvent, g: PanResponderGestureState) => {
        // Left-edge swipe: touch starts within 30px of left edge, moving right
        const isEdgeSwipe = evt.nativeEvent.pageX < 30 && g.dx > 10;
        // Vertical swipe down
        const isVertical = g.dy > 15 && Math.abs(g.dy) > Math.abs(g.dx) * 2;
        return isEdgeSwipe || isVertical;
      },
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        gestureAxisRef.current = null;
        startXRef.current = evt.nativeEvent.pageX;
      },
      onPanResponderMove: (evt: GestureResponderEvent, g: PanResponderGestureState) => {
        if (!gestureAxisRef.current) {
          // Lock axis based on start position
          gestureAxisRef.current = startXRef.current < 30 && g.dx > 0 ? 'x' : 'y';
        }
        if (gestureAxisRef.current === 'x' && g.dx > 0) {
          translateX.setValue(g.dx);
        } else if (gestureAxisRef.current === 'y' && g.dy > 0) {
          translateY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        if (gestureAxisRef.current === 'x') {
          if (g.dx > SCREEN_WIDTH * 0.35) {
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onDismissRef.current());
          } else {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
          }
        } else {
          if (g.dy > DISMISS_THRESHOLD) {
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onDismissRef.current());
          } else {
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
          }
        }
        gestureAxisRef.current = null;
      },
    }),
  ).current;

  const dismissProgress = Animated.add(
    translateY.interpolate({ inputRange: [0, DISMISS_THRESHOLD * 2], outputRange: [0, 1], extrapolate: 'clamp' }),
    translateX.interpolate({ inputRange: [0, SCREEN_WIDTH], outputRange: [0, 1], extrapolate: 'clamp' }),
  );

  const bgOpacity = dismissProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleSave = useCallback(async () => {
    if (!currentItem?.outputUrl || saving) return;
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;

      let fileUri = currentItem.outputUrl;
      if (fileUri.startsWith('http')) {
        const ext = isVideo ? 'mp4' : 'png';
        const localPath = `${FileSystem.cacheDirectory}save-${Date.now()}.${ext}`;
        const dl = await FileSystem.downloadAsync(fileUri, localPath);
        fileUri = dl.uri;
      }
      await MediaLibrary.saveToLibraryAsync(fileUri);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  }, [currentItem, isVideo, saving]);

  const handleShare = useCallback(async () => {
    if (!currentItem?.outputUrl) return;
    try {
      let fileUri = currentItem.outputUrl;
      if (fileUri.startsWith('http')) {
        const ext = isVideo ? 'mp4' : 'png';
        const localPath = `${FileSystem.cacheDirectory}share-${Date.now()}.${ext}`;
        const dl = await FileSystem.downloadAsync(fileUri, localPath);
        fileUri = dl.uri;
      }
      await Sharing.shareAsync(fileUri);
    } catch { /* silent */ }
  }, [currentItem, isVideo]);

  const renderItem = useCallback(({ item }: { item: RoyalGenerationJob }) => {
    return (
      <View style={styles.slide}>
        {item.kind === 'video' ? (
          <VideoCard uri={item.outputUrl || ''} />
        ) : (
          <ImageCard uri={item.outputUrl || ''} />
        )}
      </View>
    );
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      <StatusBar hidden />

      <Animated.View
        style={[styles.content, { transform: [{ translateX }, { translateY }] }]}
        {...panResponder.panHandlers}
      >
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.jobId}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </Animated.View>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onDismiss} style={styles.topBtn} hitSlop={12}>
          <MaterialIcons name="close" size={26} color="#fff" />
        </Pressable>
        <View style={styles.topCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>{style?.title || 'Portrait'}</Text>
          <Text style={styles.topSub}>{isVideo ? 'Video' : 'Photo'} • {currentIndex + 1}/{items.length}</Text>
        </View>
        <View style={styles.topBtn} />
      </View>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable onPress={() => void handleSave()} style={styles.actionBtn}>
          <MaterialIcons name="save-alt" size={22} color="#fff" />
          <Text style={styles.actionLabel}>Save</Text>
        </Pressable>

        <Pressable onPress={() => void handleShare()} style={styles.actionBtn}>
          <MaterialIcons name="share" size={22} color="#fff" />
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>

        {!isVideo && currentItem && onMakeVideo ? (
          <Pressable
            onPress={() => setShowAnimPicker(true)}
            style={styles.actionBtn}
          >
            <MaterialIcons name="videocam" size={22} color="#fff" />
            <Text style={styles.actionLabel}>Animate</Text>
          </Pressable>
        ) : null}

        {onDelete && currentItem ? (
          <Pressable onPress={() => onDelete(currentItem.jobId)} style={styles.actionBtn}>
            <MaterialIcons name="delete-outline" size={22} color="#ff6b6b" />
            <Text style={[styles.actionLabel, { color: '#ff6b6b' }]}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
      {/* Animation style picker */}
      <Modal visible={showAnimPicker} transparent animationType="slide" onRequestClose={() => setShowAnimPicker(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAnimPicker(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Choose Animation Style</Text>
            <Text style={styles.modalSubtitle}>
              Cost: {style?.videoCost ?? 50} coins
            </Text>
            {ANIMATION_STYLES.map((anim) => (
              <Pressable
                key={anim.id}
                style={({ pressed }) => [styles.animOption, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  setShowAnimPicker(false);
                  if (currentItem && onMakeVideo) onMakeVideo(currentItem, anim.id);
                }}
              >
                <Text style={styles.animEmoji}>{anim.emoji}</Text>
                <View style={styles.animTextWrap}>
                  <Text style={styles.animLabel}>{anim.label}</Text>
                  <Text style={styles.animDesc} numberOfLines={1}>{anim.promptSuffix}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.4)" />
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 100,
  },
  content: { flex: 1 },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  topSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  actionBtn: { alignItems: 'center', gap: 4, minWidth: 60 },
  actionLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },
  // Animation picker modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  modalSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, marginBottom: 16 },
  animOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  animEmoji: { fontSize: 28 },
  animTextWrap: { flex: 1 },
  animLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  animDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
});
