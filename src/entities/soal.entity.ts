
import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import type { UserEntity } from "./user.entity";
import type { MataPelajaranEntity } from "./mata-pelajaran.entity";

export type TingkatKesulitanEntity = "Mudah" | "Sedang" | "Sulit";
export interface PilihanJawabanEntity {
  id: string;
  text: string;
}

@Entity({ name: "soal" })
export class SoalEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  pertanyaan!: string;

  @Column({ type: "jsonb" })
  pilihanJawaban!: PilihanJawabanEntity[];

  @Column({ type: "varchar" })
  kunciJawaban!: string;

  @Column({
    type: "enum",
    enum: ["Mudah", "Sedang", "Sulit"],
    default: "Sedang",
  })
  tingkatKesulitan!: TingkatKesulitanEntity;

  @Column({ type: "uuid" })
  mapelId!: string;

  @ManyToOne("MataPelajaranEntity", (mapel) => mapel.id, { onDelete: "CASCADE" })
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
