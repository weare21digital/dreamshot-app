import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COIN_BALANCE_KEY = '@coins/balance';
const FIRST_LAUNCH_BONUS_FLAG_KEY = 'royal_first_launch_bonus_given';
const FIRST_LAUNCH_BONUS_COINS = 20;

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

async function ensureFirstLaunchBonus(currentBalance: number): Promise<number> {
  try {
    const bonusAlreadyGiven = await AsyncStorage.getItem(FIRST_LAUNCH_BONUS_FLAG_KEY);

    if (bonusAlreadyGiven === 'true') {
      return currentBalance;
    }

    const nextBalance = currentBalance + FIRST_LAUNCH_BONUS_COINS;
    await AsyncStorage.multiSet([
      [COIN_BALANCE_KEY, String(nextBalance)],
      [FIRST_LAUNCH_BONUS_FLAG_KEY, 'true'],
    ]);

    return nextBalance;
  } catch {
    return currentBalance;
  }
}

export type UseCoinsResult = {
  balance: number;
  isLoading: boolean;
  addCoins: (amount: number) => Promise<number>;
  spendCoins: (amount: number) => Promise<boolean>;
  hasEnough: (amount: number) => Promise<boolean>;
  reload: () => Promise<void>;
};

export function useCoins(): UseCoinsResult {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const storedBalance = await loadBalanceFromStorage();
    const initializedBalance = await ensureFirstLaunchBonus(storedBalance);
    setBalance(initializedBalance);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addCoins = useCallback(async (amount: number): Promise<number> => {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount === 0) {
      const current = await loadBalanceFromStorage();
      return current;
    }

    const current = await loadBalanceFromStorage();
    const nextBalance = current + safeAmount;
    setBalance(nextBalance);
    await saveBalanceToStorage(nextBalance);
    return nextBalance;
  }, []);

  const spendCoins = useCallback(async (amount: number): Promise<boolean> => {
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
    return true;
  }, []);

  const hasEnough = useCallback(async (amount: number): Promise<boolean> => {
    const safeAmount = Math.max(0, Math.floor(amount));
    const current = await loadBalanceFromStorage();
    return current >= safeAmount;
  }, []);

  return {
    balance,
    isLoading,
    addCoins,
    spendCoins,
    hasEnough,
    reload,
  };
}
