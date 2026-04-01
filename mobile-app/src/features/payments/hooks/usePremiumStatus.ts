import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';

export interface PremiumStatusData {
  hasPremium: boolean;
  premiumStatus: 'FREE' | 'PREMIUM_SUBSCRIPTION' | 'PREMIUM_LIFETIME';
  premiumExpiry?: string;
  activePayments: unknown[];
}

export function usePremiumStatus() {
  return useQuery<PremiumStatusData>({
    queryKey: ['payments', 'status'],
    queryFn: async () => {
      const response = await apiClient.get('/payments/user/status');
      return response as unknown as PremiumStatusData;
    },
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
