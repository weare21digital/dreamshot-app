import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../../lib/apiClient';
import { recordCoinTransaction } from '../utils/coinTransactions';

const COIN_BALANCE_KEY = '@coins/balance';
const PROFILE_SYNC_TTL_MS = 30_000;

let lastProfileSyncAt = 0;
let profileSyncPromise: Promise<number | null> | null = null;

async function loadBalanceFromStorage(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(COIN_BALANCE_KEY);
    const parsed = raw !== null ? Number(raw) : 0;

    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0;
    }

    return Math.floor(parsed);
  } catch {
    return 0;
  }
}

async function saveBalanceToStorage(balance: number): Promise<void> {
  await AsyncStorage.setItem(COIN_BALANCE_KEY, String(Math.max(0, Math.floor(balance))));
}

function extractServerBalance(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const user = (root.user && typeof root.user === 'object' ? root.user : root) as Record<string, unknown>;
  const coinAccount = user.coinAccount && typeof user.coinAccount === 'object'
    ? (user.coinAccount as Record<string, unknown>)
    : null;

  const candidates = [
    coinAccount?.balance,
    user.coinBalance,
    user.balance,
  ];

  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return Math.floor(value);
    }
  }

  return null;
}

async function fetchServerBalance(force = false): Promise<number | null> {
  const now = Date.now();

  if (!force && now - lastProfileSyncAt < PROFILE_SYNC_TTL_MS) {
    return null;
  }

  if (!profileSyncPromise) {
    profileSyncPromise = (async () => {
      try {
        const profile = await apiClient.get('/users/profile');
        const balance = extractServerBalance(profile);
        if (balance !== null) {
          lastProfileSyncAt = Date.now();
        }
        return balance;
      } catch {
        return null;
      } finally {
        profileSyncPromise = null;
      }
    })();
  }

  return profileSyncPromise;
}

export type UseCoinsResult = {
  balance: number;
  isLoading: boolean;
  addCoins: (amount: number, metadata?: { source?: 'purchase' | 'refund' | 'bonus' | 'adjustment'; note?: string }) => Promise<number>;
  spendCoins: (amount: number, metadata?: { source?: 'generation' | 'adjustment'; note?: string }) => Promise<boolean>;
  hasEnough: (amount: number) => Promise<boolean>;
  applyServerBalance: (balance: number | null | undefined) => Promise<number>;
  reload: () => Promise<void>;
};

export function useCoins(): UseCoinsResult {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const storedBalance = await loadBalanceFromStorage();
    const serverBalance = await fetchServerBalance();
    const nextBalance = serverBalance ?? storedBalance;
    setBalance(nextBalance);
    if (serverBalance !== null) {
      await saveBalanceToStorage(serverBalance);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addCoins = useCallback(async (amount: number, metadata?: { source?: 'purchase' | 'refund' | 'bonus' | 'adjustment'; note?: string }): Promise<number> => {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount === 0) {
      const current = await loadBalanceFromStorage();
      return current;
    }

    const current = await loadBalanceFromStorage();
    const nextBalance = current + safeAmount;
    setBalance(nextBalance);
    await saveBalanceToStorage(nextBalance);
    await recordCoinTransaction({
      type: 'credit',
      amount: safeAmount,
      balanceAfter: nextBalance,
      source: metadata?.source ?? 'adjustment',
      note: metadata?.note,
    });
    return nextBalance;
  }, []);

  const spendCoins = useCallback(async (amount: number, metadata?: { source?: 'generation' | 'adjustment'; note?: string }): Promise<boolean> => {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount === 0) {
      return true;
    }

    const current = await loadBalanceFromStorage();

    if (current < safeAmount) {
      return false;
    }

    const nextBalance = current - safeAmount;
    setBalance(nextBalance);
    await saveBalanceToStorage(nextBalance);
    await recordCoinTransaction({
      type: 'debit',
      amount: safeAmount,
      balanceAfter: nextBalance,
      source: metadata?.source ?? 'adjustment',
      note: metadata?.note,
    });
    return true;
  }, []);

  const hasEnough = useCallback(async (amount: number): Promise<boolean> => {
    const safeAmount = Math.max(0, Math.floor(amount));
    const current = await loadBalanceFromStorage();
    return current >= safeAmount;
  }, []);

  const applyServerBalance = useCallback(async (nextBalance: number | null | undefined): Promise<number> => {
    const parsed = Number(nextBalance);

    if (!Number.isFinite(parsed) || parsed < 0) {
      const current = await loadBalanceFromStorage();
      return current;
    }

    const safeBalance = Math.floor(parsed);
    setBalance(safeBalance);
    await saveBalanceToStorage(safeBalance);
    return safeBalance;
  }, []);

  return {
    balance,
    isLoading,
    addCoins,
    spendCoins,
    hasEnough,
    applyServerBalance,
    reload,
  };
}
