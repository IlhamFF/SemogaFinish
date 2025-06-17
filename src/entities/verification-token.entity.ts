
// This entity is specific to NextAuth.js and is not needed for custom token auth.
// It can be safely deleted once all NextAuth.js dependencies are removed.
// import { Entity, PrimaryColumn, Column } from "typeorm";
// import type { VerificationToken } from "@auth/core/adapters";

// @Entity({ name: "verification_tokens" })
// export class VerificationTokenEntity implements VerificationToken {
//   @PrimaryColumn() 
//   identifier!: string;

//   @PrimaryColumn()
//   token!: string;

//   @Column({ type: "timestamp" })
//   expires!: Date;
// }
