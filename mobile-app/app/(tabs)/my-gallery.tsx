import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DREAMSHOT_STYLE_PRESETS_BY_ID } from '../../src/config/styles';
import { useGenerationJob, useGeneratePhoto, useGenerateVideo } from '../../src/features/generation';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useVideoThumbnail } from '../../src/hooks/useVideoThumbnail';
import FullScreenViewer from '../../src/components/FullScreenViewer';
import type { DreamshotGenerationJob } from '../../src/features/generation/types';

const CARD_WIDTH = (Dimensions.get('window').width - 28 - 8) / 2;
const UNDO_TIMEOUT_MS = 5000;

type FilterMode = 'all' | 'photo' | 'video';
type UndoState = { jobId: string; label: string; timer: ReturnType<typeof setTimeout> } | null;

// ─── Timeline grouping ───
function getDateGroup(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (itemDate.getTime() === today.getTime()) return 'Today';
  if (itemDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: now.getFullYear() !== d.getFullYear() ? 'numeric' : undefined });
}

function groupByDate(jobs: DreamshotGenerationJob[]): Array<{ title: string; data: DreamshotGenerationJob[] }> {
  const groups: Map<string, DreamshotGenerationJob[]> = new Map();
  for (const job of jobs) {
    const key = getDateGroup(job.createdAt);
    const existing = groups.get(key) || [];
    existing.push(job);
    groups.set(key, existing);
  }
  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

// ─── Main screen ───
export default function MyGalleryScreen(): React.JSX.Element {
  const router = useRouter();
  const { jobs, archivedJobs, isRestoring, archiveJob, restoreJob } = useGenerationJob();
  useGeneratePhoto();
  useGenerateVideo();
  const { palette, brand } = useAppTheme();
  const styles = React.useMemo(() => createStyles(palette, brand), [palette, brand]);

  const [filter, setFilter] = useState<FilterMode>('all');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [undo, setUndo] = useState<UndoState>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const visibleJobs = useMemo(() => jobs.filter((job) => job.jobId !== pendingDeleteId), [jobs, pendingDeleteId]);

  const filteredJobs = useMemo(() => {
    if (filter === 'all') return visibleJobs;
    return visibleJobs.filter((job) => job.kind === filter);
  }, [visibleJobs, filter]);

  const sections = useMemo(() => groupByDate(filteredJobs), [filteredJobs]);

  const photosCount = useMemo(() => visibleJobs.filter((j) => j.kind === 'photo').length, [visibleJobs]);
  const videosCount = useMemo(() => visibleJobs.filter((j) => j.kind === 'video').length, [visibleJobs]);

  const handleSwipeDelete = useCallback((jobId: string, label: string) => {
    if (undo?.timer) clearTimeout(undo.timer);
    setPendingDeleteId(jobId);
    const timer = setTimeout(() => {
      void archiveJob(jobId);
      setPendingDeleteId(null);
      setUndo(null);
    }, UNDO_TIMEOUT_MS);
    setUndo({ jobId, label, timer });
  }, [undo, archiveJob]);

  const handleRequestDelete = useCallback((jobId: string, label: string) => {
    Alert.alert(
      'Delete this portrait?',
      'This item will move to Archive and can be restored for 7 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleSwipeDelete(jobId, label) },
      ],
    );
  }, [handleSwipeDelete]);

  const handleUndo = useCallback(() => {
    if (!undo) return;
    clearTimeout(undo.timer);
    setPendingDeleteId(null);
    setUndo(null);
  }, [undo]);

  const handleOpenViewer = useCallback((jobId: string) => {
    const idx = filteredJobs.findIndex((j) => j.jobId === jobId);
    if (idx >= 0) setViewerIndex(idx);
  }, [filteredJobs]);

  const handleViewerDelete = useCallback((jobId: string) => {
    setViewerIndex(null);
    const style = DREAMSHOT_STYLE_PRESETS_BY_ID[filteredJobs.find((j) => j.jobId === jobId)?.styleId || ''];
    handleSwipeDelete(jobId, style?.title || 'Portrait');
  }, [filteredJobs, handleSwipeDelete]);

  const handleMakeVideo = useCallback((job: DreamshotGenerationJob, animStyleId: string) => {
    setViewerIndex(null);
    router.push({
      pathname: '/(main)/generation-progress',
      params: { styleId: job.styleId, mode: 'video', imageUri: job.outputUrl, animStyle: animStyleId },
    });
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <MaterialIcons name="photo-library" size={28} color={palette.text} />
        <Text style={styles.title}>My Gallery</Text>
        <View style={styles.iconBox} />
      </View>

      {/* Filter tabs */}
      {visibleJobs.length > 0 ? (
        <View style={styles.filterRow}>
          <FilterPill label="All" count={visibleJobs.length} active={filter === 'all'} onPress={() => setFilter('all')} styles={styles} brand={brand} palette={palette} />
          <FilterPill label="Photos" count={photosCount} active={filter === 'photo'} onPress={() => setFilter('photo')} styles={styles} brand={brand} palette={palette} />
          <FilterPill label="Videos" count={videosCount} active={filter === 'video'} onPress={() => setFilter('video')} styles={styles} brand={brand} palette={palette} />
        </View>
      ) : null}

      {isRestoring ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={palette.text} />
          <Text style={styles.helperText}>Loading your portraits...</Text>
        </View>
      ) : null}

      {!isRestoring && visibleJobs.length === 0 ? (
        <View style={styles.centerState}>
          <MaterialIcons name="auto-awesome" size={48} color={brand.accent} />
          <Text style={styles.emptyTitle}>Your gallery awaits</Text>
          <Text style={styles.helperText}>Portraits you create will appear here.</Text>
          <Pressable
            onPress={() => router.push('/(tabs)')}
            style={({ pressed }) => [styles.emptyCtaButton, pressed && { opacity: 0.85 }]}
          >
            <MaterialIcons name="brush" size={18} color="#1A1A2E" />
            <Text style={styles.emptyCtaText}>Create First Portrait</Text>
          </Pressable>
        </View>
      ) : null}

      {!isRestoring && filteredJobs.length === 0 && visibleJobs.length > 0 ? (
        <View style={styles.centerState}>
          <MaterialIcons name={filter === 'video' ? 'videocam-off' : 'photo-camera'} size={40} color={palette.textSecondary} />
          <Text style={styles.emptyTitle}>No {filter === 'video' ? 'videos' : 'photos'} yet</Text>
        </View>
      ) : null}

      {!isRestoring && filteredJobs.length > 0 ? (
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.grid}>
                {section.data.map((job) => (
                  <SwipeableGalleryCard
                    key={job.jobId}
                    job={job}
                    styles={styles}
                    palette={palette}
                    onRequestDelete={handleRequestDelete}
                    onPress={handleOpenViewer}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Archive section */}
          {archivedJobs.length > 0 ? (
            <View style={styles.archiveSection}>
              <Pressable style={styles.archiveHeader} onPress={() => setShowArchive((v) => !v)}>
                <View style={styles.archiveHeaderLeft}>
                  <MaterialIcons name="archive" size={18} color={palette.textSecondary} />
                  <Text style={styles.archiveTitle}>Archive ({archivedJobs.length})</Text>
                </View>
                <MaterialIcons
                  name={showArchive ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={22}
                  color={palette.textSecondary}
                />
              </Pressable>
              {showArchive ? (
                <View style={styles.archiveGrid}>
                  {archivedJobs.map((job) => {
                    const s = DREAMSHOT_STYLE_PRESETS_BY_ID[job.styleId];
                    const daysLeft = job.archivedAt
                      ? Math.max(0, Math.ceil(7 - (Date.now() - new Date(job.archivedAt).getTime()) / 86400000))
                      : 0;
                    return (
                      <View key={job.jobId} style={styles.archiveCard}>
                        <Image source={{ uri: job.outputUrl }} style={styles.archiveImage} />
                        <View style={styles.archiveOverlay} />
                        <View style={styles.archiveMeta}>
                          <Text style={styles.archiveLabel} numberOfLines={1}>{s?.title || 'Unknown'}</Text>
                          <Text style={styles.archiveDays}>{daysLeft}d left</Text>
                        </View>
                        <Pressable style={styles.restoreBtn} hitSlop={8} onPress={() => void restoreJob(job.jobId)}>
                          <MaterialIcons name="restore" size={18} color="#fff" />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      ) : null}

      {/* Undo toast */}
      {undo ? (
        <View style={styles.undoBar}>
          <Text style={styles.undoText} numberOfLines={1}>Removed &ldquo;{undo.label}&rdquo;</Text>
          <Pressable onPress={handleUndo} style={styles.undoBtn}>
            <Text style={styles.undoBtnText}>UNDO</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Full-screen viewer */}
      {viewerIndex != null ? (
        <FullScreenViewer
          items={filteredJobs}
          initialIndex={viewerIndex}
          onDismiss={() => setViewerIndex(null)}
          onDelete={handleViewerDelete}
          onMakeVideo={handleMakeVideo}
        />
      ) : null}
    </SafeAreaView>
  );
}

// ─── Filter pill ───
function FilterPill({
  label, count, active, onPress, styles, brand, palette,
}: {
  label: string; count: number; active: boolean; onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  brand: ReturnType<typeof useAppTheme>['brand'];
  palette: ReturnType<typeof useAppTheme>['palette'];
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterPill, active && { backgroundColor: brand.accent }]}
    >
      <Text style={[styles.filterPillText, active && { color: '#1A1A2E' }, !active && { color: palette.textSecondary }]}>
        {label} {count > 0 ? `(${count})` : ''}
      </Text>
    </Pressable>
  );
}

// ─── Swipeable card ───
function SwipeableGalleryCard({
  job, styles, palette, onRequestDelete, onPress,
}: {
  job: DreamshotGenerationJob;
  styles: ReturnType<typeof createStyles>;
  palette: ReturnType<typeof useAppTheme>['palette'];
  onRequestDelete: (jobId: string, label: string) => void;
  onPress: (jobId: string) => void;
}): React.JSX.Element {
  const isVideo = job.kind === 'video';
  const hasOutput = job.status === 'completed' && typeof job.outputUrl === 'string' && job.outputUrl.length > 0;
  const thumbnail = useVideoThumbnail(isVideo && hasOutput ? job.outputUrl : null);
  const imageSource = hasOutput
    ? (isVideo ? (thumbnail ? { uri: thumbnail } : undefined) : { uri: job.outputUrl })
    : undefined;
  const stylePreset = DREAMSHOT_STYLE_PRESETS_BY_ID[job.styleId];
  const label = job.styleTitle || stylePreset?.title || 'Unknown style';
  const isPending = job.status === 'queued' || job.status === 'processing';
  const longPressTriggeredRef = useRef(false);

  const handlePress = useCallback(() => {
    if (!hasOutput) return;
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    onPress(job.jobId);
  }, [hasOutput, job.jobId, onPress]);

  const handleLongPress = useCallback(() => {
    if (!hasOutput) return;
    longPressTriggeredRef.current = true;
    onRequestDelete(job.jobId, label);
  }, [hasOutput, job.jobId, label, onRequestDelete]);

  return (
    <View style={styles.cardWrap}>
      <Pressable
        style={styles.card}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={320}
      >
        {imageSource ? (
          <Image source={imageSource} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.pendingCardBackground]}>
            {isPending ? <ActivityIndicator color={palette.text} /> : <MaterialIcons name="error-outline" size={28} color={palette.textSecondary} />}
          </View>
        )}
        <View style={styles.overlay} />
        {isVideo && hasOutput ? (
          <View style={styles.playIconWrap}>
            <MaterialIcons name="play-circle-filled" size={36} color="rgba(255,255,255,0.85)" />
          </View>
        ) : null}
        {isPending ? (
          <View style={styles.processingBadge}>
            <ActivityIndicator size="small" color="#1A1A2E" />
            <Text style={styles.processingBadgeText}>Processing...</Text>
          </View>
        ) : null}
        <View style={styles.metaWrap}>
          <Text style={styles.styleName} numberOfLines={1}>{label}</Text>
          {hasOutput ? <Text style={styles.longPressHint}>Long press to archive</Text> : null}
        </View>
      </Pressable>
    </View>
  );
}

// ─── Styles ───
const createStyles = (palette: ReturnType<typeof useAppTheme>['palette'], brand: ReturnType<typeof useAppTheme>['brand']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    iconBox: { width: 42, alignItems: 'center' },
    title: { color: palette.text, fontSize: 29, fontWeight: '700', fontFamily: 'serif' },

    // Filter tabs
    filterRow: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 8, gap: 8 },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.border,
    },
    filterPillText: { fontSize: 13, fontWeight: '700' },

    // Center states
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 10 },
    helperText: { color: palette.textSecondary, fontWeight: '600', textAlign: 'center' },
    emptyTitle: { color: palette.text, textAlign: 'center', fontWeight: '700', fontSize: 18 },
    emptyCtaButton: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: brand.accent,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 12,
    },
    emptyCtaText: { color: '#1A1A2E', fontWeight: '800', fontSize: 15, letterSpacing: 0.4 },

    // Content
    content: { paddingHorizontal: 14, paddingBottom: 80 },

    // Timeline sections
    section: { marginBottom: 16 },
    sectionTitle: { color: palette.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10, textTransform: 'uppercase' },

    // Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
    cardWrap: { width: '48.6%', position: 'relative' },
    card: {
      width: '100%',
      aspectRatio: 0.72,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: brand.accent,
    },
    image: { width: '100%', height: '100%' },
    pendingCardBackground: { backgroundColor: palette.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
    processingBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: brand.accent,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    processingBadgeText: { color: '#1A1A2E', fontSize: 11, fontWeight: '800' },
    playIconWrap: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metaWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    styleName: { color: '#fff', fontWeight: '700', fontSize: 12 },
    longPressHint: { color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 3 },

    // Archive
    archiveSection: { marginTop: 24 },
    archiveHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: palette.borderVariant,
    },
    archiveHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    archiveTitle: { color: palette.textSecondary, fontSize: 14, fontWeight: '700' },
    archiveGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 8 },
    archiveCard: {
      width: '48.6%',
      aspectRatio: 0.72,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: palette.border,
      opacity: 0.7,
    },
    archiveImage: { width: '100%', height: '100%' },
    archiveOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    archiveMeta: { position: 'absolute', bottom: 8, left: 8, right: 8 },
    archiveLabel: { color: '#fff', fontSize: 11, fontWeight: '700' },
    archiveDays: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
    restoreBtn: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 10,
      padding: 6,
    },

    // Undo
    undoBar: {
      position: 'absolute',
      bottom: 24,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
    undoText: { color: palette.text, fontSize: 14, fontWeight: '500', flex: 1, marginRight: 12 },
    undoBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: brand.accent },
    undoBtnText: { color: '#1A1A2E', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  });
