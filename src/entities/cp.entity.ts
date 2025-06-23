
import "reflect-metadata"; 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { FASE_CP, type FaseCpType } from "@/types";

@Entity({ name: "capaian_pembelajaran" })
export class CpEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  kode!: string;

  @Column({ type: "text" })
  deskripsi!: string;

  @Column({
    type: "enum",
    enum: FASE_CP,
  })
  fase!: FaseCpType;

  @Column({ type: "varchar", length: 255 })
  elemen!: string; 

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
