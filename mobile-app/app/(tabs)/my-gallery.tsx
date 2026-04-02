import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import type { DreamshotGenerationJob } from '../../src/features/generation/types';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { useVideoThumbnail } from '../../src/hooks/useVideoThumbnail';
import FullScreenViewer from '../../src/components/FullScreenViewer';

const UNDO_TIMEOUT_MS = 5000;
const RECENT_DAYS_WINDOW = 7;

type FilterMode = 'all' | 'favorites' | 'recent';
type UndoState = { jobId: string; label: string; timer: ReturnType<typeof setTimeout> } | null;

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

function isRecent(createdAt: string): boolean {
  const createdAtMs = new Date(createdAt).getTime();
  const windowMs = RECENT_DAYS_WINDOW * 24 * 60 * 60 * 1000;
  return Date.now() - createdAtMs <= windowMs;
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

export default function MyGalleryScreen(): React.JSX.Element {
  const router = useRouter();
  const { jobs, archivedJobs, isRestoring, archiveJob, restoreJob } = useGenerationJob();
  useGeneratePhoto();
  useGenerateVideo();

  const { palette, brand } = useAppTheme();
  const styles = React.useMemo(() => createStyles(palette, brand), [palette, brand]);

  const [filter, setFilter] = useState<FilterMode>('all');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [undo, setUndo] = useState<UndoState>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const visibleJobs = useMemo(() => jobs.filter((job) => job.jobId !== pendingDeleteId), [jobs, pendingDeleteId]);
  const recentCount = useMemo(() => visibleJobs.filter((job) => isRecent(job.createdAt)).length, [visibleJobs]);

  const filteredJobs = useMemo(() => {
    if (filter === 'all') return visibleJobs;
    if (filter === 'favorites') return visibleJobs.filter((job) => favoriteIds.has(job.jobId));
    return visibleJobs.filter((job) => isRecent(job.createdAt));
  }, [visibleJobs, filter, favoriteIds]);

  const sections = useMemo(() => groupByDate(filteredJobs), [filteredJobs]);

  const toggleFavorite = useCallback((jobId: string) => {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

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
      'Delete this image?',
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
    handleSwipeDelete(jobId, style?.title || 'Image');
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
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarWrap}>
            <View style={styles.profileAvatarGlow} />
            <View style={styles.profileAvatar}>
              <MaterialIcons name="face" size={56} color={palette.text} />
            </View>
          </View>
          <Text style={styles.profileName}>My Collection</Text>
          <View style={styles.statsRow}>
            <StatCard label="Creations" value={visibleJobs.length} styles={styles} />
            <StatCard label="Saved" value={favoriteIds.size} styles={styles} />
            <StatCard label="Recent" value={recentCount} styles={styles} />
          </View>
        </View>

        {visibleJobs.length > 0 ? (
          <View style={styles.filterRow}>
            <FilterPill label="All" count={visibleJobs.length} active={filter === 'all'} onPress={() => setFilter('all')} styles={styles} brand={brand} palette={palette} />
            <FilterPill label="Favorites" count={favoriteIds.size} active={filter === 'favorites'} onPress={() => setFilter('favorites')} styles={styles} brand={brand} palette={palette} />
            <FilterPill label="Recent" count={recentCount} active={filter === 'recent'} onPress={() => setFilter('recent')} styles={styles} brand={brand} palette={palette} />
          </View>
        ) : null}

        {isRestoring ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={palette.text} />
            <Text style={styles.helperText}>Loading your images...</Text>
          </View>
        ) : null}

        {!isRestoring && visibleJobs.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialIcons name="auto-awesome" size={48} color={brand.accent} />
            <Text style={styles.emptyTitle}>Your first creation starts here.</Text>
            <Text style={styles.helperText}>Generate an image and it will appear in your collection.</Text>
            <Pressable onPress={() => router.push('/(tabs)')} style={({ pressed }) => [styles.emptyCtaButton, pressed && { opacity: 0.85 }]}>
              <MaterialIcons name="brush" size={18} color="#1A1A2E" />
              <Text style={styles.emptyCtaText}>Create First Image</Text>
            </Pressable>
          </View>
        ) : null}

        {!isRestoring && filteredJobs.length === 0 && visibleJobs.length > 0 ? (
          <View style={styles.centerState}>
            <MaterialIcons name="collections-bookmark" size={40} color={palette.textSecondary} />
            <Text style={styles.emptyTitle}>No {filter === 'favorites' ? 'favorites' : 'recent items'} yet</Text>
          </View>
        ) : null}

        {!isRestoring && filteredJobs.length > 0 ? sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.grid}>
              {section.data.map((job, index) => (
                <GalleryCard
                  key={job.jobId}
                  job={job}
                  index={index}
                  styles={styles}
                  palette={palette}
                  isFavorite={favoriteIds.has(job.jobId)}
                  onToggleFavorite={toggleFavorite}
                  onRequestDelete={handleRequestDelete}
                  onPress={handleOpenViewer}
                />
              ))}
            </View>
          </View>
        )) : null}

        {archivedJobs.length > 0 ? (
          <View style={styles.archiveSection}>
            <Pressable style={styles.archiveHeader} onPress={() => setShowArchive((v) => !v)}>
              <View style={styles.archiveHeaderLeft}>
                <MaterialIcons name="archive" size={18} color={palette.textSecondary} />
                <Text style={styles.archiveTitle}>Archive ({archivedJobs.length})</Text>
              </View>
              <MaterialIcons name={showArchive ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color={palette.textSecondary} />
            </Pressable>
            {showArchive ? (
              <View style={styles.archiveGrid}>
                {archivedJobs.map((job) => (
                  <View key={job.jobId} style={styles.archiveCard}>
                    <Image source={{ uri: job.outputUrl }} style={styles.archiveImage} />
                    <Pressable style={styles.restoreBtn} hitSlop={8} onPress={() => void restoreJob(job.jobId)}>
                      <MaterialIcons name="restore" size={18} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {undo ? (
        <View style={styles.undoBar}>
          <Text style={styles.undoText} numberOfLines={1}>Removed “{undo.label}”</Text>
          <Pressable onPress={handleUndo} style={styles.undoBtn}><Text style={styles.undoBtnText}>UNDO</Text></Pressable>
        </View>
      ) : null}

      {viewerIndex != null ? (
        <FullScreenViewer items={filteredJobs} initialIndex={viewerIndex} onDismiss={() => setViewerIndex(null)} onDelete={handleViewerDelete} onMakeVideo={handleMakeVideo} />
      ) : null}
    </SafeAreaView>
  );
}

function StatCard({ label, value, styles }: { label: string; value: number; styles: ReturnType<typeof createStyles> }): React.JSX.Element {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FilterPill({ label, count, active, onPress, styles, brand, palette }: {
  label: string; count: number; active: boolean; onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  brand: ReturnType<typeof useAppTheme>['brand'];
  palette: ReturnType<typeof useAppTheme>['palette'];
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={[styles.filterPill, active && { backgroundColor: brand.accent, borderColor: brand.accent }]}>
      <Text style={[styles.filterPillText, active ? styles.filterPillTextActive : { color: palette.textSecondary }]}>{label} ({count})</Text>
    </Pressable>
  );
}

function GalleryCard({ job, index, styles, palette, isFavorite, onToggleFavorite, onRequestDelete, onPress }: {
  job: DreamshotGenerationJob;
  index: number;
  styles: ReturnType<typeof createStyles>;
  palette: ReturnType<typeof useAppTheme>['palette'];
  isFavorite: boolean;
  onToggleFavorite: (jobId: string) => void;
  onRequestDelete: (jobId: string, label: string) => void;
  onPress: (jobId: string) => void;
}): React.JSX.Element {
  const isVideo = job.kind === 'video';
  const hasOutput = job.status === 'completed' && typeof job.outputUrl === 'string' && job.outputUrl.length > 0;
  const thumbnail = useVideoThumbnail(isVideo && hasOutput ? job.outputUrl : null);
  const imageSource = hasOutput ? (isVideo ? (thumbnail ? { uri: thumbnail } : undefined) : { uri: job.outputUrl }) : undefined;
  const stylePreset = DREAMSHOT_STYLE_PRESETS_BY_ID[job.styleId];
  const label = job.styleTitle || stylePreset?.title || 'Unknown style';
  const longPressTriggeredRef = useRef(false);

  const handlePress = useCallback(() => {
    if (!hasOutput) return;
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    onPress(job.jobId);
  }, [hasOutput, onPress, job.jobId]);

  const handleLongPress = useCallback(() => {
    if (!hasOutput) return;
    longPressTriggeredRef.current = true;
    onRequestDelete(job.jobId, label);
  }, [hasOutput, onRequestDelete, job.jobId, label]);

  return (
    <View style={styles.cardWrap}>
      <Pressable style={[styles.card, index % 3 === 0 ? styles.cardTall : styles.cardRegular]} onPress={handlePress} onLongPress={handleLongPress} delayLongPress={320}>
        {imageSource ? <Image source={imageSource} style={styles.image} /> : <View style={[styles.image, styles.pendingCardBackground]}><ActivityIndicator color={palette.text} /></View>}
        <View style={styles.overlay} />
        <Pressable style={styles.favoriteBtn} onPress={() => onToggleFavorite(job.jobId)} hitSlop={6}>
          <MaterialIcons name={isFavorite ? 'favorite' : 'favorite-border'} size={18} color={isFavorite ? '#FF86C3' : '#FFFFFF'} />
        </Pressable>
        <View style={styles.metaWrap}><Text style={styles.styleName} numberOfLines={1}>{label}</Text></View>
      </Pressable>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette'], brand: ReturnType<typeof useAppTheme>['brand']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: 14, paddingBottom: 96 },
  profileHeader: { paddingTop: 10, alignItems: 'center', marginBottom: 10 },
  profileAvatarWrap: { position: 'relative', marginBottom: 12 },
  profileAvatarGlow: { position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderRadius: 999, backgroundColor: 'rgba(156,72,234,0.22)' },
  profileAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: palette.surfaceContainerHigh, borderWidth: 2, borderColor: 'rgba(83,221,252,0.4)', alignItems: 'center', justifyContent: 'center' },
  profileName: { color: palette.text, fontSize: 34, fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 12 },
  statsRow: { width: '100%', flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, borderRadius: 14, backgroundColor: 'rgba(15,25,48,0.6)', borderWidth: 1, borderColor: 'rgba(64,72,93,0.35)', paddingVertical: 10, alignItems: 'center' },
  statValue: { color: palette.text, fontSize: 20, fontFamily: 'SpaceGrotesk_700Bold' },
  statLabel: { color: palette.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterRow: { flexDirection: 'row', paddingBottom: 10, gap: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: palette.border },
  filterPillText: { fontSize: 12, fontWeight: '700' },
  filterPillTextActive: { color: '#1A1A2E' },
  centerState: { minHeight: 220, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 10 },
  emptyTitle: { color: palette.text, textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28 },
  helperText: { color: palette.textSecondary, fontWeight: '600', textAlign: 'center' },
  emptyCtaButton: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: brand.accent, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
  emptyCtaText: { color: '#1A1A2E', fontWeight: '800', fontSize: 15 },
  section: { marginBottom: 16 },
  sectionTitle: { color: palette.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  cardWrap: { width: '48.7%' },
  card: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  cardRegular: { aspectRatio: 0.78 },
  cardTall: { aspectRatio: 0.62 },
  image: { width: '100%', height: '100%' },
  pendingCardBackground: { backgroundColor: palette.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  favoriteBtn: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(6,14,32,0.55)', alignItems: 'center', justifyContent: 'center' },
  metaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.45)' },
  styleName: { color: '#fff', fontWeight: '700', fontSize: 12 },
  archiveSection: { marginTop: 18 },
  archiveHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: palette.borderVariant },
  archiveHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  archiveTitle: { color: palette.textSecondary, fontSize: 14, fontWeight: '700' },
  archiveGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 8 },
  archiveCard: { width: '48.7%', aspectRatio: 0.75, borderRadius: 12, overflow: 'hidden', opacity: 0.78 },
  archiveImage: { width: '100%', height: '100%' },
  restoreBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 6 },
  undoBar: { position: 'absolute', bottom: 24, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.surface, borderRadius: 12, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 16, paddingVertical: 14 },
  undoText: { color: palette.text, fontSize: 14, fontWeight: '500', flex: 1, marginRight: 12 },
  undoBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: brand.accent },
  undoBtnText: { color: '#1A1A2E', fontSize: 13, fontWeight: '800' },
});
