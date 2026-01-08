/**
 * Auth debugging utilities
 * Use these functions in browser console or components to debug auth issues
 */

export const authDebug = {
  // Check if token exists
  hasToken: () => {
    const token = localStorage.getItem("auth_token");
    console.log("Token exists:", !!token);
    console.log("Token value:", token ? `${token.substring(0, 20)}...` : "null");
    return !!token;
  },

  // Check if user data exists
  hasUser: () => {
    const user = localStorage.getItem("admin_user");
    console.log("User exists:", !!user);
    if (user) {
      console.log("User data:", JSON.parse(user));
    }
    return !!user;
  },

  // Check cookies
  checkCookies: () => {
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((row) => row.startsWith("auth_token="));
    console.log("Auth cookie:", authCookie ? "exists" : "missing");
    return !!authCookie;
  },

  // Clear all auth data (for testing)
  clearAll: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_user");
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("All auth data cleared");
  },

  // Test API connection
  testApi: async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9001/api/v1");
      console.log("API reachable:", response.ok);
      return response.ok;
    } catch (error) {
      console.error("API not reachable:", error);
      return false;
    }
  },

  // Full diagnostic
  runDiagnostics: () => {
    console.log("=== Auth Diagnostics ===");
    authDebug.hasToken();
    authDebug.hasUser();
    authDebug.checkCookies();
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("======================");
  },
};

// Export for global use
if (typeof window !== "undefined") {
  (window as Window & typeof globalThis & { authDebug: typeof authDebug }).authDebug = authDebug;
}
