/**
 * JWT Token utility functions
 */

interface JWTPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decode JWT token payload (without verification)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @param bufferSeconds - Buffer time in seconds before actual expiration (default: 60 seconds)
 * @returns true if token is expired or invalid
 */
export function isTokenExpired(token: string | null, bufferSeconds: number = 60): boolean {
  if (!token) return true;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const bufferMs = bufferSeconds * 1000;

  return currentTime >= expirationTime - bufferMs;
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string | null): Date | null {
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;

  return new Date(payload.exp * 1000);
}

/**
 * Get remaining time until token expires in milliseconds
 */
export function getTokenRemainingTime(token: string | null): number {
  if (!token) return 0;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return 0;

  const expirationTime = payload.exp * 1000;
  const remaining = expirationTime - Date.now();

  return remaining > 0 ? remaining : 0;
}
