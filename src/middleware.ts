
export { auth as middleware } from "next-auth/middleware";

// export const config = { matcher: ["/admin/:path*", "/guru/:path*", "/siswa/:path*", "/pimpinan/:path*"] };
// More granular matching might be needed depending on public pages within authenticated sections.

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
     * - login (login page)
     * - register (register page)
     * - forgot-password (forgot password page)
     * - reset-password (reset password page)
     * - / (root page, typically redirects or is public)
     * - verify-email (verify email page)
     * - public assets like /logo.png etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|login|register|forgot-password|reset-password|verify-email|$).*)',
    // Add specific authenticated routes if the above general pattern is too broad or misses some.
    // "/admin/:path*",
    // "/guru/:path*",
    // "/siswa/:path*",
    // "/pimpinan/:path*",
    // "/settings/:path*",
    // "/data-visualization/:path*",
  ],
};
