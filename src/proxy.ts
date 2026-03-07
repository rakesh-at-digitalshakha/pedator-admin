// Proxy middleware for authentication (Next.js 16+ uses this file as middleware)
import { NextRequest, NextResponse } from "next/server";

/** Decode JWT exp without crypto — safe in Edge runtime */
function getJwtExpiry(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"),
    );
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const exp = getJwtExpiry(token);
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  const refreshToken = req.cookies.get("admin_refresh_token")?.value;
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

  const hasValidToken = !!token && !isExpired(token);
  // Allow through when refresh token exists — client will silently refresh
  const hasRefreshToken = !!refreshToken;

  // Authenticated user trying to reach login → send to dashboard
  if ((hasValidToken || hasRefreshToken) && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard/default", req.url));
  }

  // Unauthenticated user on a protected route → send to login
  if (!isPublicRoute && pathname !== "/") {
    if (!hasValidToken && !hasRefreshToken) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("expired", "true");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

