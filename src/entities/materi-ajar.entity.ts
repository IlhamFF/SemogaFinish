
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { JENIS_MATERI_AJAR, type JenisMateriAjarType } from "@/types";
import type { UserEntity } from "./user.entity"; // Menggunakan import type

@Entity({ name: "materi_ajar" })
export class MateriAjarEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  judul!: string;

  @Column({ type: "text", nullable: true })
  deskripsi?: string | null;

  @Column({ type: "varchar", length: 255 }) // Menyimpan nama mata pelajaran
  mapelNama!: string;

  @Column({
    type: "enum",
    enum: JENIS_MATERI_AJAR,
  })
  jenisMateri!: JenisMateriAjarType;

  @Column({ type: "varchar", length: 255, nullable: true })
  namaFileOriginal?: string | null; // Nama file asli saat diunggah

  @Column({ type: "varchar", length: 500, nullable: true }) // Bisa URL atau path internal (simulasi)
  fileUrl?: string | null;

  @Column({ type: "date" }) // Hanya tanggal, tanpa waktu
  tanggalUpload!: string;

  @Column({ type: "uuid" })
  uploaderId!: string;

  @ManyToOne("UserEntity", { onDelete: "SET NULL", nullable: true }) // Jika uploader dihapus, set uploaderId jadi NULL
  @JoinColumn({ name: "uploaderId" })
  uploader?: UserEntity;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
