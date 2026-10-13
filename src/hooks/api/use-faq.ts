import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Faq, FaqRequest } from "@/types/api";

export const useGetFaqs = () => {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Faq[]>>("/admin/faqs");
      return response.data;
    },
  });
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FaqRequest) => {
      const response = await apiClient.post<ApiResponse<Faq>>("/admin/faqs", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FaqRequest }) => {
      const response = await apiClient.put<ApiResponse<Faq>>(`/admin/faqs/${id}`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ _id: string }>>(`/admin/faqs/${id}`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
};
