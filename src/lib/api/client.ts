import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { removeAuthCookie } from "@/lib/auth/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9001/api/v1";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data from both localStorage and cookies
      if (typeof window !== "undefined") {
        // Clear localStorage first
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        // Remove cookie to prevent middleware redirect loop
        removeAuthCookie();
        // Add a query parameter to prevent redirect loop
        // Then redirect to login page
        const loginUrl = new URL("/auth/login", window.location.origin);
        loginUrl.searchParams.set("expired", "true");
        window.location.href = loginUrl.toString();
      }
    }

    return Promise.reject(error);
  },
);
