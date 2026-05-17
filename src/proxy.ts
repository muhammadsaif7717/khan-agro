import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthToken = request.cookies.has("auth_token");

  // ── 1. API Route Protection ──
  if (pathname.startsWith("/api")) {
    // List of public API endpoints that do not require authentication
    const isPublicApi = 
      pathname.startsWith("/api/login") || 
      pathname.startsWith("/api/logout") || 
      pathname.startsWith("/api/verify");

    if (!isPublicApi && !hasAuthToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Invalid or missing session token." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // ── 2. Page Protection ──
  const isLoginPage = pathname.startsWith("/login");

  if (!hasAuthToken && !isLoginPage) {
    // Redirect unauthenticated users trying to access dashboard pages to /login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasAuthToken && isLoginPage) {
    // Redirect authenticated users trying to access /login to the dashboard home
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (manifest file)
     * - favicon.svg (brand icon)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|favicon.svg).*)",
  ],
};