
import { default as middleware } from "@auth/nextjs/middleware";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // kita mungkin butuh ini untuk config matcher lanjutan

// Kita bisa export middleware langsung jika tidak ada kustomisasi config di sini
// export { default as middleware } from "@auth/nextjs/middleware";

// Atau, jika kita butuh authOptions untuk config matcher lanjutan:
// export const middleware = NextAuth(authOptions).auth;


// Untuk sekarang, kita gunakan cara paling simpel:
export default middleware;

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
     * - logo.png (public assets example)
     * - login (login page)
     * - register (register page)
     * - forgot-password (forgot password page)
     * - reset-password (reset password page)
     * - verify-email (verify email page)
     * - / (root page, which redirects or is public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|login|register|forgot-password|reset-password|verify-email|^/$).*)',
    // Add specific authenticated routes if the above general pattern is too broad or misses some.
    // For example, if you have /public/some-page that should also be excluded:
    // '/((?!api|_next/static|_next/image|favicon.ico|logo.png|public/.*|login|register|forgot-password|reset-password|verify-email|^/$).*)',

    // Or, more explicitly:
    // "/admin/:path*",
    // "/guru/:path*",
    // "/siswa/:path*",
    // "/pimpinan/:path*",
    // "/settings/:path*",
    // "/data-visualization/:path*",
  ],
};
