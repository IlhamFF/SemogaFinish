
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm";
import type { Role } from "@/types";
// AccountEntity, SessionEntity, and VerificationTokenEntity are not needed for custom token auth
// import type { AccountEntity } from "./account.entity";
// import type { SessionEntity } from "./session.entity";
import type { StrukturKurikulumEntity } from "./struktur-kurikulum.entity";
import type { MateriAjarEntity } from "./materi-ajar.entity";
import type { SilabusEntity } from "./silabus.entity";
import type { RppEntity } from "./rpp.entity";
import type { JadwalPelajaranEntity } from "./jadwal-pelajaran.entity";
import type { TugasEntity } from "./tugas.entity";
import type { TestEntity } from "./test.entity";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", nullable: true })
  name?: string | null; 

  @Index({ unique: true })
  @Column({ type: "varchar"})
  email!: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerified?: Date | null;

  @Column({ type: "varchar", nullable: true })
  image?: string | null; 

  @Column({ type: "varchar" }) // For storing hashed password
  passwordHash!: string;

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
  mataPelajaran?: string[] | null; 
  
  @Column({ type: "varchar", nullable: true })
  resetPasswordToken?: string | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  resetPasswordExpires?: Date | null;
  
  // @OneToMany("AccountEntity", (account: AccountEntity) => account.user)
  // accounts?: AccountEntity[];

  // @OneToMany("SessionEntity", (session: SessionEntity) => session.user)
  // sessions?: SessionEntity[];

  @OneToMany("StrukturKurikulumEntity", (ske: StrukturKurikulumEntity) => ske.guruPengampu)
  strukturKurikulumDiajar?: StrukturKurikulumEntity[];

  @OneToMany("MateriAjarEntity", (materi: MateriAjarEntity) => materi.uploader)
  materiAjarUploaded?: MateriAjarEntity[];

  @OneToMany("SilabusEntity", (silabus: SilabusEntity) => silabus.uploader)
  silabusUploaded?: SilabusEntity[];

  @OneToMany("RppEntity", (rpp: RppEntity) => rpp.uploader)
  rppUploaded?: RppEntity[];

  @OneToMany("JadwalPelajaranEntity", (jadwal: JadwalPelajaranEntity) => jadwal.guru)
  jadwalMengajar?: JadwalPelajaranEntity[];

  @OneToMany("TugasEntity", (tugas: TugasEntity) => tugas.uploader)
  tugasUploaded?: TugasEntity[];

  @OneToMany("TestEntity", (test: TestEntity) => test.uploader)
  testUploaded?: TestEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
