// Proxy middleware for authentication
import { NextRequest, NextResponse } from "next/server";

/**
 * Runs before requests complete.
 * Use for rewrites, redirects, or header changes.
 * Refer to Next.js Middleware docs for more examples.
 */
export default function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value; // Fixed: changed from auth_token to admin_token
  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If user has token and tries to access login page, redirect to dashboard
  if (token && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user doesn't have token and tries to access protected routes, redirect to login
  if (!token && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

/**
 * Matcher runs for all routes except static files and APIs.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
