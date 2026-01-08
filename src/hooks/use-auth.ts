"use client";

import { useRouter } from "next/navigation";

import { useAdminStore } from "@/stores/admin/admin-provider";
import { useAuthStore } from "@/stores/auth/auth-provider";

/**
 * Custom hook to handle user authentication and logout
 * Provides easy access to auth state and logout functionality
 */
export function useAuth() {
  const router = useRouter();
  const { token, isAuthenticated, logout: authLogout } = useAuthStore((state) => state);
  const { user, clearUser } = useAdminStore((state) => state);

  const logout = () => {
    authLogout();
    clearUser();
    router.push("/auth/login");
  };

  return {
    token,
    isAuthenticated,
    user,
    logout,
  };
}
