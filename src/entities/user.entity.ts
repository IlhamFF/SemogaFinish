
import "reflect-metadata"; // Ensure this is the very first import
// import type { AdapterUser } from "@auth/core/adapters"; // Removed
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import type { Role } from "@/types";
import type { AccountEntity } from "./account.entity";
import type { SessionEntity } from "./session.entity";
import type { StrukturKurikulumEntity } from "./struktur-kurikulum.entity";
import type { MateriAjarEntity } from "./materi-ajar.entity";
import type { SilabusEntity } from "./silabus.entity";
import type { RppEntity } from "./rpp.entity";

@Entity({ name: "users" })
export class UserEntity /* implements AdapterUser */ { // Removed implements
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", nullable: true })
  name?: string | null; 

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerified?: Date | null;

  @Column({ type: "varchar", nullable: true })
  image?: string | null; 

  @Column({ type: "varchar", nullable: true }) // For storing hashed password
  passwordHash?: string | null;

  @Column({
    type: "enum",
    enum: ['admin', 'guru', 'siswa', 'pimpinan', 'superadmin'],
    default: 'siswa'
  })
  role!: Role;

  @Column({ type: "boolean", default: false })
  isVerified!: boolean; 

  @Column({ type: "varchar", nullable: true })
  fullName?: string | null;

  @Column({ type: "varchar", nullable: true })
  phone?: string | null;

  @Column({ type: "text", nullable: true })
  address?: string | null;

  @Column({ type: "date", nullable: true })
  birthDate?: string | null; 

  @Column({ type: "text", nullable: true })
  bio?: string | null;

  @Column({ type: "varchar", nullable: true })
  nis?: string | null; 

  @Column({ type: "varchar", nullable: true })
  nip?: string | null; 

  @Column({ type: "date", nullable: true })
  joinDate?: string | null; 

  @Column({ type: "varchar", nullable: true })
  kelasId?: string | null; 

  @Column("simple-array", { nullable: true })
  mataPelajaran?: string[] | null; // Nama mata pelajaran yang diampu guru

  @Column({ type: "varchar", nullable: true })
  resetPasswordToken?: string | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  resetPasswordExpires?: Date | null;
  
  @OneToMany("AccountEntity", account => account.user)
  accounts?: AccountEntity[];

  @OneToMany("SessionEntity", session => session.user)
  sessions?: SessionEntity[];

  @OneToMany("StrukturKurikulumEntity", ske => ske.guruPengampu)
  strukturKurikulumDiajar?: StrukturKurikulumEntity[];

  @OneToMany("MateriAjarEntity", materi => materi.uploader)
  materiAjarUploaded?: MateriAjarEntity[];

  @OneToMany("SilabusEntity", silabus => silabus.uploader)
  silabusUploaded?: SilabusEntity[];

  @OneToMany("RppEntity", rpp => rpp.uploader)
  rppUploaded?: RppEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}

