import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { useCoins } from '../hooks/useCoins';
import { usePayments } from '../../../services/payments/usePayments';
import { COIN_PACKS } from '../../../config/iap';
import { redeemIapPurchase } from '../services/iapRedemption';

export function CoinsPurchaseScreen(): React.JSX.Element {
  const { palette, brand, theme } = useAppTheme();
  const { balance, applyServerBalance, reload } = useCoins();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const [feedback, setFeedback] = useState<string | null>(null);
  const [activePurchaseId, setActivePurchaseId] = useState<string | null>(null);

  const productIds = useMemo(() => COIN_PACKS.map((pack) => pack.sku), []);

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
      setFeedback('Purchase completed. Verifying and redeeming...');
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
  }, [completePurchase, isLoading, products]);

  useEffect(() => {
    let cancelled = false;

    const finalize = async () => {
      if (!lastPurchase) return;

      const productId = lastPurchase.productId ?? '';

      const matchedPack = COIN_PACKS.find((pack) => pack.sku === productId);
      if (!matchedPack) return;

      try {
        const redeemed = await redeemIapPurchase(productId, lastPurchase);

        if (cancelled) return;

        await applyServerBalance(redeemed.balance);
        await reload();
        setFeedback(`Purchase successful. Added ${matchedPack.coins} coins.`);
      } catch {
        if (cancelled) return;
        setFeedback('Purchase completed, but redemption failed. Please use Restore Purchases.');
      }
    };

    void finalize();
    return () => {
      cancelled = true;
    };
  }, [applyServerBalance, lastPurchase, reload]);

  const handleRestore = useCallback(async () => {
    setFeedback(null);

    try {
      const restored = await restorePurchases();

      if (restored.length === 0) {
        setFeedback('No previous purchases found.');
        return;
      }

      let redeemedCount = 0;

      for (const purchase of restored) {
        const productId = purchase.productId ?? '';
        const matchedPack = COIN_PACKS.find((pack) => pack.sku === productId);
        if (!matchedPack) continue;

        try {
          await redeemIapPurchase(productId, purchase);
          redeemedCount += 1;
        } catch {
          // keep restoring remaining purchases
        }
      }

      await reload();

      if (redeemedCount > 0) {
        setFeedback(`Restore successful. Redeemed ${redeemedCount} purchase(s).`);
      } else {
        setFeedback('Restore complete. No redeemable purchases found.');
      }
    } catch {
      setFeedback('Restore failed. Please try again.');
    }
  }, [reload, restorePurchases]);

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

        {COIN_PACKS.map((pack) => {
          const localizedPrice = productPriceMap.get(pack.sku);
          const price = localizedPrice || pack.fallbackPrice;

          return (
            <Card
              key={pack.sku}
              style={{ backgroundColor: palette.cardBackground }}
              testID={`coins-pack-${pack.sku}`}
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
                    void handlePurchase(pack.sku);
                  }}
                  disabled={isLoading || isPurchasing || isRestoring}
                  loading={isPurchasing && activePurchaseId === pack.sku}
                  style={{ marginTop: 12 }}
                  buttonColor={brand.primary}
                  textColor={palette.onPrimary}
                  testID={`coins-buy-${pack.sku}`}
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
