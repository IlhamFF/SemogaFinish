
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import type { UserEntity } from "./user.entity";
import type { TugasSubmissionEntity } from "./tugas-submission.entity"; // Ditambahkan

@Entity({ name: "tugas" })
export class TugasEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  judul!: string;

  @Column({ type: "text", nullable: true })
  deskripsi?: string | null;

  @Column({ type: "varchar", length: 255 }) // Menyimpan nama mata pelajaran
  mapel!: string;

  @Column({ type: "varchar", length: 255 }) // Menyimpan nama kelas atau daftar kelas
  kelas!: string;

  @Column({ type: "timestamp with time zone" })
  tenggat!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  namaFileLampiran?: string | null;

  @Column({ type: "varchar", length: 500, nullable: true }) // Path simulasi ke file
  fileUrlLampiran?: string | null;

  @Column({ type: "uuid" })
  uploaderId!: string;

  @ManyToOne(() => UserEntity, (user) => user.tugasUploaded, { onDelete: "CASCADE", nullable: false }) // Jika uploader dihapus, tugas juga terhapus
  @JoinColumn({ name: "uploaderId" })
  uploader!: UserEntity; // Relasi ke UserEntity

  @OneToMany(() => TugasSubmissionEntity, (submission) => submission.tugas) // Ditambahkan
  submissions?: TugasSubmissionEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
