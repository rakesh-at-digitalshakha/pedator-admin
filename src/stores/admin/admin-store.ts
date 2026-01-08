import { createStore } from "zustand/vanilla";

import type { AdminUser as ApiAdminUser } from "@/types/api";

export type AdminUser = ApiAdminUser;

export type AdminState = {
  user: AdminUser | null;
  setUser: (user: AdminUser | null) => void;
  clearUser: () => void;
  updateWallet: (wallet: number) => void;
};

export const createAdminStore = (init?: Partial<AdminState>) =>
  createStore<AdminState>()((set) => ({
    user: init?.user ?? null,
    setUser: (user) => {
      if (user) {
        localStorage.setItem("admin_user", JSON.stringify(user));
        set({ user });
      } else {
        localStorage.removeItem("admin_user");
        set({ user: null });
      }
    },
    clearUser: () => {
      localStorage.removeItem("admin_user");
      set({ user: null });
    },
    updateWallet: (wallet) =>
      set((state) => {
        if (state.user) {
          const updatedUser = { ...state.user, wallet };
          localStorage.setItem("admin_user", JSON.stringify(updatedUser));
          return { user: updatedUser };
        }
        return state;
      }),
  }));
