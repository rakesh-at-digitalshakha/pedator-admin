import { createStore } from "zustand/vanilla";

import {
  removeAuthCookie,
  removeRefreshTokenCookie,
  removeAllAuthCookies,
  setAuthCookie,
  setRefreshTokenCookie,
} from "@/lib/auth/cookies";
import { isTokenExpired } from "@/lib/auth/token-utils";

export type AuthState = {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setTokens: (token: string | null, refreshToken: string | null) => void;
  logout: () => void;
  checkTokenValidity: () => boolean;
};

export const createAuthStore = (init?: Partial<AuthState>) =>
  createStore<AuthState>()((set, get) => ({
    token: init?.token ?? null,
    refreshToken: init?.refreshToken ?? null,
    isAuthenticated: init?.isAuthenticated ?? false,
    setToken: (token) => {
      if (token) {
        // Check if the token is already expired before storing
        if (isTokenExpired(token, 0)) {
          console.warn("[AuthStore] Attempted to set an expired token");
          localStorage.removeItem("admin_token");
          removeAuthCookie();
          set({ token: null, isAuthenticated: false });
          return;
        }
        localStorage.setItem("admin_token", token);
        setAuthCookie(token);
        set({ token, isAuthenticated: true });
      } else {
        localStorage.removeItem("admin_token");
        removeAuthCookie();
        set({ token: null, isAuthenticated: false });
      }
    },
    setRefreshToken: (refreshToken) => {
      if (refreshToken) {
        localStorage.setItem("admin_refresh_token", refreshToken);
        setRefreshTokenCookie(refreshToken);
        set({ refreshToken });
      } else {
        localStorage.removeItem("admin_refresh_token");
        removeRefreshTokenCookie();
        set({ refreshToken: null });
      }
    },
    setTokens: (token, refreshToken) => {
      if (token && refreshToken) {
        // Check if the token is already expired before storing
        if (isTokenExpired(token, 0)) {
          console.warn("[AuthStore] Attempted to set an expired token");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refresh_token");
          removeAllAuthCookies();
          set({ token: null, refreshToken: null, isAuthenticated: false });
          return;
        }
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_refresh_token", refreshToken);
        setAuthCookie(token);
        setRefreshTokenCookie(refreshToken);
        set({ token, refreshToken, isAuthenticated: true });
      } else {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
        removeAllAuthCookies();
        set({ token: null, refreshToken: null, isAuthenticated: false });
      }
    },
    logout: () => {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
      removeAllAuthCookies();
      set({ token: null, refreshToken: null, isAuthenticated: false });
    },
    checkTokenValidity: () => {
      const state = get();
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      const currentToken = storedToken || state.token;

      if (!currentToken || isTokenExpired(currentToken, 60)) {
        // Token is invalid or expired, clear auth state
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
        localStorage.removeItem("admin_user");
        removeAllAuthCookies();
        set({ token: null, refreshToken: null, isAuthenticated: false });
        return false;
      }
      return true;
    },
  }));
