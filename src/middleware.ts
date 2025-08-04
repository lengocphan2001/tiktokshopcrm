import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin-only routes
  const adminOnlyRoutes = [
    '/dashboard/users',
    '/dashboard/task-types',
  ];

  // Check if the current path is admin-only
  const isAdminOnlyRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));

  if (isAdminOnlyRoute) {
    // For now, we'll let the client-side handle the redirect
    // In a real app, you'd verify the JWT token here
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}; 