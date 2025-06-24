
import "reflect-metadata"; 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { JENIS_MATERI_AJAR, type JenisMateriAjarType } from "@/types";
import type { UserEntity } from "./user.entity"; 

@Entity({ name: "materi_ajar" })
export class MateriAjarEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  judul!: string;

  @Column({ type: "text", nullable: true })
  deskripsi?: string | null;

  @Column({ type: "varchar", length: 255 }) 
  mapelNama!: string;

  @Column({
    type: "enum",
    enum: JENIS_MATERI_AJAR,
  })
  jenisMateri!: JenisMateriAjarType;

  @Column({ type: "varchar", length: 255, nullable: true })
  namaFileOriginal?: string | null; 

  @Column({ type: "varchar", length: 500, nullable: true }) 
  fileUrl?: string | null;

  @Column({ type: "date" }) 
  tanggalUpload!: string;

  @Column({ type: "uuid" })
  uploaderId!: string;

  @ManyToOne(() => UserEntity, (user) => user.materiAjarUploaded, { onDelete: "SET NULL", nullable: true }) 
  @JoinColumn({ name: "uploaderId" })
  uploader?: UserEntity;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
