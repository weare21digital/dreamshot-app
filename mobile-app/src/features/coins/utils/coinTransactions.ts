import AsyncStorage from '@react-native-async-storage/async-storage';

const COIN_TRANSACTIONS_KEY = '@coins/transactions';
const MAX_TRANSACTIONS = 100;

export type CoinTransactionSource = 'purchase' | 'generation' | 'refund' | 'bonus' | 'adjustment';
export type CoinTransactionType = 'credit' | 'debit';

export type CoinTransaction = {
  id: string;
  createdAt: string;
  type: CoinTransactionType;
  source: CoinTransactionSource;
  amount: number;
  balanceAfter: number;
  note?: string;
};

const parseTransactions = (raw: string | null): CoinTransaction[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((entry): entry is CoinTransaction => {
      if (!entry || typeof entry !== 'object') return false;
      return typeof entry.id === 'string' && typeof entry.createdAt === 'string' && typeof entry.type === 'string' && typeof entry.source === 'string' && typeof entry.amount === 'number' && typeof entry.balanceAfter === 'number';
    });
  } catch {
    return [];
  }
};

export async function getCoinTransactions(): Promise<CoinTransaction[]> {
  const raw = await AsyncStorage.getItem(COIN_TRANSACTIONS_KEY);
  return parseTransactions(raw);
}

export async function recordCoinTransaction(params: {
  type: CoinTransactionType;
  source: CoinTransactionSource;
  amount: number;
  balanceAfter: number;
  note?: string;
}): Promise<void> {
  const safeAmount = Math.max(0, Math.floor(params.amount));
  if (safeAmount <= 0) return;

  const transactions = await getCoinTransactions();
  const next: CoinTransaction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    type: params.type,
    source: params.source,
    amount: safeAmount,
    balanceAfter: Math.max(0, Math.floor(params.balanceAfter)),
    note: params.note,
  };

  const merged = [next, ...transactions].slice(0, MAX_TRANSACTIONS);
  await AsyncStorage.setItem(COIN_TRANSACTIONS_KEY, JSON.stringify(merged));
}
