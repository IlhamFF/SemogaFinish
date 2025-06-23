import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from "typeorm";
import type { JadwalPelajaranEntity } from "./jadwal-pelajaran.entity";

@Entity({ name: "ruangan" })
export class RuanganEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  nama!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 50 })
  kode!: string;

  @Column({ type: "int" })
  kapasitas!: number;

  @Column({ type: "text", nullable: true })
  fasilitas?: string | null;

  @OneToMany(() => "JadwalPelajaranEntity", (jadwal: JadwalPelajaranEntity) => jadwal.ruangan)
  jadwalPelajaranEntries?: JadwalPelajaranEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
