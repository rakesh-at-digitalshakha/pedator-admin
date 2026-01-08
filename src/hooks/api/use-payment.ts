/**
 * Payment & Payout Management API hooks
 * Handles payout operations to mentors
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Payout, PayoutRequest } from "@/types/api";

/**
 * Initiate payout to mentor
 */
export const useInitiatePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PayoutRequest) => {
      const response = await apiClient.post<ApiResponse<Payout>>("/payments/payout", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
  });
};

/**
 * Get payout details
 */
export const useGetPayoutDetails = (payoutId: string) => {
  return useQuery({
    queryKey: ["payout", payoutId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Payout>>(`/payments/payout/${payoutId}`);
      return response.data;
    },
    enabled: !!payoutId,
  });
};
