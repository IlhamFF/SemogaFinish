
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import type { UserEntity } from "./user.entity";
import type { TugasEntity } from "./tugas.entity";
import type { SubmissionStatus } from "@/types";

@Entity({ name: "tugas_submissions" })
@Index(["siswaId", "tugasId"], { unique: true }) // Siswa hanya bisa submit satu kali per tugas
export class TugasSubmissionEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  siswaId!: string;

  @ManyToOne("UserEntity", (user) => user.tugasSubmissions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "siswaId" })
  siswa!: UserEntity;

  @Column({ type: "uuid" })
  tugasId!: string;

  @ManyToOne("TugasEntity", (tugas) => tugas.submissions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tugasId" })
  tugas!: TugasEntity;

  @Column({ type: "varchar", length: 255, nullable: true })
  namaFileJawaban?: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  fileUrlJawaban?: string | null; // Path simulasi ke file

  @Column({ type: "text", nullable: true })
  catatanSiswa?: string | null;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  dikumpulkanPada!: Date;

  @Column({
    type: "enum",
    enum: ["Menunggu Penilaian", "Dinilai", "Terlambat"], // Definisikan kemungkinan status
    default: "Menunggu Penilaian",
  })
  status!: SubmissionStatus;

  @Column({ type: "numeric", precision: 5, scale: 2, nullable: true })
  nilai?: number | null;

  @Column({ type: "text", nullable: true })
  feedbackGuru?: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
