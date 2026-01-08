// Cookie utility functions for auth token
export const setAuthCookie = (token: string) => {
  if (typeof document !== "undefined") {
    // Set cookie for 30 days
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `admin_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }
};

export const removeAuthCookie = () => {
  if (typeof document !== "undefined") {
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

export const getAuthCookie = (): string | null => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((row) => row.startsWith("admin_token="));
    return authCookie ? authCookie.split("=")[1] : null;
  }
  return null;
};
