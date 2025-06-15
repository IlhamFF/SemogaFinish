
import "reflect-metadata"; // Ensure this is the very first import
// import type { AdapterSession } from "@auth/core/adapters"; // Removed
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import type { UserEntity } from "./user.entity";

@Entity({ name: "sessions" })
export class SessionEntity /* implements AdapterSession */ { // Removed implements
  @PrimaryColumn({ type: "uuid", default: () => "uuid_generate_v4()" })
  id!: string;

  @Column()
  sessionToken!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "timestamp" })
  expires!: Date;

  @ManyToOne("UserEntity", user => user.sessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserEntity;
}
