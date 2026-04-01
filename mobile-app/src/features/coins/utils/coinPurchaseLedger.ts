import AsyncStorage from '@react-native-async-storage/async-storage';

const PROCESSED_TX_KEY = '@coins/processed-transactions';
const LEDGER_KEY = '@coins/ledger';

type CoinLedgerEntry = {
  id: string;
  transactionId: string;
  productId: string;
  coins: number;
  source: 'purchase' | 'restore';
  createdAt: string;
};

async function getProcessedSet(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(PROCESSED_TX_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

async function saveProcessedSet(set: Set<string>): Promise<void> {
  await AsyncStorage.setItem(PROCESSED_TX_KEY, JSON.stringify(Array.from(set)));
}

async function appendLedger(entry: CoinLedgerEntry): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(LEDGER_KEY);
    const list: CoinLedgerEntry[] = raw ? JSON.parse(raw) : [];
    const next = [entry, ...(Array.isArray(list) ? list : [])].slice(0, 200);
    await AsyncStorage.setItem(LEDGER_KEY, JSON.stringify(next));
  } catch {
    // ignore ledger write failures (non-critical)
  }
}

export async function grantCoinsOnce(params: {
  transactionId?: string | null;
  productId: string;
  coins: number;
  source: 'purchase' | 'restore';
}): Promise<{ granted: boolean; reason?: 'duplicate' | 'missing_transaction' }> {
  const tx = params.transactionId?.trim();
  if (!tx) {
    return { granted: false, reason: 'missing_transaction' };
  }

  const processed = await getProcessedSet();
  if (processed.has(tx)) {
    return { granted: false, reason: 'duplicate' };
  }

  processed.add(tx);
  await saveProcessedSet(processed);

  await appendLedger({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    transactionId: tx,
    productId: params.productId,
    coins: params.coins,
    source: params.source,
    createdAt: new Date().toISOString(),
  });

  return { granted: true };
}
