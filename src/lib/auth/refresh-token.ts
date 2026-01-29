import axios from "axios";

import { removeAllAuthCookies, setAuthCookie, setRefreshTokenCookie } from "@/lib/auth/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9001/api/v1";

interface RefreshTokenResponse {
  status: string;
  message: string;
  token: string;
  refreshToken: string;
}

/**
 * Refresh the access token using the refresh token
 * This is a separate axios instance to avoid circular dependencies with the main apiClient
 */
export async function refreshAccessToken(): Promise<{ token: string; refreshToken: string } | null> {
  try {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("admin_refresh_token") : null;

    if (!refreshToken) {
      console.log("[RefreshToken] No refresh token available");
      return null;
    }

    const response = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}/admin/refresh-token`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.status === "success" && response.data.token && response.data.refreshToken) {
      // Store new tokens
      localStorage.setItem("admin_token", response.data.token);
      localStorage.setItem("admin_refresh_token", response.data.refreshToken);
      setAuthCookie(response.data.token);
      setRefreshTokenCookie(response.data.refreshToken);

      console.log("[RefreshToken] Token refreshed successfully");
      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      };
    }

    return null;
  } catch (error) {
    console.error("[RefreshToken] Failed to refresh token:", error);
    // Clear all auth data on refresh failure
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
      removeAllAuthCookies();
    }
    return null;
  }
}

/**
 * Check if we should attempt to refresh the token
 */
export function shouldRefreshToken(token: string | null): boolean {
  if (!token) return false;

  try {
    // Decode JWT payload
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp) return false;

    // Check if token expires within 5 minutes
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return currentTime >= expirationTime - fiveMinutes;
  } catch {
    return false;
  }
}
