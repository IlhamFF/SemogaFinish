(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__a20d4f66._.js", {

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
"[project]/src/entities/account.entity.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "AccountEntity": (()=>AccountEntity)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_decorate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_decorate.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$entity$2f$Entity$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/entity/Entity.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$PrimaryColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/PrimaryColumn.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/Column.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$ManyToOne$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/relations/ManyToOne.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$JoinColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/relations/JoinColumn.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$user$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/entities/user.entity.ts [middleware-edge] (ecmascript)"); // Correctly import UserEntity
;
;
;
;
let AccountEntity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_decorate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["_"])([
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$entity$2f$Entity$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Entity"])({
        name: "accounts"
    })
], function(_initialize) {
    class AccountEntity {
        constructor(){
            _initialize(this);
        }
    }
    return {
        F: AccountEntity,
        d: [
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$PrimaryColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["PrimaryColumn"])({
                        type: "uuid",
                        default: ()=>"uuid_generate_v4()"
                    }) // Or let TypeORM handle it if not using uuid extension manually
                ],
                key: "id",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "uuid"
                    })
                ],
                key: "userId",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])()
                ],
                key: "type",
                value: void 0
            } // "oauth", "email", "credentials", etc.
            ,
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])()
                ],
                key: "provider",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])()
                ],
                key: "providerAccountId",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "refresh_token",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "access_token",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "bigint",
                        nullable: true
                    })
                ],
                key: "expires_at",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "token_type",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "scope",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "text",
                        nullable: true
                    })
                ],
                key: "id_token",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "session_state",
                value: void 0
            },
            // Foreign key to UserEntity
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$ManyToOne$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ManyToOne"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$user$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["UserEntity"], (user)=>user.accounts, {
                        onDelete: "CASCADE"
                    }),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$JoinColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JoinColumn"])({
                        name: "userId"
                    }) // Specify the foreign key column name
                ],
                key: "user",
                value: void 0
            }
        ]
    };
});
}}),
"[project]/src/entities/session.entity.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "SessionEntity": (()=>SessionEntity)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_decorate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_decorate.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$entity$2f$Entity$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/entity/Entity.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$PrimaryColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/PrimaryColumn.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/Column.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$ManyToOne$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/relations/ManyToOne.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$JoinColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/relations/JoinColumn.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$user$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/entities/user.entity.ts [middleware-edge] (ecmascript)");
;
;
;
;
let SessionEntity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_decorate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["_"])([
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$entity$2f$Entity$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Entity"])({
        name: "sessions"
    })
], function(_initialize) {
    class SessionEntity {
        constructor(){
            _initialize(this);
        }
    }
    return {
        F: SessionEntity,
        d: [
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$PrimaryColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["PrimaryColumn"])({
                        type: "uuid",
                        default: ()=>"uuid_generate_v4()"
                    })
                ],
                key: "id",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])()
                ],
                key: "sessionToken",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "uuid"
                    })
                ],
                key: "userId",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "timestamp"
                    })
                ],
                key: "expires",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$ManyToOne$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ManyToOne"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$user$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["UserEntity"], {
                        onDelete: "CASCADE"
                    }),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$JoinColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JoinColumn"])({
                        name: "userId"
                    })
                ],
                key: "user",
                value: void 0
            }
        ]
    };
});
}}),
"[project]/src/entities/user.entity.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "UserEntity": (()=>UserEntity)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_decorate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_decorate.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$entity$2f$Entity$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/entity/Entity.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$PrimaryGeneratedColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/PrimaryGeneratedColumn.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/Column.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$CreateDateColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/CreateDateColumn.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$UpdateDateColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/UpdateDateColumn.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$OneToMany$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/relations/OneToMany.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$account$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/entities/account.entity.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$session$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/entities/session.entity.ts [middleware-edge] (ecmascript)"); // Added for completeness if needed for user relations
;
;
;
;
;
let UserEntity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_decorate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["_"])([
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$entity$2f$Entity$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Entity"])({
        name: "users"
    })
], function(_initialize) {
    class UserEntity {
        constructor(){
            _initialize(this);
        }
    }
    return {
        F: UserEntity,
        d: [
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$PrimaryGeneratedColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["PrimaryGeneratedColumn"])("uuid")
                ],
                key: "id",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "name",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        unique: true
                    })
                ],
                key: "email",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "timestamp",
                        nullable: true
                    })
                ],
                key: "emailVerified",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "image",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    }) // For storing hashed password
                ],
                key: "passwordHash",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "enum",
                        enum: [
                            'admin',
                            'guru',
                            'siswa',
                            'pimpinan',
                            'superadmin'
                        ],
                        default: 'siswa'
                    })
                ],
                key: "role",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "boolean",
                        default: false
                    })
                ],
                key: "isVerified",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "fullName",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "phone",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "text",
                        nullable: true
                    })
                ],
                key: "address",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "date",
                        nullable: true
                    })
                ],
                key: "birthDate",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "text",
                        nullable: true
                    })
                ],
                key: "bio",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "nis",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "nip",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "date",
                        nullable: true
                    })
                ],
                key: "joinDate",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "varchar",
                        nullable: true
                    })
                ],
                key: "kelasId",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])("simple-array", {
                        nullable: true
                    })
                ],
                key: "mataPelajaran",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$CreateDateColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CreateDateColumn"])({
                        type: "timestamp with time zone"
                    })
                ],
                key: "createdAt",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$UpdateDateColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["UpdateDateColumn"])({
                        type: "timestamp with time zone"
                    })
                ],
                key: "updatedAt",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$OneToMany$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["OneToMany"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$account$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["AccountEntity"], (account)=>account.user)
                ],
                key: "accounts",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$relations$2f$OneToMany$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["OneToMany"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$session$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["SessionEntity"], (session)=>session.user)
                ],
                key: "sessions",
                value: void 0
            }
        ]
    };
});
}}),
"[project]/src/entities/verification-token.entity.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "VerificationTokenEntity": (()=>VerificationTokenEntity)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_decorate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_decorate.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$entity$2f$Entity$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/entity/Entity.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$PrimaryColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/PrimaryColumn.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/decorator/columns/Column.js [middleware-edge] (ecmascript)");
;
;
;
let VerificationTokenEntity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_decorate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["_"])([
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$entity$2f$Entity$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Entity"])({
        name: "verification_tokens"
    })
], function(_initialize) {
    class VerificationTokenEntity {
        constructor(){
            _initialize(this);
        }
    }
    return {
        F: VerificationTokenEntity,
        d: [
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$PrimaryColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["PrimaryColumn"])() // identifier + token is a composite primary key
                ],
                key: "identifier",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$PrimaryColumn$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["PrimaryColumn"])()
                ],
                key: "token",
                value: void 0
            },
            {
                kind: "field",
                decorators: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$decorator$2f$columns$2f$Column$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Column"])({
                        type: "timestamp"
                    })
                ],
                key: "expires",
                value: void 0
            }
        ]
    };
});
}}),
"[project]/src/lib/data-source.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "AppDataSource": (()=>AppDataSource),
    "getInitializedDataSource": (()=>getInitializedDataSource)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$reflect$2d$metadata$2f$Reflect$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/reflect-metadata/Reflect.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$data$2d$source$2f$DataSource$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typeorm/browser/data-source/DataSource.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$user$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/entities/user.entity.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$account$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/entities/account.entity.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$session$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/entities/session.entity.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$verification$2d$token$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/entities/verification-token.entity.ts [middleware-edge] (ecmascript)");
;
;
;
;
;
;
// Import other application-specific entities here as they are created
// e.g., import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
const dataSourceOptions = {
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_DB || "educentral",
    synchronize: ("TURBOPACK compile-time value", "development") === "development",
    logging: ("TURBOPACK compile-time truthy", 1) ? [
        "query",
        "error"
    ] : ("TURBOPACK unreachable", undefined),
    entities: [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$user$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["UserEntity"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$account$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["AccountEntity"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$session$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["SessionEntity"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$verification$2d$token$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VerificationTokenEntity"]
    ],
    migrations: [],
    subscribers: []
};
const AppDataSource = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typeorm$2f$browser$2f$data$2d$source$2f$DataSource$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["DataSource"](dataSourceOptions);
// Initialize DataSource
// It's often better to initialize it once and export the initialized instance
// or handle initialization carefully at the application's entry point.
// For Next.js API routes, you might need to ensure it's initialized before use.
let_isDataSourceInitialized = false;
async function getInitializedDataSource() {
    if (!AppDataSource.isInitialized && !_isDataSourceInitialized) {
        try {
            await AppDataSource.initialize();
            _isDataSourceInitialized = true;
            console.log("DataSource has been initialized successfully.");
        } catch (err) {
            console.error("Error during DataSource initialization:", err);
            throw err; // Re-throw error to handle it further up the call stack if needed
        }
    }
    return AppDataSource;
}
}}),
"[project]/src/app/api/auth/[...nextauth]/route.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>handler),
    "POST": (()=>handler),
    "authOptions": (()=>authOptions)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/node_modules/@auth/core/providers/credentials.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$typeorm$2d$adapter$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth/typeorm-adapter/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2d$source$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data-source.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$user$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/entities/user.entity.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$dist$2f$bcrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/dist/bcrypt.js [middleware-edge] (ecmascript)");
;
;
;
;
;
;
const authOptions = {
    adapter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$typeorm$2d$adapter$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["TypeORMAdapter"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2d$source$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["AppDataSource"]),
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "jsmith@example.com"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials, req) {
                if (!credentials?.email || !credentials.password) {
                    console.log("Authorize: Missing credentials");
                    return null;
                }
                const dataSource = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2d$source$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getInitializedDataSource"])();
                const userRepo = dataSource.getRepository(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$entities$2f$user$2e$entity$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["UserEntity"]);
                console.log("Authorize: Attempting to find user by email:", credentials.email);
                const user = await userRepo.findOne({
                    where: {
                        email: credentials.email
                    }
                });
                if (!user) {
                    console.log("Authorize: No user found with email:", credentials.email);
                    return null;
                }
                if (!user.passwordHash) {
                    console.log("Authorize: User found but has no passwordHash:", user.email);
                    return null;
                }
                console.log("Authorize: User found, comparing password for:", user.email);
                const isValidPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$dist$2f$bcrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].compare(credentials.password, user.passwordHash);
                if (!isValidPassword) {
                    console.log("Authorize: Invalid password for user:", user.email);
                    return null;
                }
                console.log("Authorize: Credentials valid for user:", user.email);
                // Return the user object that NextAuth expects, including custom fields
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    isVerified: user.isVerified,
                    fullName: user.fullName
                };
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt ({ token, user, trigger, session: newSessionData }) {
            // On initial sign in
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isVerified = user.isVerified;
                token.name = user.name;
                token.picture = user.image;
                token.fullName = user.fullName;
            }
            // If session is updated (e.g., profile update)
            if (trigger === "update" && newSessionData?.user) {
                token.name = newSessionData.user.name;
                token.picture = newSessionData.user.image;
                // Potentially update other fields if they can be changed and you want them in the token
                if (newSessionData.user.fullName) token.fullName = newSessionData.user.fullName;
            }
            return token;
        },
        async session ({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.isVerified = token.isVerified;
                session.user.name = token.name;
                session.user.image = token.picture;
                session.user.fullName = token.fullName;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login"
    },
    secret: process.env.NEXTAUTH_SECRET
};
const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(authOptions);
;
}}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/auth/[...nextauth]/route.ts [middleware-edge] (ecmascript)");
;
;
// export default NextAuth(authOptions).auth;
// The above line can cause issues if authOptions has providers like Credentials that are not edge-compatible.
// For a simpler middleware just handling session protection, we can use a more direct approach
// or ensure authOptions are edge-compatible.
// A more direct way to get the middleware if only session checking is needed,
// or ensure your authOptions are fully edge-compatible if using the above.
// For now, to ensure it works without deep diving into edge compatibility of TypeORM adapter:
// We will use the recommended way to export the auth property from NextAuth instance.
// If this still causes edge runtime issues, `authOptions` might need an edge-compatible version.
const { auth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["authOptions"]);
const __TURBOPACK__default__export__ = auth;
const config = {
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
     */ '/((?!api|_next/static|_next/image|favicon.ico|logo.png|login|register|forgot-password|reset-password|verify-email|^/$).*)'
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__a20d4f66._.js.map