
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from "typeorm";
import type { JadwalPelajaranEntity } from "./jadwal-pelajaran.entity";

@Entity({ name: "slot_waktu" })
export class SlotWaktuEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true }) // Nama slot sebaiknya unik untuk kemudahan referensi
  @Column({ type: "varchar", length: 100 })
  namaSlot!: string;

  @Column({ type: "time" }) // Format "HH:MM:SS" atau "HH:MM"
  waktuMulai!: string;

  @Column({ type: "time" })
  waktuSelesai!: string;

  @Column({ type: "int", nullable: true }) // Untuk pengurutan custom jika diperlukan
  urutan?: number | null;

  @OneToMany("JadwalPelajaranEntity", (jadwal) => jadwal.slotWaktu)
  jadwalPelajaranEntries?: JadwalPelajaranEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
