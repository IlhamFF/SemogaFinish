
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from "typeorm";
import { KATEGORI_MAPEL } from "@/lib/constants";
import type { KategoriMapelType } from "@/entities/mata-pelajaran.entity"; // Self-reference for type
import type { StrukturKurikulumEntity } from "./struktur-kurikulum.entity";

// Menggunakan tipe string untuk kategori agar lebih fleksibel jika nilai berubah,
// namun validasi bisa dilakukan di level aplikasi atau dengan check constraint di DB jika perlu.
// Jika KATEGORI_MAPEL adalah enum string, Anda bisa menggunakannya langsung.
export type KategoriMapelType = typeof KATEGORI_MAPEL[number];

@Entity({ name: "mata_pelajaran" })
export class MataPelajaranEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 50 })
  kode!: string;

  @Column({ type: "varchar", length: 255 })
  nama!: string;

  @Column({ type: "text", nullable: true })
  deskripsi?: string | null;

  @Column({
    type: "enum",
    enum: KATEGORI_MAPEL, // Menggunakan konstanta sebagai enum
  })
  kategori!: KategoriMapelType;

  @OneToMany("StrukturKurikulumEntity", (ske) => ske.mapel)
  strukturKurikulumEntries?: StrukturKurikulumEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
