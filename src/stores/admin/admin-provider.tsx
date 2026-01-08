"use client";

import { createContext, useContext, useRef } from "react";

import { useStore, type StoreApi } from "zustand";

import { createAdminStore, type AdminState } from "./admin-store";

const AdminStoreContext = createContext<StoreApi<AdminState> | null>(null);

export const AdminStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<StoreApi<AdminState> | null>(null);

  // Initialize with user from localStorage if available
  let user = null;
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("admin_user");
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("admin_user");
      }
    }
  }

  storeRef.current ??= createAdminStore({ user });

  return <AdminStoreContext.Provider value={storeRef.current}>{children}</AdminStoreContext.Provider>;
};

export const useAdminStore = <T,>(selector: (state: AdminState) => T): T => {
  const store = useContext(AdminStoreContext);
  if (!store) throw new Error("Missing AdminStoreProvider");
  return useStore(store, selector);
};
