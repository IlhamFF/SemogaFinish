
import "reflect-metadata"; 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import type { MataPelajaranEntity } from "./mata-pelajaran.entity";
import type { UserEntity } from "./user.entity";

@Entity({ name: "struktur_kurikulum" })
@Index(["tingkat", "jurusan", "mapel"], { unique: true }) 
export class StrukturKurikulumEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 10 }) 
  tingkat!: string;

  @Column({ type: "varchar", length: 50 }) 
  jurusan!: string;

  @Column({ type: "uuid" })
  mapelId!: string;

  @ManyToOne("MataPelajaranEntity", (mapel) => mapel.strukturKurikulumEntries, { onDelete: "CASCADE" })
  @JoinColumn({ name: "mapelId" })
  mapel!: MataPelajaranEntity;

  @Column({ type: "int" })
  alokasiJam!: number; 

  @Column({ type: "uuid", nullable: true })
  guruPengampuId?: string | null;

  @ManyToOne("UserEntity", (user) => user.strukturKurikulumDiajar, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "guruPengampuId" })
  guruPengampu?: UserEntity | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
