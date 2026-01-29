"use client";

import { useEffect, useCallback, useRef } from "react";

import { useRouter, usePathname } from "next/navigation";

import { toast } from "sonner";

import { removeAllAuthCookies } from "@/lib/auth/cookies";
import { refreshAccessToken } from "@/lib/auth/refresh-token";
import { isTokenExpired, getTokenRemainingTime } from "@/lib/auth/token-utils";
import { useAdminStore } from "@/stores/admin/admin-provider";
import { useAuthStore } from "@/stores/auth/auth-provider";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Check interval for token expiration (every 30 seconds)
const CHECK_INTERVAL = 30 * 1000;
// Buffer time before expiration to refresh token (2 minutes)
const REFRESH_BUFFER = 120;
// Buffer time before expiration to logout if refresh fails (30 seconds)
const LOGOUT_BUFFER = 30;

/**
 * AuthGuard component that monitors token expiration and handles auto-refresh/logout
 * Wrap your protected routes/layouts with this component
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, setTokens, logout: authLogout } = useAuthStore((state) => state);
  const { clearUser } = useAdminStore((state) => state);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggingOut = useRef(false);
  const isRefreshing = useRef(false);

  // Public routes that don't need auth check
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const handleLogout = useCallback(() => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    // Clear all auth data
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
    }
    removeAllAuthCookies();
    authLogout();
    clearUser();

    toast.error("Session Expired", {
      description: "Your session has expired. Please log in again.",
    });

    // Redirect to login
    router.push("/auth/login?expired=true");
  }, [authLogout, clearUser, router]);

  const handleRefreshToken = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    try {
      console.log("[AuthGuard] Attempting token refresh...");
      const result = await refreshAccessToken();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (result && result.token && result.refreshToken) {
        setTokens(result.token, result.refreshToken);
        console.log("[AuthGuard] Token refreshed successfully");
      } else {
        console.log("[AuthGuard] Token refresh failed, logging out...");
        handleLogout();
      }
    } catch (error) {
      console.error("[AuthGuard] Token refresh error:", error);
      handleLogout();
    } finally {
      isRefreshing.current = false;
    }
  }, [setTokens, handleLogout]);

  const checkTokenExpiration = useCallback(() => {
    // Skip check on public routes or home
    if (isPublicRoute || pathname === "/") return;

    const storedToken = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    const currentToken = storedToken || token;

    // No token found, redirect to login
    if (!currentToken) {
      handleLogout();
      return;
    }

    const needsRefresh = isTokenExpired(currentToken, REFRESH_BUFFER);
    const isExpired = isTokenExpired(currentToken, LOGOUT_BUFFER);

    // Handle token states
    if (isExpired) {
      // Token expired - try emergency refresh or logout
      const hasRefreshToken = !!localStorage.getItem("admin_refresh_token");
      hasRefreshToken ? handleRefreshToken() : handleLogout(); // eslint-disable-line @typescript-eslint/no-unused-expressions
    } else if (needsRefresh) {
      // Token about to expire - refresh in background
      handleRefreshToken();
    }
  }, [token, isPublicRoute, pathname, handleLogout, handleRefreshToken]);

  useEffect(() => {
    // Initial check on mount
    checkTokenExpiration();

    // Set up periodic check
    checkIntervalRef.current = setInterval(checkTokenExpiration, CHECK_INTERVAL);

    // Also check on window focus (user returns to tab)
    const handleFocus = () => {
      checkTokenExpiration();
    };

    // Check on visibility change (tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTokenExpiration();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkTokenExpiration]);

  // Log remaining time for debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && token) {
      const remaining = getTokenRemainingTime(token);
      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        console.log(`[AuthGuard] Token expires in: ${minutes}m ${seconds}s`);
      }
    }
  }, [token]);

  return <>{children}</>;
}
