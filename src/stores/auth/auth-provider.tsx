"use client";

import { createContext, useContext, useRef } from "react";

import { useStore, type StoreApi } from "zustand";

import { isTokenExpired } from "@/lib/auth/token-utils";
import { removeAllAuthCookies } from "@/lib/auth/cookies";

import { createAuthStore, type AuthState } from "./auth-store";

const AuthStoreContext = createContext<StoreApi<AuthState> | null>(null);

export const AuthStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<StoreApi<AuthState> | null>(null);

  // Initialize with token from localStorage if available and valid
  let token: string | null = null;
  let refreshToken: string | null = null;
  let isAuthenticated = false;

  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("admin_token");
    const storedRefreshToken = localStorage.getItem("admin_refresh_token");

    // Check if stored token is valid and not expired
    if (storedToken && !isTokenExpired(storedToken, 60)) {
      token = storedToken;
      refreshToken = storedRefreshToken;
      isAuthenticated = true;
    } else if (storedToken) {
      // Token exists but is expired - clean up
      console.log("[AuthProvider] Token expired on init, clearing auth data");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
      removeAllAuthCookies();
    }
  }

  storeRef.current ??= createAuthStore({
    token,
    refreshToken,
    isAuthenticated,
  });

  return <AuthStoreContext.Provider value={storeRef.current}>{children}</AuthStoreContext.Provider>;
};

export const useAuthStore = <T,>(selector: (state: AuthState) => T): T => {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error("Missing AuthStoreProvider");
  return useStore(store, selector);
};
