
import { Entity, PrimaryColumn, Column } from "typeorm";
import type { VerificationToken } from "@auth/core/adapters";

@Entity({ name: "verification_tokens" })
export class VerificationTokenEntity implements VerificationToken {
  @PrimaryColumn() // identifier + token is a composite primary key
  identifier!: string;

  @PrimaryColumn()
  token!: string;

  @Column({ type: "timestamp" })
  expires!: Date;
}
