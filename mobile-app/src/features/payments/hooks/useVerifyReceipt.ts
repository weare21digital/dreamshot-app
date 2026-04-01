import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import type { ReceiptPayload } from '../utils/extractReceipt';

export interface VerificationResponse {
  isValid: boolean;
  productId: string;
  purchaseDate: string;
  expiryDate?: string;
  premiumStatus: string;
  alreadyProcessed?: boolean;
}

export function useVerifyReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      receipt: ReceiptPayload,
    ): Promise<VerificationResponse> => {
      const response = await apiClient.post(
        '/payments/verify-receipt',
        receipt,
      );
      return response as unknown as VerificationResponse;
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
