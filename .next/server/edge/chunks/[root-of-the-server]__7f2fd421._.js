(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__7f2fd421._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[externals]/node:util [external] (node:util, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}}),
"[project]/src/lib [middleware-edge] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
__turbopack_context__.n(__import_unsupported(`crypto`));
}}),
"[project]/src/lib/auth-utils.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "TOKEN_NAME": (()=>TOKEN_NAME),
    "clearTokenCookie": (()=>clearTokenCookie),
    "generateSecureToken": (()=>generateSecureToken),
    "generateToken": (()=>generateToken),
    "getAuthenticatedUser": (()=>getAuthenticatedUser),
    "getTokenFromRequest": (()=>getTokenFromRequest),
    "setTokenCookie": (()=>setTokenCookie),
    "verifyToken": (()=>verifyToken)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cookie$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cookie/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib [middleware-edge] (ecmascript)");
;
;
;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-please-change-this';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1d';
const TOKEN_NAME = 'auth_token';
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        kelasId: user.kelasId
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRY
    });
}
function verifyToken(token) {
    try {
        const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}
function setTokenCookie(res, token) {
    const cookieOptions = {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") !== 'development',
        maxAge: 60 * 60 * 24 * 1,
        path: '/',
        sameSite: 'lax'
    };
    res.headers.append('Set-Cookie', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cookie$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].serialize(TOKEN_NAME, token, cookieOptions));
}
function clearTokenCookie(res) {
    const cookieOptions = {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") !== 'development',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax'
    };
    res.headers.append('Set-Cookie', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cookie$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].serialize(TOKEN_NAME, '', cookieOptions));
}
function getTokenFromRequest(req) {
    const cookies = req.cookies.get(TOKEN_NAME);
    return cookies?.value || null;
}
function getAuthenticatedUser(req) {
    const token = getTokenFromRequest(req);
    if (!token) {
        return null;
    }
    return verifyToken(token);
}
function generateSecureToken(length = 32) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].randomBytes(length).toString('hex');
}
}}),
"[project]/src/lib/constants.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "APP_NAME": (()=>APP_NAME),
    "AUTH_USER_STORAGE_KEY": (()=>AUTH_USER_STORAGE_KEY),
    "DEFAULT_USERS_STORAGE_KEY": (()=>DEFAULT_USERS_STORAGE_KEY),
    "FASE_CP_CONST": (()=>FASE_CP_CONST),
    "JENIS_MATERI_AJAR": (()=>JENIS_MATERI_AJAR),
    "KATEGORI_MAPEL": (()=>KATEGORI_MAPEL),
    "KATEGORI_SKL_CONST": (()=>KATEGORI_SKL_CONST),
    "MOCK_SUBJECTS": (()=>MOCK_SUBJECTS),
    "ROLES": (()=>ROLES),
    "ROUTES": (()=>ROUTES),
    "SCHOOL_CLASSES_PER_MAJOR_GRADE": (()=>SCHOOL_CLASSES_PER_MAJOR_GRADE),
    "SCHOOL_GRADE_LEVELS": (()=>SCHOOL_GRADE_LEVELS),
    "SCHOOL_MAJORS": (()=>SCHOOL_MAJORS)
});
const APP_NAME = 'EduCentral SMA Az-Bail';
const ROLES = {
    admin: 'Admin',
    guru: 'Guru',
    siswa: 'Siswa',
    pimpinan: 'Pimpinan',
    superadmin: 'Super Admin'
};
const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_KURIKULUM: '/admin/kurikulum',
    ADMIN_MATA_PELAJARAN: '/admin/mata-pelajaran',
    ADMIN_JADWAL: '/admin/jadwal',
    GURU_DASHBOARD: '/guru/dashboard',
    GURU_PENGAJARAN: '/guru/pengajaran',
    GURU_TUGAS: '/guru/tugas',
    GURU_ABSENSI: '/guru/absensi',
    GURU_MATERI: '/guru/materi',
    GURU_TEST: '/guru/test',
    GURU_PENILAIAN: '/guru/penilaian',
    SISWA_DASHBOARD: '/siswa/dashboard',
    SISWA_JADWAL: '/siswa/jadwal',
    SISWA_TUGAS: '/siswa/tugas',
    SISWA_MATERI: '/siswa/materi',
    SISWA_TEST: '/siswa/test',
    SISWA_NILAI: '/siswa/nilai',
    PIMPINAN_DASHBOARD: '/pimpinan/dashboard',
    DATA_VISUALIZATION: '/data-visualization',
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings'
};
const DEFAULT_USERS_STORAGE_KEY = 'sma_azbail_users_mock';
const AUTH_USER_STORAGE_KEY = 'sma_azbail_auth_user_mock';
const SCHOOL_MAJORS = [
    "IPA",
    "IPS"
];
const SCHOOL_GRADE_LEVELS = [
    "X",
    "XI",
    "XII"
];
const SCHOOL_CLASSES_PER_MAJOR_GRADE = 5;
const MOCK_SUBJECTS = [
    "Matematika Wajib",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Pendidikan Agama",
    "PPKn",
    "Sejarah Indonesia",
    "Fisika",
    "Kimia",
    "Biologi",
    "Matematika Peminatan",
    "Geografi",
    "Sosiologi",
    "Ekonomi",
    "Sejarah Peminatan" // IPS
];
const KATEGORI_MAPEL = [
    "Wajib Umum",
    "Wajib Peminatan IPA",
    "Wajib Peminatan IPS",
    "Pilihan Lintas Minat",
    "Muatan Lokal"
];
const KATEGORI_SKL_CONST = [
    "Sikap",
    "Pengetahuan",
    "Keterampilan"
];
const FASE_CP_CONST = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "Lainnya"
];
const JENIS_MATERI_AJAR = [
    "File",
    "Link"
];
}}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "middleware": (()=>middleware)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$utils$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth-utils.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [middleware-edge] (ecmascript)");
;
;
;
const protectedPaths = [
    '/admin',
    '/guru',
    '/siswa',
    '/pimpinan',
    '/settings',
    '/data-visualization'
];
const authRoutes = [
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].LOGIN,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].REGISTER,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].FORGOT_PASSWORD,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].RESET_PASSWORD
];
async function middleware(request) {
    const { pathname } = request.nextUrl;
    // Allow API routes, Next.js specific paths, and public static assets
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.') // typically static files
    ) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$utils$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getTokenFromRequest"])(request);
    const userPayload = token ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$utils$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["verifyToken"])(token) : null;
    const isProtectedPath = protectedPaths.some((path)=>pathname.startsWith(path));
    if (isProtectedPath) {
        if (!userPayload) {
            // Redirect to login if not authenticated and trying to access protected route
            const loginUrl = new URL(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].LOGIN, request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
        }
    // Additional role-based access control can be implemented here if needed
    // For example:
    // if (pathname.startsWith('/admin') && userPayload.role !== 'admin' && userPayload.role !== 'superadmin') {
    //   return NextResponse.redirect(new URL(ROUTES.HOME, request.url)); // Or an unauthorized page
    // }
    }
    if (authRoutes.includes(pathname) && userPayload) {
        // If user is authenticated and tries to access login/register, redirect to their dashboard
        let dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].HOME;
        switch(userPayload.role){
            case 'admin':
                dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].ADMIN_DASHBOARD;
                break;
            case 'guru':
                dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].GURU_DASHBOARD;
                break;
            case 'siswa':
                dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].SISWA_DASHBOARD;
                break;
            case 'pimpinan':
                dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].PIMPINAN_DASHBOARD;
                break;
            case 'superadmin':
                dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].ADMIN_DASHBOARD;
                break;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(dashboardUrl, request.url));
    }
    // Special handling for verify-email (now a placeholder, as custom auth doesn't have this flow by default)
    if (pathname === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].VERIFY_EMAIL) {
        if (userPayload && userPayload.isVerified) {
            // If verified, redirect to dashboard
            let dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].HOME;
            switch(userPayload.role){
                case 'admin':
                    dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].ADMIN_DASHBOARD;
                    break;
                case 'guru':
                    dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].GURU_DASHBOARD;
                    break;
                case 'siswa':
                    dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].SISWA_DASHBOARD;
                    break;
                case 'pimpinan':
                    dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].PIMPINAN_DASHBOARD;
                    break;
                case 'superadmin':
                    dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].ADMIN_DASHBOARD;
                    break;
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(dashboardUrl, request.url));
        }
        // If not verified, or no user, let them see the placeholder page
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        // Match all request paths except for the ones starting with:
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico (favicon file)
        // '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)', // More restrictive
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__7f2fd421._.js.map