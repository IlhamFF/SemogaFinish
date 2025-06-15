
import type { AdapterUser } from "@auth/core/adapters";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import type { Role } from "@/types"; // Assuming Role type is defined elsewhere
import { AccountEntity } from "./account.entity"; // Import AccountEntity
// Import other related entities if needed, e.g., KelasEntity, MataPelajaranEntity

@Entity({ name: "users" })
export class UserEntity implements AdapterUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", nullable: true })
  name?: string | null; // Nickname or short name

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerified?: Date | null;

  @Column({ type: "varchar", nullable: true })
  image?: string | null; // Corresponds to avatarUrl

  // Application-specific fields
  @Column({
    type: "enum",
    enum: ['admin', 'guru', 'siswa', 'pimpinan', 'superadmin'],
    default: 'siswa'
  })
  role!: Role;

  @Column({ type: "boolean", default: false })
  isVerified!: boolean; // Application specific verification status

  @Column({ type: "varchar", nullable: true })
  fullName?: string | null;

  @Column({ type: "varchar", nullable: true })
  phone?: string | null;

  @Column({ type: "text", nullable: true })
  address?: string | null;

  @Column({ type: "date", nullable: true })
  birthDate?: string | null; // Store as YYYY-MM-DD string or Date

  @Column({ type: "text", nullable: true })
  bio?: string | null;

  @Column({ type: "varchar", nullable: true })
  nis?: string | null; // For 'siswa'

  @Column({ type: "varchar", nullable: true })
  nip?: string | null; // For 'guru', 'admin', 'pimpinan'

  @Column({ type: "date", nullable: true })
  joinDate?: string | null; // Store as YYYY-MM-DD string or Date

  @Column({ type: "varchar", nullable: true })
  kelasId?: string | null; // FK to KelasEntity, for 'siswa'

  // If a guru can teach multiple subjects.
  // This would typically be a ManyToMany relationship if subjects are their own entity.
  // For simplicity, if it's just a list of names/codes:
  @Column("simple-array", { nullable: true })
  mataPelajaran?: string[] | null; // For 'guru'

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;

  // Relationship for NextAuth.js adapter (inverse side)
  @OneToMany(() => AccountEntity, (account) => account.user)
  accounts?: AccountEntity[];

  // Add other relationships as needed for your application
  // e.g., @ManyToOne(() => KelasEntity, (kelas) => kelas.students, { nullable: true })
  // kelas?: KelasEntity;

  // e.g., @ManyToMany(() => MataPelajaranEntity, (mapel) => mapel.gurus)
  // @JoinTable()
  // mataPelajaranDiajar?: MataPelajaranEntity[];
}
