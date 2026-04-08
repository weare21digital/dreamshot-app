import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppTheme } from '../../src/contexts/ThemeContext';
import { CoinTransaction, getCoinTransactions } from '../../src/features/coins/utils/coinTransactions';

const sourceLabel: Record<CoinTransaction['source'], string> = {
  purchase: 'Purchase',
  generation: 'Generation',
  refund: 'Refund',
  bonus: 'Bonus',
  adjustment: 'Adjustment',
};

export default function CoinHistoryScreen(): React.JSX.Element {
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const [transactions, setTransactions] = React.useState<CoinTransaction[]>([]);
  const styles = useMemo(() => createStyles(palette, brand), [palette, brand]);

  const load = useCallback(async () => {
    const rows = await getCoinTransactions();
    setTransactions(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton} accessibilityRole="button" accessibilityLabel="Back to coins" testID="coin-history-back">
          <MaterialIcons name="arrow-back" size={20} color={palette.text} />
        </Pressable>
        <Text style={styles.title}>Coin History</Text>
        <View style={styles.headerButton} />
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="history" size={28} color={palette.textSecondary} />
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySub}>Purchases, generations, and refunds will appear here.</Text>
        </View>
      ) : (
        <FlatList
          testID="coin-history-list"
          contentContainerStyle={styles.listContent}
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isCredit = item.type === 'credit';
            return (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle}>{sourceLabel[item.source]}</Text>
                  <Text style={styles.rowMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
                  {item.note ? <Text style={styles.rowMeta}>{item.note}</Text> : null}
                </View>
                <View style={styles.rowRight}>
                  <Text style={[styles.amount, isCredit ? styles.amountCredit : styles.amountDebit]}>{isCredit ? '+' : '-'}{item.amount}</Text>
                  <Text style={styles.balance}>Balance {item.balanceAfter}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette'], brand: ReturnType<typeof useAppTheme>['brand']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderVariant,
  },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceContainerHigh,
  },
  title: { color: palette.text, fontSize: 22, fontFamily: 'SpaceGrotesk_700Bold', fontWeight: '700' },
  listContent: { padding: 16, gap: 10 },
  row: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderVariant,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLeft: { flex: 1, gap: 4 },
  rowTitle: { color: palette.text, fontWeight: '700', fontSize: 15 },
  rowMeta: { color: palette.textSecondary, fontSize: 12 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  amount: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, fontWeight: '700' },
  amountCredit: { color: '#22C55E' },
  amountDebit: { color: brand.accent },
  balance: { color: palette.textSecondary, fontSize: 12 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 28 },
  emptyTitle: { color: palette.text, fontWeight: '700', fontSize: 18 },
  emptySub: { color: palette.textSecondary, fontSize: 13, textAlign: 'center' },
});
