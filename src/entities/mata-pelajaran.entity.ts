
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from "typeorm";
import { KATEGORI_MAPEL } from "@/lib/constants";
// Removed self-reference for type: import type { KategoriMapelType } from "@/entities/mata-pelajaran.entity"; 
import type { StrukturKurikulumEntity } from "./struktur-kurikulum.entity";
import type { SilabusEntity } from "./silabus.entity";
import type { RppEntity } from "./rpp.entity";

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
    enum: KATEGORI_MAPEL, 
  })
  kategori!: KategoriMapelType;

  @OneToMany("StrukturKurikulumEntity", (ske: StrukturKurikulumEntity) => ske.mapel)
  strukturKurikulumEntries?: StrukturKurikulumEntity[];

  @OneToMany("SilabusEntity", (silabus: SilabusEntity) => silabus.mapel)
  silabusList?: SilabusEntity[];

  @OneToMany("RppEntity", (rpp: RppEntity) => rpp.mapel)
  rppList?: RppEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
