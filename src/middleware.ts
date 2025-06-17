
import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth-utils';
import { ROUTES } from '@/lib/constants';

const protectedPaths = [
  '/admin', 
  '/guru', 
  '/siswa', 
  '/pimpinan', 
  '/settings', 
  '/data-visualization',
  // Add other paths that require authentication
];

const authRoutes = [
  ROUTES.LOGIN, 
  ROUTES.REGISTER, 
  ROUTES.FORGOT_PASSWORD, 
  ROUTES.RESET_PASSWORD
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes, Next.js specific paths, and public static assets
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.') // typically static files
     ) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);
  const userPayload = token ? verifyToken(token) : null;

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    if (!userPayload) {
      // Redirect to login if not authenticated and trying to access protected route
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Additional role-based access control can be implemented here if needed
    // For example:
    // if (pathname.startsWith('/admin') && userPayload.role !== 'admin' && userPayload.role !== 'superadmin') {
    //   return NextResponse.redirect(new URL(ROUTES.HOME, request.url)); // Or an unauthorized page
    // }
  }

  if (authRoutes.includes(pathname) && userPayload) {
    // If user is authenticated and tries to access login/register, redirect to their dashboard
    let dashboardUrl = ROUTES.HOME;
    switch (userPayload.role) {
        case 'admin': dashboardUrl = ROUTES.ADMIN_DASHBOARD; break;
        case 'guru': dashboardUrl = ROUTES.GURU_DASHBOARD; break;
        case 'siswa': dashboardUrl = ROUTES.SISWA_DASHBOARD; break;
        case 'pimpinan': dashboardUrl = ROUTES.PIMPINAN_DASHBOARD; break;
        case 'superadmin': dashboardUrl = ROUTES.ADMIN_DASHBOARD; break;
    }
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }
  
  // Special handling for verify-email (now a placeholder, as custom auth doesn't have this flow by default)
  if (pathname === ROUTES.VERIFY_EMAIL) {
    if (userPayload && userPayload.isVerified) {
        // If verified, redirect to dashboard
        let dashboardUrl = ROUTES.HOME;
        switch (userPayload.role) {
            case 'admin': dashboardUrl = ROUTES.ADMIN_DASHBOARD; break;
            case 'guru': dashboardUrl = ROUTES.GURU_DASHBOARD; break;
            case 'siswa': dashboardUrl = ROUTES.SISWA_DASHBOARD; break;
            case 'pimpinan': dashboardUrl = ROUTES.PIMPINAN_DASHBOARD; break;
            case 'superadmin': dashboardUrl = ROUTES.ADMIN_DASHBOARD; break;
        }
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    // If not verified, or no user, let them see the placeholder page
    return NextResponse.next();
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)', // More restrictive
    '/((?!_next/static|_next/image|favicon.ico).*)', // Matches pages and API routes
  ],
};
