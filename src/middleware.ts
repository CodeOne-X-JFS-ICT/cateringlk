import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user is trying to access the dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    
    // Check for the admin token in cookies
    const token = request.cookies.get('admin_token');

    // If there is no token, redirect to login page with preserved redirect query
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      const redirectTarget = request.nextUrl.pathname + request.nextUrl.search;
      loginUrl.searchParams.set('redirect', redirectTarget);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If they have a token (or aren't accessing /dashboard), let them proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*'],
};
