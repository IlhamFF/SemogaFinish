import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import type { UserEntity } from "./user.entity";
import type { MataPelajaranEntity } from "./mata-pelajaran.entity";
import type { TipeSoal } from "@/types";

export type TingkatKesulitanEntity = "Mudah" | "Sedang" | "Sulit";
export interface PilihanJawabanEntity {
  id: string;
  text: string;
}

@Entity({ name: "soal" })
export class SoalEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  
  @Column({ type: "varchar", length: 255, default: "Default Paket" })
  paketSoal!: string;

  @Column({ type: "enum", enum: ["Pilihan Ganda", "Esai"], default: "Pilihan Ganda" })
  tipeSoal!: TipeSoal;

  @Column({ type: "text" })
  pertanyaan!: string;

  @Column({ type: "jsonb", nullable: true })
  pilihanJawaban?: PilihanJawabanEntity[] | null;

  @Column({ type: "varchar", nullable: true })
  kunciJawaban?: string | null;

  @Column({
    type: "enum",
    enum: ["Mudah", "Sedang", "Sulit"],
    default: "Sedang",
  })
  tingkatKesulitan!: TingkatKesulitanEntity;

  @Column({ type: "uuid" })
  mapelId!: string;

  @ManyToOne("MataPelajaranEntity", (mapel) => mapel.id, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "mapelId" })
  mapel!: MataPelajaranEntity;

  @Column({ type: "uuid" })
  pembuatId!: string;

  @ManyToOne("UserEntity", (user) => user.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "pembuatId" })
  pembuat!: UserEntity;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
