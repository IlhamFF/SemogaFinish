import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { AdapterAccount } from "@auth/core/adapters";
import type { UserEntity } from "./user.entity";

@Entity({ name: "accounts" })
export class AccountEntity implements AdapterAccount {
  @PrimaryColumn({ type: "uuid", default: () => "uuid_generate_v4()" }) // Or let TypeORM handle it if not using uuid extension manually
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column()
  type!: string; // "oauth", "email", "credentials", etc.

  @Column()
  provider!: string;

  @Column()
  providerAccountId!: string;

  @Column({ type: "varchar", nullable: true })
  refresh_token?: string | null;

  @Column({ type: "varchar", nullable: true })
  access_token?: string | null;

  @Column({ type: "bigint", nullable: true })
  expires_at?: number | null;

  @Column({ type: "varchar", nullable: true })
  token_type?: string | null;

  @Column({ type: "varchar", nullable: true })
  scope?: string | null;

  @Column({ type: "text", nullable: true })
  id_token?: string | null;

  @Column({ type: "varchar", nullable: true })
  session_state?: string | null;

  // Foreign key to UserEntity
  @ManyToOne("UserEntity", user => user.accounts, {
    onDelete: "CASCADE", // If user is deleted, delete their accounts
  })
  @JoinColumn({ name: "userId" }) // Specify the foreign key column name
  user!: UserEntity;
}
