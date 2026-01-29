import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { removeAllAuthCookies } from "@/lib/auth/cookies";
import { refreshAccessToken, shouldRefreshToken } from "@/lib/auth/refresh-token";
import { isTokenExpired } from "@/lib/auth/token-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9001/api/v1";

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<{ token: string; refreshToken: string } | null> | null = null;

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token and handle token refresh
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    let token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    if (token) {
      // Check if token is expired
      if (isTokenExpired(token, 30)) {
        // Token is expired, try to refresh
        console.log("[ApiClient] Token expired, attempting refresh...");

        // Prevent multiple simultaneous refresh attempts
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
        }

        try {
          const result = await refreshPromise;
          if (result) {
            token = result.token;
          } else {
            // Refresh failed, redirect to login
            if (typeof window !== "undefined") {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_refresh_token");
              localStorage.removeItem("admin_user");
              removeAllAuthCookies();
              const loginUrl = new URL("/auth/login", window.location.origin);
              loginUrl.searchParams.set("expired", "true");
              window.location.href = loginUrl.toString();
            }
            return Promise.reject(new Error("Token refresh failed"));
          }
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      } else if (shouldRefreshToken(token)) {
        // Token is about to expire, refresh in background (don't block the request)
        console.log("[ApiClient] Token expiring soon, refreshing in background...");
        if (!isRefreshing) {
          isRefreshing = true;
          refreshAccessToken().finally(() => {
            isRefreshing = false;
          });
        }
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh the token
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
      }

      try {
        const result = await refreshPromise;
        if (result) {
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${result.token}`;
          return apiClient(originalRequest);
        }
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }

      // Token refresh failed - clear auth data and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
        localStorage.removeItem("admin_user");
        removeAllAuthCookies();
        const loginUrl = new URL("/auth/login", window.location.origin);
        loginUrl.searchParams.set("expired", "true");
        window.location.href = loginUrl.toString();
      }
    }

    return Promise.reject(error);
  }
);
