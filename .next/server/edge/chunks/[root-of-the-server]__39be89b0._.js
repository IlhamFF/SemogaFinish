(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__39be89b0._.js", {

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
"[externals]/node:events [external] (node:events, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}}),
"[externals]/node:util [external] (node:util, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}}),
"[project]/src/auth.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "auth": (()=>auth),
    "handlers": (()=>handlers),
    "signIn": (()=>signIn),
    "signOut": (()=>signOut)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pg$2f$esm$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pg/esm/index.mjs [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$pg$2d$adapter$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth/pg-adapter/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth/core/providers/credentials.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [middleware-edge] (ecmascript)"); // Will need to install bcryptjs: npm install bcryptjs @types/bcryptjs
;
;
;
;
;
const pool = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pg$2f$esm$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Pool"]({
    connectionString: process.env.POSTGRES_URL
});
const { handlers, auth, signIn, signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
    adapter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$pg$2d$adapter$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])(pool),
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const email = credentials.email;
                const password = credentials.password;
                try {
                    // 1. Find user by email in the 'users' table (managed by Auth.js adapter)
                    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [
                        email
                    ]);
                    if (userResult.rows.length === 0) {
                        console.log("No user found with this email.");
                        return null; // User not found
                    }
                    const user = userResult.rows[0];
                    // 2. Check if a password is stored (users table might not store password directly if using OAuth)
                    // For credentials, we expect a password. In our custom registration, we'll store a hashed password.
                    // The 'accounts' table might store provider-specific info, not hashed passwords for Credentials.
                    // We need to ensure our registration logic stores hashed passwords in a way we can access here.
                    // Let's assume we add a 'hashedPassword' column to our 'users' table, or a linked 'credentials' table.
                    // For simplicity in this step, let's assume 'user.hashedPassword' exists, which we'll handle in registration.
                    // TEMP: For now, if 'user.hashedPassword' doesn't exist, we try to fetch it from accounts if structure allows
                    // This part is tricky with pg-adapter's default schema.
                    // A common approach is to have a custom `hashed_password` field on the `users` table,
                    // or handle password verification within a custom API endpoint if not extending the adapter's user model directly.
                    // For this iteration, let's assume a `hashedPassword` column on the `users` table.
                    // You'll need to add this column manually or ensure your registration creates it.
                    // Example: ALTER TABLE users ADD COLUMN "hashedPassword" TEXT;
                    if (!user.hashedPassword) {
                        console.log("User does not have a stored password for Credentials login.");
                        return null;
                    }
                    const passwordMatch = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].compare(password, user.hashedPassword);
                    if (!passwordMatch) {
                        console.log("Password does not match.");
                        return null; // Password incorrect
                    }
                    // 3. Fetch role from 'profiles' table
                    const profileResult = await pool.query('SELECT role FROM profiles WHERE "userId" = $1', [
                        user.id
                    ]);
                    const role = profileResult.rows.length > 0 ? profileResult.rows[0].role : 'siswa'; // Default role
                    console.log("User authorized:", user.id, role);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: role,
                        emailVerified: user.emailVerified
                    };
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt ({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.emailVerified = user.emailVerified instanceof Date ? user.emailVerified : null;
            }
            // If session is updated (e.g. user role changed by admin and session re-fetched)
            if (trigger === "update" && session?.user?.role) {
                token.role = session.user.role;
            }
            return token;
        },
        async session ({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            // session.user.emailVerified = token.emailVerified; // If you need this on client session
            }
            return session;
        }
    },
    pages: {
        signIn: '/login'
    },
    // Enable debug messages in development
    debug: ("TURBOPACK compile-time value", "development") === 'development'
});
}}),
"[project]/src/lib/constants.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "APP_NAME": (()=>APP_NAME),
    "AUTH_USER_STORAGE_KEY": (()=>AUTH_USER_STORAGE_KEY),
    "DEFAULT_USERS_STORAGE_KEY": (()=>DEFAULT_USERS_STORAGE_KEY),
    "NAV_LINKS_CONFIG": (()=>NAV_LINKS_CONFIG),
    "ROLES": (()=>ROLES),
    "ROUTES": (()=>ROUTES),
    "USER_NAV_ITEMS": (()=>USER_NAV_ITEMS)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [middleware-edge] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [middleware-edge] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [middleware-edge] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [middleware-edge] (ecmascript) <export default as LogOut>");
;
const APP_NAME = 'EduCentral';
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
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    GURU_DASHBOARD: '/guru/dashboard',
    SISWA_DASHBOARD: '/siswa/dashboard',
    PIMPINAN_DASHBOARD: '/pimpinan/dashboard',
    DATA_VISUALIZATION: '/data-visualization',
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings'
};
const NAV_LINKS_CONFIG = [
    {
        href: ROUTES.ADMIN_DASHBOARD,
        label: 'Dashboard',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        roles: [
            'admin',
            'superadmin'
        ]
    },
    {
        href: ROUTES.GURU_DASHBOARD,
        label: 'Dashboard',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        roles: [
            'guru'
        ]
    },
    {
        href: ROUTES.SISWA_DASHBOARD,
        label: 'Dashboard',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        roles: [
            'siswa'
        ]
    },
    {
        href: ROUTES.PIMPINAN_DASHBOARD,
        label: 'Dashboard',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        roles: [
            'pimpinan'
        ]
    },
    {
        href: ROUTES.ADMIN_USERS,
        label: 'User Management',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
        roles: [
            'admin',
            'superadmin'
        ]
    },
    {
        href: ROUTES.DATA_VISUALIZATION,
        label: 'Data Visualization',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
        roles: [
            'admin',
            'guru',
            'siswa',
            'pimpinan',
            'superadmin'
        ]
    }
];
const USER_NAV_ITEMS = [
    // { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
    {
        href: ROUTES.LOGIN,
        label: 'Logout',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"],
        action: 'logout'
    }
];
const DEFAULT_USERS_STORAGE_KEY = 'educentral_users';
const AUTH_USER_STORAGE_KEY = 'educentral_auth_user';
}}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/auth.ts [middleware-edge] (ecmascript)"); // Assuming auth is configured here
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [middleware-edge] (ecmascript)"); // Assuming ROUTES are defined here
;
;
;
const protectedRoutes = [
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].ADMIN_DASHBOARD,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].ADMIN_USERS,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].GURU_DASHBOARD,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].SISWA_DASHBOARD,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].PIMPINAN_DASHBOARD,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].DATA_VISUALIZATION
];
const authRoutes = [
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].LOGIN,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].REGISTER,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].VERIFY_EMAIL
]; // Routes for unauthenticated users
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth"])((req)=>{
    const { nextUrl } = req;
    const session = req.auth; // Session object from Auth.js
    const isAuthenticated = !!session;
    const isProtectedRoute = protectedRoutes.some((route)=>nextUrl.pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route)=>nextUrl.pathname.startsWith(route));
    if (isProtectedRoute && !isAuthenticated) {
        // Redirect unauthenticated users trying to access protected routes to login
        const loginUrl = new URL(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].LOGIN, nextUrl.origin);
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname); // Persist intended destination
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    if (isAuthRoute && isAuthenticated) {
        // Redirect authenticated users trying to access login/register to their dashboard
        let dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].HOME; // Default redirect
        if (session?.user?.role) {
            switch(session.user.role){
                case 'admin':
                    dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].ADMIN_DASHBOARD;
                    break;
                case 'superadmin':
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
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(dashboardUrl, nextUrl.origin));
    }
    // Special handling for root page based on authentication status
    if (nextUrl.pathname === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].HOME) {
        if (isAuthenticated) {
            let dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].SISWA_DASHBOARD; // Default for safety
            if (session?.user?.role) {
                switch(session.user.role){
                    case 'admin':
                        dashboardUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].ADMIN_DASHBOARD;
                        break;
                    case 'superadmin':
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
                }
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(dashboardUrl, nextUrl.origin));
        } else {
            // If on home and not authenticated, redirect to login
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ROUTES"].LOGIN, nextUrl.origin));
        }
    }
    // Allow request to proceed
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
});
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files in public folder
     */ '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__39be89b0._.js.map