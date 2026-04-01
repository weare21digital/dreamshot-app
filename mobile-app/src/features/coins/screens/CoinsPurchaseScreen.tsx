import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { useCoins } from '../hooks/useCoins';
import { usePayments } from '../../../services/payments/usePayments';
import { grantCoinsOnce } from '../utils/coinPurchaseLedger';

const COIN_PACKAGES = [
  { id: 'coins_100', label: 'Starter', coins: 100 },
  { id: 'coins_300', label: 'Value', coins: 300 },
] as const;

const formatFallbackPrice = (coins: number): string => {
  const usd = (coins / 100).toFixed(2);
  return `$${usd}`;
};

export function CoinsPurchaseScreen(): React.JSX.Element {
  const { palette, brand, theme } = useAppTheme();
  const { balance, addCoins, reload } = useCoins();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const [feedback, setFeedback] = useState<string | null>(null);
  const [activePurchaseId, setActivePurchaseId] = useState<string | null>(null);

  const productIds = useMemo(() => COIN_PACKAGES.map((pack) => pack.id), []);

  const {
    products,
    isLoading,
    isPurchasing,
    isRestoring,
    error,
    purchaseOneTime,
    restorePurchases,
    refreshProducts,
    lastPurchase,
  } = usePayments({
    productIds,
    subscriptionIds: [],
    consumableProductIds: productIds,
  });

  const productPriceMap = useMemo(() => {
    const map = new Map<string, string>();

    products.forEach((product) => {
      map.set(product.id, product.displayPrice ?? '');
    });

    return map;
  }, [products]);

  const completePurchase = useCallback(async (productId: string) => {
    try {
      await purchaseOneTime(productId);
      setFeedback('Purchase completed. Finalizing...');
    } catch {
      setFeedback('Purchase failed. Please try again.');
    }
  }, [purchaseOneTime]);

  const handlePurchase = useCallback(async (productId: string) => {
    if (isLoading) {
      setFeedback('Store packages are still loading. Please wait a moment.');
      return;
    }

    setFeedback(null);
    setActivePurchaseId(productId);

    try {
      const hasStoreProduct = products.some((product) => product.id === productId);

      if (!hasStoreProduct) {
        setFeedback('This product is not available in the store. Please try again later.');
        return;
      }

      await completePurchase(productId);
    } finally {
      setActivePurchaseId(null);
    }
  }, [addCoins, completePurchase, isLoading, products, reload]);

  useEffect(() => {
    let cancelled = false;

    const finalize = async () => {
      if (!lastPurchase) return;
      const productId = lastPurchase.productId ?? '';
      const txId = lastPurchase.transactionId ?? null;
      const matchedPack = COIN_PACKAGES.find((pack) => pack.id === productId);

      if (!matchedPack) return;

      const grant = await grantCoinsOnce({
        transactionId: txId,
        productId,
        coins: matchedPack.coins,
        source: 'purchase',
      });

      if (cancelled) return;

      if (grant.granted) {
        await addCoins(matchedPack.coins);
        await reload();
        setFeedback(`Purchase successful. Added ${matchedPack.coins} coins.`);
      } else if (grant.reason === 'duplicate') {
        setFeedback('Purchase already applied on this device.');
      }
    };

    void finalize();
    return () => {
      cancelled = true;
    };
  }, [addCoins, lastPurchase, reload]);

  const handleRestore = useCallback(async () => {
    setFeedback(null);

    try {
      const restored = await restorePurchases();

      if (restored.length === 0) {
        setFeedback('No previous purchases found.');
        return;
      }

      let restoredCoins = 0;

      for (const purchase of restored) {
        const productId = purchase.productId ?? '';
        const txId = purchase.transactionId ?? null;
        const matchedPack = COIN_PACKAGES.find((pack) => pack.id === productId);

        if (!matchedPack) continue;

        const grant = await grantCoinsOnce({
          transactionId: txId,
          productId,
          coins: matchedPack.coins,
          source: 'restore',
        });

        if (grant.granted) {
          restoredCoins += matchedPack.coins;
        }
      }

      if (restoredCoins > 0) {
        await addCoins(restoredCoins);
        await reload();
        setFeedback(`Restore successful. Added ${restoredCoins} coins.`);
      } else {
        setFeedback('Restore complete. No new coin purchases to apply.');
      }
    } catch {
      setFeedback('Restore failed. Please try again.');
    }
  }, [addCoins, reload, restorePurchases]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Card style={{ backgroundColor: palette.cardBackground }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: palette.text }}>Coin Balance</Text>
            <Text variant="headlineMedium" style={{ color: brand.primary, marginTop: 8 }} testID="coins-balance-value">
              {balance}
            </Text>
            <Text variant="bodyMedium" style={{ color: palette.textSecondary, marginTop: 6 }}>
              Buy coins for AI-powered features.
            </Text>
          </Card.Content>
        </Card>

        {COIN_PACKAGES.map((pack) => {
          const localizedPrice = productPriceMap.get(pack.id);
          const price = localizedPrice || formatFallbackPrice(pack.coins);

          return (
            <Card
              key={pack.id}
              style={{ backgroundColor: palette.cardBackground }}
              testID={`coins-pack-${pack.id}`}
            >
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text variant="titleMedium" style={{ color: palette.text }}>
                      {pack.label}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: palette.textSecondary }}>
                      {pack.coins} coins
                    </Text>
                  </View>
                  <Text variant="titleMedium" style={{ color: brand.primary }}>
                    {price}
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={() => {
                    void handlePurchase(pack.id);
                  }}
                  disabled={isLoading || isPurchasing || isRestoring}
                  loading={isPurchasing && activePurchaseId === pack.id}
                  style={{ marginTop: 12 }}
                  buttonColor={brand.primary}
                  textColor={palette.onPrimary}
                  testID={`coins-buy-${pack.id}`}
                >
                  Buy {pack.coins}
                </Button>
              </Card.Content>
            </Card>
          );
        })}

        <Button
          mode="outlined"
          onPress={() => {
            void handleRestore();
          }}
          disabled={isRestoring || isPurchasing}
          loading={isRestoring}
          textColor={theme.colors.primary}
          style={{ marginTop: 4 }}
          testID="coins-restore"
        >
          Restore Purchases
        </Button>

        <Button
          mode="text"
          onPress={() => {
            void refreshProducts();
          }}
          disabled={isLoading || isPurchasing}
          textColor={theme.colors.primary}
          testID="coins-refresh-products"
        >
          Refresh Store Packages
        </Button>

        {error && (
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            {error.message || 'Store connection error'}
          </Text>
        )}

        {lastPurchase && (
          <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
            Last purchase: {lastPurchase.productId || 'unknown'}
          </Text>
        )}

        {feedback && (
          <Text variant="bodyMedium" style={{ color: palette.textSecondary }} testID="coins-feedback">
            {feedback}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
