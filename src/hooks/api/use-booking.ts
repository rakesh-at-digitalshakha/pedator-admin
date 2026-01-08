/**
 * Booking Management API hooks
 * Handles booking operations and status updates
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Booking, BookingFilters, CreateBookingRequest, UpdateBookingRequest } from "@/types/api";

/**
 * Get all bookings with filters
 */
export const useGetAllBookings = (filters?: BookingFilters) => {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.mentorId) params.append("mentorId", filters.mentorId);
      if (filters?.learnerId) params.append("learnerId", filters.learnerId);
      if (filters?.courseId) params.append("courseId", filters.courseId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);

      const response = await apiClient.get<ApiResponse<{ data: Booking[]; total: number; page: number; pages: number; count: number }>>(`/admin/bookings?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Get booking by ID
 */
export const useGetBookingById = (id: string) => {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Booking>>(`/course/bookings/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Create booking (Admin)
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingRequest) => {
      const response = await apiClient.post<ApiResponse<Booking>>("/admin/bookings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

/**
 * Update booking (Admin) - Full update
 */
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBookingRequest }) => {
      const response = await apiClient.put<ApiResponse<Booking>>(`/admin/bookings/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

/**
 * Update booking status (Admin)
 */
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      bookingStatus,
      reason,
    }: {
      id: string;
      bookingStatus: Booking["bookingStatus"];
      reason?: string;
    }) => {
      const response = await apiClient.patch<ApiResponse<Booking>>(`/admin/bookings/${id}/status`, {
        bookingStatus,
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
