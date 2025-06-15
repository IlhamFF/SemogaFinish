
import "reflect-metadata"; // Ensure this is the very first import
import NextAuth from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { JWT } from 'next-auth/jwt'; 
import { ROUTES } from '@/lib/constants'; // Import from @/lib/constants


const { auth: nextAuthMiddleware } = NextAuth(authOptions);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicPaths = [
    ROUTES.LOGIN, 
    ROUTES.REGISTER, 
    ROUTES.FORGOT_PASSWORD, 
    ROUTES.RESET_PASSWORD,
    ROUTES.HOME 
  ];

  if (publicPaths.includes(pathname) || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  if (pathname === ROUTES.VERIFY_EMAIL) {
     const sessionToken = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
     if (sessionToken) { 
        return (nextAuthMiddleware as any)(request, {});
     }
     return NextResponse.next(); 
  }

  return (nextAuthMiddleware as any)(request, {});
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};
