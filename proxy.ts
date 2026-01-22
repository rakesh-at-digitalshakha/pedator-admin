// Authentication middleware
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy function runs before requests complete.
 * Handles authentication checks and redirects.
 */
export function proxy(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value; // Fixed: changed from auth_token to admin_token
  const pathname = req.nextUrl.pathname;
  const expired = req.nextUrl.searchParams.get("expired");

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If coming from expired token redirect, clear cookie and allow access to login
  if (expired === "true" && pathname === "/auth/login") {
    const response = NextResponse.next();
    response.cookies.delete("admin_token");
    return response;
  }

  // If user has token and tries to access login page (and not from expired redirect), redirect to dashboard
  if (token && pathname === "/auth/login" && expired !== "true") {
    return NextResponse.redirect(new URL("/dashboard/default", req.url));
  }

  // If user doesn't have token and tries to access protected routes, redirect to login
  if (!token && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

/**
 * Matcher configuration for middleware
 * Runs for all routes except static files and APIs
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
