
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import type { AdapterSession } from "@auth/core/adapters";
import { UserEntity } from "./user.entity";

@Entity({ name: "sessions" })
export class SessionEntity implements AdapterSession {
  @PrimaryColumn({ type: "uuid", default: () => "uuid_generate_v4()" })
  id!: string;

  @Column()
  sessionToken!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "timestamp" })
  expires!: Date;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserEntity;
}
