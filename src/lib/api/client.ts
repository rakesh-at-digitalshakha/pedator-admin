import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { removeAllAuthCookies } from "@/lib/auth/cookies";
import { refreshAccessToken, shouldRefreshToken } from "@/lib/auth/refresh-token";
import { isTokenExpired } from "@/lib/auth/token-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9001/api/v1";

// Single shared refresh promise — prevents duplicate refresh calls
let ongoingRefresh: Promise<{ token: string; refreshToken: string } | null> | null = null;

function getOngoingRefresh() {
  if (!ongoingRefresh) {
    ongoingRefresh = refreshAccessToken().finally(() => {
      ongoingRefresh = null;
    });
  }
  return ongoingRefresh;
}

function clearAuthAndRedirect() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_refresh_token");
  localStorage.removeItem("admin_user");
  removeAllAuthCookies();
  const loginUrl = new URL("/auth/login", window.location.origin);
  loginUrl.searchParams.set("expired", "true");
  window.location.href = loginUrl.toString();
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
  timeout: 30000,
});

// ── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    if (token) {
      if (isTokenExpired(token, 30)) {
        // Token is expired (or within 30-second safety buffer) — refresh before sending
        console.log("[ApiClient] Token expired, refreshing before request...");
        const result = await getOngoingRefresh();
        if (result) {
          token = result.token;
        } else {
          clearAuthAndRedirect();
          return Promise.reject(new Error("Token refresh failed"));
        }
      } else if (shouldRefreshToken(token)) {
        // Token expires within 5 minutes — refresh in background, don't block
        console.log("[ApiClient] Token expiring soon, refreshing in background...");
        getOngoingRefresh();
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // On 401, attempt one token refresh then retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const result = await getOngoingRefresh();
      if (result) {
        originalRequest.headers.Authorization = `Bearer ${result.token}`;
        return apiClient(originalRequest);
      }

      // Refresh failed — log out and redirect
      clearAuthAndRedirect();
    }

    return Promise.reject(error);
  },
);

