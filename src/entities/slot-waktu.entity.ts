
import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from "typeorm";
import type { JadwalPelajaranEntity } from "./jadwal-pelajaran.entity";

@Entity({ name: "slot_waktu" })
export class SlotWaktuEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  namaSlot!: string;

  @Column({ type: "time" })
  waktuMulai!: string;

  @Column({ type: "time" })
  waktuSelesai!: string;

  @Column({ type: "int", nullable: true })
  urutan?: number | null;

  @OneToMany("JadwalPelajaranEntity", (jadwal: JadwalPelajaranEntity) => jadwal.slotWaktu)
  jadwalPelajaranEntries?: JadwalPelajaranEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
