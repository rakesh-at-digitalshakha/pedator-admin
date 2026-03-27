/**
 * Category & Sub-Category Management API hooks
 * Handles CRUD operations for course categories and sub-categories
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  Category,
  CourseLesson,
  CourseModule,
  CreateCategoryRequest,
  CreateCourseLessonRequest,
  CreateCourseModuleRequest,
  CreateSubCategoryRequest,
  PaginationParams,
  SubCategory,
} from "@/types/api";

// ============= Category Management =============

/**
 * Get all categories
 */
export const useGetAllCategories = (params?: PaginationParams & { search?: string }) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      if (params?.page) urlParams.append("page", params.page.toString());
      if (params?.limit) urlParams.append("limit", params.limit.toString());
      if (params?.search) urlParams.append("search", params.search);

      const response = await apiClient.get<ApiResponse<Category[]>>(
        `/course/courseCategory/all?${urlParams.toString()}`,
      );
      return response.data;
    },
  });
};

/**
 * Create category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      const response = await apiClient.post<ApiResponse<Category>>("/course/courseCategory/add", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Update category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
      const response = await apiClient.put<ApiResponse<Category>>(`/course/courseCategory/update/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Delete category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/course/courseCategory/delete/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// ============= Sub-Category Management =============

/**
 * Get all sub-categories
 */
export const useGetAllSubCategories = (categoryId?: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ["subcategories", categoryId, params],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      if (params?.page) urlParams.append("page", params.page.toString());
      if (params?.limit) urlParams.append("limit", params.limit.toString());

      const endpoint = categoryId
        ? `/course/courseSubCategory/all/${categoryId}`
        : `/course/courseSubCategory/all?${urlParams.toString()}`;

      const response = await apiClient.get<ApiResponse<SubCategory[]>>(endpoint);
      return response.data;
    },
  });
};

/**
 * Create sub-category
 */
export const useCreateSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSubCategoryRequest) => {
      const response = await apiClient.post<ApiResponse<SubCategory>>("/course/courseSubCategory/add", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};

/**
 * Update sub-category
 */
export const useUpdateSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubCategory> }) => {
      const response = await apiClient.put<ApiResponse<SubCategory>>(`/course/courseSubCategory/update/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};

/**
 * Delete sub-category
 */
export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/course/courseSubCategory/delete/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};

// ============= Course Module Management =============

/**
 * Get all modules
 */
export const useGetAllModules = (subCategoryId?: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ["course-modules", subCategoryId, params],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      if (params?.page) urlParams.append("page", params.page.toString());
      if (params?.limit) urlParams.append("limit", params.limit.toString());

      const endpoint = subCategoryId
        ? `/course/courseModule/all/${subCategoryId}`
        : `/course/courseModule/all?${urlParams.toString()}`;

      const response = await apiClient.get<ApiResponse<CourseModule[]>>(endpoint);
      return response.data;
    },
  });
};

/**
 * Create module
 */
export const useCreateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseModuleRequest) => {
      const response = await apiClient.post<ApiResponse<CourseModule>>("/course/courseModule/add", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules"] });
    },
  });
};

/**
 * Update module
 */
export const useUpdateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CourseModule> }) => {
      const response = await apiClient.put<ApiResponse<CourseModule>>(`/course/courseModule/update/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules"] });
    },
  });
};

/**
 * Delete module
 */
export const useDeleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/course/courseModule/delete/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules"] });
    },
  });
};

// ============= Course Lesson Management =============

/**
 * Get all lessons
 */
export const useGetAllLessons = (moduleId?: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ["course-lessons", moduleId, params],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      if (params?.page) urlParams.append("page", params.page.toString());
      if (params?.limit) urlParams.append("limit", params.limit.toString());

      const endpoint = moduleId
        ? `/course/courseLesson/all/${moduleId}`
        : `/course/courseLesson/all?${urlParams.toString()}`;

      const response = await apiClient.get<ApiResponse<CourseLesson[]>>(endpoint);
      return response.data;
    },
  });
};

/**
 * Create lesson
 */
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseLessonRequest) => {
      const response = await apiClient.post<ApiResponse<CourseLesson>>("/course/courseLesson/add", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons"] });
    },
  });
};

/**
 * Update lesson
 */
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CourseLesson> }) => {
      const response = await apiClient.put<ApiResponse<CourseLesson>>(`/course/courseLesson/update/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons"] });
    },
  });
};

/**
 * Delete lesson
 */
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/course/courseLesson/delete/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons"] });
    },
  });
};
