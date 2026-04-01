import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCoins } from '../../src/features/coins/hooks/useCoins';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { COIN_PACKS, SKU_COINS } from '../../src/config/iap';
import { paymentService } from '../../src/services/payments/paymentService';
import { grantCoinsOnce } from '../../src/features/coins/utils/coinPurchaseLedger';

export default function CoinsScreen(): React.JSX.Element {
  const router = useRouter();
  const { balance, addCoins, reload } = useCoins();
  const { palette, brand } = useAppTheme();
  const isDark = palette.background === '#121316';
  const styles = React.useMemo(() => createStyles(palette, brand, isDark), [palette, brand, isDark]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const listenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    void paymentService.initialize().catch(() => {});

    listenerRef.current = paymentService.onPurchaseUpdated(async (purchase) => {
      const productId = (purchase as any).productId ?? (purchase as any).id ?? '';
      const transactionId = (purchase as any).transactionId ?? (purchase as any).transactionReceipt ?? '';
      const coins = SKU_COINS[productId] ?? 0;

      if (coins > 0) {
        const result = await grantCoinsOnce({
          transactionId,
          productId,
          coins,
          source: 'purchase',
        });

        if (result.granted) {
          await addCoins(coins);
        }
      }

      try {
        await paymentService.finishPurchase(purchase, true);
      } catch { /* best effort */ }

      setPurchasing(null);
      void reload();
    });

    const errorUnsub = paymentService.onPurchaseError(() => {
      setPurchasing(null);
    });

    return () => {
      listenerRef.current?.();
      errorUnsub();
    };
  }, [addCoins, reload]);

  const handleBuy = useCallback(async (sku: string) => {
    setPurchasing(sku);
    try {
      await paymentService.initialize();
      await paymentService.requestOneTimePurchase(sku);
    } catch (error: any) {
      setPurchasing(null);
      if (error?.code === 'E_USER_CANCELLED') return;
      Alert.alert('Purchase Failed', error?.message ?? 'Could not complete the purchase. Please try again.');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialIcons name="monetization-on" size={24} color={palette.text} />
        </View>
        <Text style={styles.headerTitle}>Royal Portrait</Text>
        <View style={styles.headerIcon}>
          <MaterialIcons name="history" size={24} color={palette.text} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceWrap}>
          <View style={styles.coinCircle}>
            <MaterialIcons name="paid" size={42} color={brand.accent} />
          </View>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text testID="coins-balance-value" style={styles.balanceValue}>{balance} Coins</Text>
          <View style={styles.goldDivider} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Purchase Coin Packs</Text>
          <Text style={styles.sectionSub}>Enhance your gallery with royal tokens</Text>
        </View>

        <View style={styles.packList}>
          {COIN_PACKS.map((pack) => (
            <Pressable
              key={pack.sku}
              testID={`coin-pack-${pack.sku}`}
              onPress={() => void handleBuy(pack.sku)}
              disabled={purchasing != null}
              style={[styles.packCard, pack.popular && styles.packCardPopular, purchasing != null && styles.packDisabled]}
            >
              {pack.popular ? <Text style={styles.popularPill}>Most Popular</Text> : null}

              <View style={styles.packLeft}>
                <View style={styles.packIconWrap}>
                  <MaterialIcons name={pack.icon} size={22} color={brand.accent} />
                </View>
                <View>
                  <Text style={styles.packCoins}>{pack.coins} Coins</Text>
                  <Text style={styles.packLabel}>{pack.label}</Text>
                </View>
              </View>

              <View style={styles.priceButton}>
                {purchasing === pack.sku ? (
                  <ActivityIndicator size="small" color={isDark ? '#1A1A2E' : '#FFFFFF'} />
                ) : (
                  <Text style={styles.priceText}>{pack.fallbackPrice}</Text>
                )}
              </View>
            </Pressable>
          ))}

          <View style={styles.decorWrap}>
            <MaterialIcons name="auto-awesome" size={16} color={brand.accent} />
            <MaterialIcons name="auto-awesome" size={16} color={brand.accent} />
            <MaterialIcons name="auto-awesome" size={16} color={brand.accent} />
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette'], brand: ReturnType<typeof useAppTheme>['brand'], isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: palette.borderVariant,
      backgroundColor: palette.background,
    },
    headerIcon: { width: 36, alignItems: 'center' },
    headerTitle: {
      color: palette.text,
      fontSize: 26,
      fontWeight: '700',
      fontFamily: 'serif',
      fontStyle: 'italic',
    },
    content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
    balanceWrap: { alignItems: 'center', marginBottom: 28 },
    coinCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.primaryContainer,
      marginBottom: 12,
    },
    balanceLabel: {
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: palette.textSecondary,
      fontWeight: '600',
    },
    balanceValue: {
      color: palette.text,
      fontSize: 54,
      lineHeight: 60,
      marginTop: 4,
      fontFamily: 'serif',
      fontStyle: 'italic',
      fontWeight: '700',
    },
    goldDivider: { marginTop: 10, width: 64, height: 2, backgroundColor: brand.accent },
    sectionHeader: { marginBottom: 12 },
    sectionTitle: { color: palette.text, fontSize: 24, fontFamily: 'serif', fontWeight: '700' },
    sectionSub: { color: palette.textSecondary, fontSize: 13, fontStyle: 'italic' },
    packList: { gap: 12 },
    decorWrap: {
      marginTop: 18,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      opacity: 0.35,
    },
    packCard: {
      borderWidth: 1,
      borderColor: brand.accent,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 16,
      backgroundColor: palette.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    packCardPopular: { borderWidth: 2 },
    packDisabled: { opacity: 0.5 },
    popularPill: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: '#10B981',
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderBottomLeftRadius: 8,
      borderTopRightRadius: 10,
    },
    packLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    packIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.secondaryContainer,
    },
    packCoins: { color: palette.text, fontSize: 24, fontFamily: 'serif', fontWeight: '700' },
    packLabel: { color: palette.textSecondary, fontSize: 12, fontStyle: 'italic' },
    priceButton: {
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: isDark ? '#C9A84C' : '#1A1A4E',
    },
    priceText: { color: isDark ? '#1A1A2E' : '#FFFFFF', fontSize: 14, fontWeight: '700' },
  });
