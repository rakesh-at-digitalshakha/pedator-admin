"use client";

import { createContext, useContext, useRef } from "react";

import { useStore, type StoreApi } from "zustand";

import { createAuthStore, type AuthState } from "./auth-store";

const AuthStoreContext = createContext<StoreApi<AuthState> | null>(null);

export const AuthStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<StoreApi<AuthState> | null>(null);

  // Initialize with token from localStorage if available
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  storeRef.current ??= createAuthStore({
    token,
    isAuthenticated: !!token,
  });

  return <AuthStoreContext.Provider value={storeRef.current}>{children}</AuthStoreContext.Provider>;
};

export const useAuthStore = <T,>(selector: (state: AuthState) => T): T => {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error("Missing AuthStoreProvider");
  return useStore(store, selector);
};
