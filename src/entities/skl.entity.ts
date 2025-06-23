
import "reflect-metadata"; 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { KATEGORI_SKL, type KategoriSklType } from "@/types";

@Entity({ name: "standar_kompetensi_lulusan" })
export class SklEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 50 })
  kode!: string;

  @Column({ type: "text" })
  deskripsi!: string;

  @Column({
    type: "enum",
    enum: KATEGORI_SKL,
  })
  kategori!: KategoriSklType;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
