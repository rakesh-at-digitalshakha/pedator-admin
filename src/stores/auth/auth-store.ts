import { createStore } from "zustand/vanilla";

import { removeAuthCookie, setAuthCookie } from "@/lib/auth/cookies";

export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
};

export const createAuthStore = (init?: Partial<AuthState>) =>
  createStore<AuthState>()((set) => ({
    token: init?.token ?? null,
    isAuthenticated: init?.isAuthenticated ?? false,
    setToken: (token) => {
      if (token) {
        localStorage.setItem("admin_token", token);
        setAuthCookie(token);
        set({ token, isAuthenticated: true });
      } else {
        localStorage.removeItem("admin_token");
        removeAuthCookie();
        set({ token: null, isAuthenticated: false });
      }
    },
    logout: () => {
      localStorage.removeItem("admin_token");
      removeAuthCookie();
      set({ token: null, isAuthenticated: false });
    },
  }));
