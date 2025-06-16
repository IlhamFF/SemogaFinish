
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import type { SlotWaktuEntity } from "./slot-waktu.entity";
import type { MataPelajaranEntity } from "./mata-pelajaran.entity";
import type { UserEntity } from "./user.entity";
import type { RuanganEntity } from "./ruangan.entity";

@Entity({ name: "jadwal_pelajaran" })
// Mencegah kelas yang sama memiliki dua jadwal berbeda pada slot waktu yang sama di hari yang sama
@Index(["hari", "kelas", "slotWaktuId"], { unique: true })
// Indeks untuk membantu query cepat dan deteksi konflik guru
@Index(["hari", "guruId", "slotWaktuId"])
// Indeks untuk membantu query cepat dan deteksi konflik ruangan
@Index(["hari", "ruanganId", "slotWaktuId"])
export class JadwalPelajaranEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 20 }) // Senin, Selasa, dll.
  hari!: string;

  @Column({ type: "varchar", length: 100 }) // Misal: "X IPA 1", "XI IPS Semua"
  kelas!: string;

  @Column({ type: "uuid" })
  slotWaktuId!: string;

  @ManyToOne("SlotWaktuEntity", (slot) => slot.jadwalPelajaranEntries, { onDelete: "CASCADE", eager: true }) // eager load slot detail
  @JoinColumn({ name: "slotWaktuId" })
  slotWaktu!: SlotWaktuEntity;

  @Column({ type: "uuid" })
  mapelId!: string;

  @ManyToOne("MataPelajaranEntity", (mapel) => mapel.jadwalPelajaranEntries, { onDelete: "CASCADE", eager: true }) // eager load mapel detail
  @JoinColumn({ name: "mapelId" })
  mapel!: MataPelajaranEntity;

  @Column({ type: "uuid" })
  guruId!: string;

  @ManyToOne("UserEntity", (user) => user.jadwalMengajar, { onDelete: "CASCADE", eager: true }) // eager load guru detail
  @JoinColumn({ name: "guruId" })
  guru!: UserEntity;

  @Column({ type: "uuid" })
  ruanganId!: string;

  @ManyToOne("RuanganEntity", (ruangan) => ruangan.jadwalPelajaranEntries, { onDelete: "CASCADE", eager: true }) // eager load ruangan detail
  @JoinColumn({ name: "ruanganId" })
  ruangan!: RuanganEntity;
  
  @Column({ type: "text", nullable: true })
  catatan?: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
