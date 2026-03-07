/**
 * Admin Management API hooks
 * Handles CRUD operations for admin users
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import type {
  AdminFilters,
  AdminStats,
  AdminUser,
  ApiResponse,
  CreateAdminRequest,
  CreateRoleRequest,
  Notification,
  PaginationParams,
  Role,
  UpdateAdminRequest,
  UpdateRoleRequest,
} from "@/types/api";

/**
 * Get all admins (Super Admin only)
 */
export const useGetAllAdmins = (filters?: AdminFilters) => {
  return useQuery({
    queryKey: ["admins", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.role) params.append("role", filters.role);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);

      const response = await apiClient.get<ApiResponse<AdminUser[]>>(`/admin/admins?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Get admin by ID
 */
export const useGetAdminById = (id: string) => {
  return useQuery({
    queryKey: ["admin", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AdminUser>>(`/admin/admins/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Create new admin
 */
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<AdminUser>, AxiosError, CreateAdminRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<AdminUser>>("/admin/admins", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"], exact: false });
    },
  });
};

/**
 * Update admin
 */
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<AdminUser>, AxiosError, { id: string; data: UpdateAdminRequest }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<ApiResponse<AdminUser>>(`/admin/admins/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admins"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin", variables.id], exact: false });
    },
  });
};

/**
 * Delete admin (Soft delete)
 */
export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, AxiosError, string>({
    mutationFn: async (id) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/admin/admins/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"], exact: false });
    },
  });
};

/**
 * Get admin dashboard statistics
 */
export const useGetAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AdminStats>>("/admin/stats");
      return response.data;
    },
  });
};

/**
 * Get admin profile
 */
export const useGetAdminProfile = () => {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AdminUser>>("/admin/profile");
      return response.data;
    },
  });
};

/**
 * Update admin profile
 */
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AdminUser>) => {
      const response = await apiClient.put<ApiResponse<AdminUser>>("/admin/profile", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
  });
};

/**
 * Get admin notifications
 */
export const useGetAdminNotifications = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const response = await apiClient.get<ApiResponse<Notification[]>>(`/admin/admin?${queryParams.toString()}`);
      return response.data;
    },
  });
};

/**
 * Mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.put<ApiResponse<Notification>>(`/admin/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });
};

/**
 * Save FCM token
 */
export const useSaveFcmToken = () => {
  return useMutation<ApiResponse<void>, AxiosError, { fcmToken: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<void>>("/admin/fcm-token", data);
      return response.data;
    },
  });
};

/**
 * Reset admin password (Super Admin only)
 */
export const useResetAdminPassword = () => {
  return useMutation<ApiResponse<void>, AxiosError, { id: string; password: string }>({
    mutationFn: async ({ id, password }) => {
      const response = await apiClient.post<ApiResponse<void>>(`/admin/admins/${id}/reset-password`, { password });
      return response.data;
    },
  });
};

/**
 * Change own password (Any admin)
 */
export const useChangePassword = () => {
  return useMutation<ApiResponse<void>, AxiosError, { currentPassword: string; newPassword: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<void>>("/admin/change-password", data);
      return response.data;
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLE MANAGEMENT HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Get all roles */
export const useGetAllRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Role[]> & { total: number; meta: { validResources: string[]; validActions: string[] } }>("/admin/roles");
      return response.data;
    },
  });
};

/** Get role meta (valid resources + actions) */
export const useGetRoleMeta = () => {
  return useQuery({
    queryKey: ["roles-meta"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ resources: string[]; actions: string[] }>>("/admin/roles/meta");
      return response.data;
    },
  });
};

/** Get role by ID */
export const useGetRoleById = (id: string) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Role>>(`/admin/roles/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/** Create role */
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Role>, AxiosError, CreateRoleRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<Role>>("/admin/roles", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"], exact: false }),
  });
};

/** Update role */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Role>, AxiosError, { id: string; data: UpdateRoleRequest }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<ApiResponse<Role>>(`/admin/roles/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["role", variables.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admins"], exact: false });
    },
  });
};

/** Delete role */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<void>, AxiosError, string>({
    mutationFn: async (id) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/admin/roles/${id}`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"], exact: false }),
  });
};
