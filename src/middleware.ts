
import NextAuth from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// export default NextAuth(authOptions).auth;
// The above line can cause issues if authOptions has providers like Credentials that are not edge-compatible.
// For a simpler middleware just handling session protection, we can use a more direct approach
// or ensure authOptions are edge-compatible.

// A more direct way to get the middleware if only session checking is needed,
// or ensure your authOptions are fully edge-compatible if using the above.
// For now, to ensure it works without deep diving into edge compatibility of TypeORM adapter:
// We will use the recommended way to export the auth property from NextAuth instance.
// If this still causes edge runtime issues, `authOptions` might need an edge-compatible version.

const { auth } = NextAuth(authOptions);
export default auth;


// Apply middleware to all routes except /api, /_next/static, /_next/image, /favicon.ico, /login, /register
// and any other public static assets or pages.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (public assets example)
     * - login (login page)
     * - register (register page)
     * - forgot-password (forgot password page)
     * - reset-password (reset password page)
     * - verify-email (verify email page)
     * - / (root page, which redirects or is public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|login|register|forgot-password|reset-password|verify-email|^/$).*)',
  ],
};
