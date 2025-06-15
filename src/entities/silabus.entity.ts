
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import type { MataPelajaranEntity } from "./mata-pelajaran.entity";
import type { UserEntity } from "./user.entity";

@Entity({ name: "silabus" })
export class SilabusEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  judul!: string;

  @Column({ type: "uuid" })
  mapelId!: string;

  @ManyToOne("MataPelajaranEntity", (mapel) => mapel.silabusList, { onDelete: "CASCADE" })
  @JoinColumn({ name: "mapelId" })
  mapel!: MataPelajaranEntity;

  @Column({ type: "varchar", length: 100 }) // e.g., "X IPA 1", "Semua Kelas XI"
  kelas!: string;

  @Column({ type: "text", nullable: true })
  deskripsiSingkat?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  namaFileOriginal?: string | null;

  @Column({ type: "varchar", length: 500, nullable: true }) // Path simulasi ke file
  fileUrl?: string | null;

  @Column({ type: "uuid" })
  uploaderId!: string;

  @ManyToOne("UserEntity", (user) => user.silabusUploaded, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "uploaderId" })
  uploader?: UserEntity | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
