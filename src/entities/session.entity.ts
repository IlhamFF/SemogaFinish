
import "reflect-metadata"; // Ensure this is the very first import
// This entity is specific to NextAuth.js and is not needed for custom token auth.
// It can be safely deleted once all NextAuth.js dependencies are removed.
// import type { AdapterSession } from "@auth/core/adapters"; 
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import type { UserEntity } from "./user.entity";

// @Entity({ name: "sessions" })
// export class SessionEntity /* implements AdapterSession */ { 
//   @PrimaryColumn({ type: "uuid", default: () => "uuid_generate_v4()" })
//   id!: string;

//   @Column()
//   sessionToken!: string;

//   @Column({ type: "uuid" })
//   userId!: string;

//   @Column({ type: "timestamp" })
//   expires!: Date;

//   @ManyToOne("UserEntity", (user: UserEntity) => user.sessions, { onDelete: "CASCADE" }) // Type UserEntity explicitly
//   @JoinColumn({ name: "userId" })
//   user!: UserEntity;
// }
