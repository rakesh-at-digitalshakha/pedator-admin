"use client";

import { createContext, useContext, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";
import { useStore, type StoreApi } from "zustand";

import { isTokenExpired } from "@/lib/auth/token-utils";
import { removeAllAuthCookies } from "@/lib/auth/cookies";
import { refreshAccessToken } from "@/lib/auth/refresh-token";

import { createAuthStore, type AuthState } from "./auth-store";

const AuthStoreContext = createContext<StoreApi<AuthState> | null>(null);

export const AuthStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const storeRef = useRef<StoreApi<AuthState> | null>(null);

  // Initialize synchronously from localStorage
  let token: string | null = null;
  let refreshToken: string | null = null;
  let isAuthenticated = false;

  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("admin_token");
    const storedRefreshToken = localStorage.getItem("admin_refresh_token");

    if (storedToken && !isTokenExpired(storedToken, 0)) {
      // Token is fully valid (not yet expired at all)
      token = storedToken;
      refreshToken = storedRefreshToken;
      isAuthenticated = true;
    } else if (storedToken && storedRefreshToken) {
      // Token expired but refresh token exists — keep tokens, attempt refresh async below
      token = storedToken;
      refreshToken = storedRefreshToken;
      isAuthenticated = false; // will flip to true after successful refresh
    } else {
      // No tokens at all — clear any stale cookies
      if (storedToken || storedRefreshToken) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
        localStorage.removeItem("admin_user");
        removeAllAuthCookies();
      }
    }
  }

  storeRef.current ??= createAuthStore({
    token,
    refreshToken,
    isAuthenticated,
  });

  // If access token is expired but refresh token exists, silently refresh on mount
  useEffect(() => {
    const store = storeRef.current!;
    const state = store.getState();

    if (state.refreshToken && !state.isAuthenticated) {
      console.log("[AuthProvider] Attempting silent token refresh on mount...");
      refreshAccessToken().then((result) => {
        if (result) {
          store.getState().setTokens(result.token, result.refreshToken);
          console.log("[AuthProvider] Silent refresh succeeded");
        } else {
          console.log("[AuthProvider] Silent refresh failed — redirecting to login");
          store.getState().logout();
          router.replace("/auth/login?expired=true");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthStoreContext.Provider value={storeRef.current}>{children}</AuthStoreContext.Provider>;
};

export const useAuthStore = <T,>(selector: (state: AuthState) => T): T => {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error("Missing AuthStoreProvider");
  return useStore(store, selector);
};

