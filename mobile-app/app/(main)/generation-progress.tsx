import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DREAMSHOT_STYLE_PRESETS_BY_ID } from '../../src/config/styles';
import { useGenerationJob, useGeneratePhoto, useGenerateVideo } from '../../src/features/generation';
import { useAppTheme } from '../../src/contexts/ThemeContext';


const PROGRESS_QUOTES = [
  'Every diamond must endure pressure before it shines...',
  'Perfection takes a moment. Almost there...',
  'A great image captures not just the face, but the story...',
  'Patience is the companion of wisdom...',
  'Great beauty requires great patience...',
  'The artist is at work on your likeness...',
  'Elegance is the only beauty that never fades...',
  'The studio needs just a moment more...',
  'A masterpiece cannot be rushed...',
  'The finest things in life are worth the wait...',
  'Poise and patience — your DreamShot is almost ready...',
  'The DreamShot studio is preparing your image...',
  'Even gems take time to polish...',
  'Rome was not built in a day, nor a DreamShot in a moment...',
  'Your likeness is being rendered with the utmost care...',
  'A refined image is crafted detail by detail...',
  'Visual magic takes time to perfect...',
  'The finishing touches are being applied with great care...',
];

function getNextQuoteIndex(previousIndex: number): number {
  if (PROGRESS_QUOTES.length <= 1) {
    return previousIndex;
  }

  const candidateIndexes = PROGRESS_QUOTES
    .map((_, index) => index)
    .filter((index) => index !== previousIndex);

  const randomCandidate = Math.floor(Math.random() * candidateIndexes.length);
  return candidateIndexes[randomCandidate] ?? previousIndex;
}

type ProgressStage = {
  key: 'queued' | 'processing' | 'finalizing';
  label: string;
  detail: string;
  percent: number;
};

type ProgressErrorBoundaryState = {
  hasError: boolean;
};

class ProgressErrorBoundary extends React.Component<React.PropsWithChildren, ProgressErrorBoundaryState> {
  state: ProgressErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ProgressErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('Generation progress screen crashed', error);
  }

  private handleGoHome = (): void => {
    this.setState({ hasError: false });
    router.replace('/(main)/home');
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={fallbackStyles.container}>
        <View style={fallbackStyles.content}>
          <Text style={fallbackStyles.title}>Something went wrong</Text>
          <Text style={fallbackStyles.subtitle}>The generation screen crashed. You can return home and try again.</Text>
          <Pressable style={fallbackStyles.button} onPress={this.handleGoHome}>
            <Text style={fallbackStyles.buttonText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

function GenerationProgressScreenContent(): React.JSX.Element | null {
  const { styleId, mode, imageUri, animStyle } = useLocalSearchParams<{ styleId?: string; mode?: 'photo' | 'video'; imageUri?: string; animStyle?: string }>();
  const fallbackStyle = Object.values(DREAMSHOT_STYLE_PRESETS_BY_ID)[0];
  const style = (styleId && DREAMSHOT_STYLE_PRESETS_BY_ID[styleId]) || fallbackStyle || null;
  const generationMode = mode ?? 'photo';

  const { submitPhoto, cancelPhoto, isSubmitting: isPhotoSubmitting } = useGeneratePhoto();
  const { submitVideo, cancelVideo, isSubmitting: isVideoSubmitting } = useGenerateVideo();
  const { jobs } = useGenerationJob();
  const { palette, brand } = useAppTheme();
  const styles = React.useMemo(() => createStyles(palette, brand), [palette, brand]);

  const [requestId, setRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * PROGRESS_QUOTES.length));
  const quoteOpacity = useRef(new Animated.Value(1)).current;
  const shimmerTranslate = useRef(new Animated.Value(-260)).current;
  const didStartRef = useRef(false);

  useEffect(() => {
    if (style) return;
    router.replace('/(main)/home');
  }, [style]);

  const activeJob = useMemo(() => {
    if (!requestId) return undefined;
    return jobs.find((job) => job.requestId === requestId);
  }, [jobs, requestId]);

  useEffect(() => {
    if (didStartRef.current || !style) return;
    didStartRef.current = true;

    const sourceImageUri = imageUri || style.exampleImageUrl;

    const run = async (): Promise<void> => {
      try {
        setErrorMessage(null);

        if (generationMode === 'video') {
          const id = await submitVideo({ imageUri: sourceImageUri, style, animStyleId: animStyle });
          setRequestId(id);
          setStartedAt(Date.now());
        } else {
          const id = await submitPhoto({ imageUri: sourceImageUri, style });
          setRequestId(id);
          setStartedAt(Date.now());
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Generation failed. Please try again.');
      }
    };

    void run();
  }, [generationMode, imageUri, style, submitPhoto, submitVideo, retryCount]);

  useEffect(() => {
    if (!activeJob) return;

    if (activeJob.status === 'completed' && activeJob.outputUrl) {
      router.replace({
        pathname: '/(main)/result',
        params: { styleId: style.id, mode: generationMode, outputUrl: activeJob.outputUrl },
      });
      return;
    }

    if (activeJob.status === 'failed') {
      setErrorMessage(activeJob.errorMessage ?? 'Generation failed. Please try again.');
    }
  }, [activeJob, generationMode, style.id]);

  const busy = isPhotoSubmitting || isVideoSubmitting || (!!activeJob && (activeJob.status === 'queued' || activeJob.status === 'processing'));
  const isInsufficientCoinsError = !!errorMessage && /not enough coins/i.test(errorMessage);

  useEffect(() => {
    if (!busy) return;

    const timer = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [busy, startedAt]);

  useEffect(() => {
    if (!busy || !!errorMessage) {
      return;
    }

    const interval = setInterval(() => {
      Animated.timing(quoteOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setQuoteIndex((prev) => getNextQuoteIndex(prev));

        Animated.timing(quoteOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [busy, errorMessage, quoteOpacity]);


  useEffect(() => {
    if (!busy || !!errorMessage) {
      shimmerTranslate.stopAnimation();
      shimmerTranslate.setValue(-260);
      return;
    }

    const loop = Animated.loop(
      Animated.timing(shimmerTranslate, {
        toValue: 260,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => {
      loop.stop();
      shimmerTranslate.stopAnimation();
      shimmerTranslate.setValue(-260);
    };
  }, [busy, errorMessage, shimmerTranslate]);

  const isQueued = activeJob?.status === 'queued';
  const isProcessing = activeJob?.status === 'processing';
  const canCancel = isQueued && requestId != null;
  const expectedWindow = generationMode === 'video' ? { min: 40, max: 90 } : { min: 20, max: 45 };

  const currentStage: ProgressStage = useMemo(() => {
    if (errorMessage) {
      return {
        key: 'queued',
        label: 'Needs your attention',
        detail: errorMessage,
        percent: 100,
      };
    }

    if (isQueued) {
      return {
        key: 'queued',
        label: 'Queued for processing',
        detail: 'You are in line. We will start painting shortly.',
        percent: 18,
      };
    }

    if (isProcessing && elapsedSeconds >= expectedWindow.min) {
      return {
        key: 'finalizing',
        label: 'Final touches',
        detail: 'Sharpening details and preparing your final image.',
        percent: 88,
      };
    }

    if (isProcessing) {
      return {
        key: 'processing',
        label: 'Painting in progress',
        detail: 'Artists are applying your selected DreamShot style now.',
        percent: 62,
      };
    }

    return {
      key: 'queued',
      label: 'Preparing request',
      detail: 'Uploading your image and reserving an artist slot.',
      percent: 10,
    };
  }, [elapsedSeconds, errorMessage, expectedWindow.min, isProcessing, isQueued]);

  const phaseIndex = currentStage.key === 'queued' ? 0 : currentStage.key === 'processing' ? 1 : 2;

  const elapsedLabel = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  const etaText = errorMessage
    ? errorMessage
    : `Elapsed ${elapsedLabel} · Usually ${expectedWindow.min}-${expectedWindow.max}s for ${generationMode === 'video' ? 'video' : 'photo'} generation`;

  const handleCancel = () => {
    if (requestId) {
      if (generationMode === 'video') {
        void cancelVideo(requestId);
      } else {
        void cancelPhoto(requestId);
      }
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  if (!style) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.topBar}>
          <Pressable
            onPress={handleBackPress}
            style={styles.iconBtn}
            testID="generation-back"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.icon}>←</Text>
          </Pressable>
          <Text style={styles.brand}>DREAMSHOT</Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.frameWrap}>
          <View style={styles.frame}>
            <Text style={styles.corner}>✦</Text>
            <Text style={[styles.corner, styles.cornerRight]}>✦</Text>
            <Text style={[styles.corner, styles.cornerBottom]}>✦</Text>
            <Text style={[styles.corner, styles.cornerBottomRight]}>✦</Text>
            <View style={styles.canvas}>
              {busy ? (
                <View style={styles.shimmerStage}>
                  <Animated.View style={[styles.shimmerSweep, { transform: [{ translateX: shimmerTranslate }] }]}>
                    <LinearGradient
                      colors={['rgba(156,72,234,0)', 'rgba(156,72,234,0.55)', 'rgba(83,221,252,0.75)', 'rgba(83,221,252,0)']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.shimmerGradient}
                    />
                  </Animated.View>
                  <Text style={styles.shimmerLabel}>Rendering DreamShot…</Text>
                </View>
              ) : (
                <Text style={styles.brush}>🖌️</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.copyWrap}>
          <Text style={styles.title}>Your DreamShot image is being crafted...</Text>
          <Text style={styles.subTitle}>Our AI is meticulously crafting every detail for {style.title}.</Text>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.phaseLabel}>CURRENT PHASE</Text>
              <Text style={styles.phaseValue}>{currentStage.label}</Text>
            </View>
            <Text style={styles.percent}>{errorMessage ? '—' : `${currentStage.percent}%`}</Text>
          </View>

          <View style={styles.stageRail}>
            {['Queued', 'Painting', 'Finalizing'].map((label, index) => {
              const reached = index <= phaseIndex;
              const active = index === phaseIndex;
              return (
                <View key={label} style={styles.stageItem}>
                  <View style={[styles.stageDot, reached ? styles.stageDotReached : null, active ? styles.stageDotActive : null]} />
                  <Text style={[styles.stageText, reached ? styles.stageTextReached : null]}>{label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${currentStage.percent}%` }, errorMessage ? styles.fillError : null]} />
          </View>

          <Text style={styles.eta}>{currentStage.detail}</Text>
          <Text style={styles.etaSecondary}>{etaText}</Text>

          {!errorMessage ? (
            <Animated.View style={[styles.quoteWrap, { opacity: quoteOpacity }]}>
              <Text style={styles.quoteText}>{PROGRESS_QUOTES[quoteIndex]}</Text>
            </Animated.View>
          ) : null}
        </View>

        {canCancel && !errorMessage ? (
          <Pressable testID="cancel-generation" style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel & Refund</Text>
          </Pressable>
        ) : null}

        {errorMessage ? (
          isInsufficientCoinsError ? (
            <View testID="buy-coins-cta-modal" style={styles.buyCoinsCard}>
              <Text style={styles.buyCoinsTitle}>You are out of coins</Text>
              <Text style={styles.buyCoinsSubtitle}>This generation requires more coins. Top up to continue.</Text>
              <Pressable
                testID="buy-coins-cta-button"
                style={styles.primaryBtn}
                onPress={() => router.push('/(tabs)/coins')}
              >
                <Text style={styles.primaryBtnText}>Buy Coins</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              testID="retry-generation"
              style={styles.primaryBtn}
              onPress={() => {
                didStartRef.current = false;
                setRequestId(null);
                setErrorMessage(null);
                setRetryCount((c) => c + 1);
                setElapsedSeconds(0);
                setStartedAt(Date.now());
              }}
            >
              <Text style={styles.primaryBtnText}>Retry Generation</Text>
            </Pressable>
          )
        ) : null}

        <View style={styles.footerGlyph}>
          <Text style={styles.footerGlyphText}>✦</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function GenerationProgressScreen(): React.JSX.Element {
  return (
    <ProgressErrorBoundary>
      <GenerationProgressScreenContent />
    </ProgressErrorBoundary>
  );
}

const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B19',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    color: '#F6F8FF',
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  subtitle: {
    color: '#B9C7E6',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#9C48EA',
  },
  buttonText: {
    color: '#F6F8FF',
    fontSize: 14,
    fontWeight: '700',
  },
});

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette'], brand: ReturnType<typeof useAppTheme>['brand']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 40 },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, paddingBottom: 12 },
    iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    icon: { fontSize: 24, color: palette.text },
    brand: { color: palette.text, fontSize: 14, fontWeight: '700', letterSpacing: 1.2 },
    frameWrap: { alignItems: 'center' },
    frame: {
      width: '100%',
      maxWidth: 280,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: brand.accent,
      backgroundColor: palette.cardBackground,
      padding: 16,
    },
    corner: { position: 'absolute', top: 8, left: 8, color: brand.accent, fontSize: 20 },
    cornerRight: { left: undefined, right: 8 },
    cornerBottom: { top: undefined, bottom: 8 },
    cornerBottomRight: { top: undefined, left: undefined, right: 8, bottom: 8 },
    canvas: {
      aspectRatio: 1,
      width: '100%',
      borderRadius: 14,
      borderWidth: 6,
      borderColor: brand.accent,
      backgroundColor: palette.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    shimmerStage: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      backgroundColor: '#050B19',
    },
    shimmerSweep: {
      width: 220,
      height: '100%',
      position: 'absolute',
    },
    shimmerGradient: {
      flex: 1,
      transform: [{ skewX: '-22deg' }],
    },
    shimmerLabel: {
      color: palette.text,
      textAlign: 'center',
      fontFamily: 'SpaceGrotesk_700Bold',
      fontSize: 16,
      letterSpacing: 0.4,
    },
    brush: { fontSize: 48, opacity: 0.6 },
    copyWrap: { marginTop: 14, alignItems: 'center' },
    title: { color: palette.text, fontSize: 22, textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold', fontWeight: '700' },
    subTitle: { marginTop: 6, color: palette.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
    progressWrap: { marginTop: 16, gap: 6 },
    progressHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    phaseLabel: { fontSize: 11, color: palette.textSecondary, letterSpacing: 1.1, fontWeight: '700' },
    phaseValue: { marginTop: 3, fontSize: 18, color: palette.text, fontWeight: '600' },
    percent: { color: brand.accent, fontSize: 30, fontFamily: 'SpaceGrotesk_700Bold', fontStyle: 'italic', fontWeight: '700' },
    stageRail: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
    stageItem: { flex: 1, alignItems: 'center' },
    stageDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: palette.border, marginBottom: 4 },
    stageDotReached: { backgroundColor: brand.accent },
    stageDotActive: { transform: [{ scale: 1.2 }] },
    stageText: { fontSize: 11, color: palette.textSecondary },
    stageTextReached: { color: palette.text, fontWeight: '700' },
    track: { height: 12, borderRadius: 999, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceVariant, padding: 1 },
    fill: { height: '100%', borderRadius: 999, backgroundColor: brand.accent },
    fillError: { backgroundColor: '#EF4444' },
    eta: { textAlign: 'center', marginTop: 4, color: palette.text, fontSize: 13, fontWeight: '600' },
    etaSecondary: { textAlign: 'center', marginTop: 2, color: palette.textSecondary, fontSize: 12 },
    quoteWrap: { marginTop: 10, minHeight: 46, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
    quoteText: { color: brand.accent, fontSize: 15, textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold', fontStyle: 'italic', lineHeight: 22 },
    cancelBtn: {
      marginTop: 16,
      height: 48,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelBtnText: { color: palette.textSecondary, fontSize: 14, fontWeight: '600' },
    primaryBtn: {
      marginTop: 26,
      height: 52,
      borderRadius: 13,
      backgroundColor: brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: { color: palette.onPrimary, fontSize: 15, fontWeight: '700' },
    buyCoinsCard: {
      marginTop: 22,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.borderVariant,
      backgroundColor: palette.surface,
      gap: 6,
    },
    buyCoinsTitle: {
      color: palette.text,
      fontSize: 18,
      fontFamily: 'SpaceGrotesk_700Bold',
    },
    buyCoinsSubtitle: {
      color: palette.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    footerGlyph: { alignItems: 'center', marginTop: 16 },
    footerGlyphText: { color: brand.accent, fontSize: 22 },
  });