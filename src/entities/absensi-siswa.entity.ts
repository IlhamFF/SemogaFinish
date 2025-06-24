
import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from "typeorm";
import type { UserEntity } from "./user.entity";
import type { JadwalPelajaranEntity } from "./jadwal-pelajaran.entity";

export type StatusKehadiran = "Hadir" | "Izin" | "Sakit" | "Alpha";

@Entity({ name: "absensi_siswa" })
@Unique(["siswaId", "jadwalPelajaranId", "tanggalAbsensi"])
export class AbsensiSiswaEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  siswaId!: string;

  @ManyToOne("UserEntity", (user: UserEntity) => user.kehadiranSiswa, { onDelete: "CASCADE" })
  @JoinColumn({ name: "siswaId" })
  siswa!: UserEntity;

  @Column({ type: "uuid" })
  jadwalPelajaranId!: string;

  @ManyToOne("JadwalPelajaranEntity", (jadwal: JadwalPelajaranEntity) => jadwal.absensiSiswaEntries, { onDelete: "CASCADE" })
  @JoinColumn({ name: "jadwalPelajaranId" })
  jadwalPelajaran!: JadwalPelajaranEntity;

  @Column({ type: "date" })
  tanggalAbsensi!: string; 

  @Column({
    type: "enum",
    enum: ["Hadir", "Izin", "Sakit", "Alpha"],
  })
  statusKehadiran!: StatusKehadiran;

  @Column({ type: "text", nullable: true })
  catatan?: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
