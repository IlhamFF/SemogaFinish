
import "reflect-metadata"; // Ensure this is the very first import
import NextAuth from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { JWT } from 'next-auth/jwt'; // Ensure JWT type is imported if used for typing
import { ROUTES } from './lib/constants';


const { auth: nextAuthMiddleware } = NextAuth(authOptions);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicPaths = [
    ROUTES.LOGIN, 
    ROUTES.REGISTER, 
    ROUTES.FORGOT_PASSWORD, 
    ROUTES.RESET_PASSWORD,
    ROUTES.HOME // Usually redirects, but good to have if it becomes a landing page
  ];

  if (publicPaths.includes(pathname) || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // For /verify-email, allow access if user is logged in but not verified.
  // If user is verified, redirect them away from verify-email.
  // If user is not logged in, nextAuthMiddleware will redirect to LOGIN.
  if (pathname === ROUTES.VERIFY_EMAIL) {
     const sessionToken = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
     if (sessionToken) { // User is likely logged in, let NextAuth handle full session check
        return (nextAuthMiddleware as any)(request, {});
     }
     return NextResponse.next(); // Allow access if no session token yet, page itself will redirect if no user
  }


  // For all other routes, apply NextAuth middleware for authentication
  return (nextAuthMiddleware as any)(request, {});
}


// Apply middleware to relevant routes.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (allow specific auth API routes, block others if needed via route protection)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (public assets example)
     * Public pages like login, register are handled inside the middleware logic.
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};

    