import "reflect-metadata"; 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from "typeorm";
import { KATEGORI_MAPEL } from "@/lib/constants";
import type { KategoriMapelType } from "@/types"; 
import { StrukturKurikulumEntity } from "./struktur-kurikulum.entity";
import { SilabusEntity } from "./silabus.entity";
import { RppEntity } from "./rpp.entity";
import { JadwalPelajaranEntity } from "./jadwal-pelajaran.entity";
import type { NilaiSemesterSiswaEntity } from "./nilai-semester-siswa.entity"; 

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

  @OneToMany(() => StrukturKurikulumEntity, (ske: StrukturKurikulumEntity) => ske.mapel)
  strukturKurikulumEntries?: StrukturKurikulumEntity[];

  @OneToMany(() => SilabusEntity, (silabus: SilabusEntity) => silabus.mapel)
  silabusList?: SilabusEntity[];

  @OneToMany(() => RppEntity, (rpp: RppEntity) => rpp.mapel)
  rppList?: RppEntity[];

  @OneToMany(() => JadwalPelajaranEntity, (jadwal: JadwalPelajaranEntity) => jadwal.mapel)
  jadwalPelajaranEntries?: JadwalPelajaranEntity[];

  @OneToMany("NilaiSemesterSiswaEntity", (nilai) => nilai.mapel) 
  nilaiSemesterSiswaEntries?: NilaiSemesterSiswaEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
