import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  
  const hasAuthToken = request.cookies.has('auth_token');

  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  if (!hasAuthToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (hasAuthToken && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};