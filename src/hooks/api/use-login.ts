import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import type { LoginRequest, LoginResponse } from "@/types/api";

export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>("/admin/login", credentials);
      return response.data;
    },
  });
};
