
import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from "typeorm";
import type { SlotWaktuEntity } from "./slot-waktu.entity";
import type { MataPelajaranEntity } from "./mata-pelajaran.entity";
import type { UserEntity } from "./user.entity";
import type { RuanganEntity } from "./ruangan.entity";
import type { AbsensiSiswaEntity } from "./absensi-siswa.entity";

@Entity({ name: "jadwal_pelajaran" })
@Index(["hari", "kelas", "slotWaktuId"], { unique: true })
@Index(["hari", "guruId", "slotWaktuId"])
@Index(["hari", "ruanganId", "slotWaktuId"])
export class JadwalPelajaranEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 20 })
  hari!: string;

  @Column({ type: "varchar", length: 100 })
  kelas!: string;

  @Column({ type: "uuid" })
  slotWaktuId!: string;

  @ManyToOne("SlotWaktuEntity", (slot: SlotWaktuEntity) => slot.jadwalPelajaranEntries, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "slotWaktuId" })
  slotWaktu!: SlotWaktuEntity;

  @Column({ type: "uuid" })
  mapelId!: string;

  @ManyToOne("MataPelajaranEntity", (mapel: MataPelajaranEntity) => mapel.jadwalPelajaranEntries, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "mapelId" })
  mapel!: MataPelajaranEntity;

  @Column({ type: "uuid" })
  guruId!: string;

  @ManyToOne("UserEntity", (user: UserEntity) => user.jadwalMengajar, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "guruId" })
  guru!: UserEntity;

  @Column({ type: "uuid" })
  ruanganId!: string;

  @ManyToOne("RuanganEntity", (ruangan: RuanganEntity) => ruangan.jadwalPelajaranEntries, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "ruanganId" })
  ruangan!: RuanganEntity;
  
  @Column({ type: "text", nullable: true })
  catatan?: string | null;

  @OneToMany("AbsensiSiswaEntity", (absensi: AbsensiSiswaEntity) => absensi.jadwalPelajaran)
  absensiSiswaEntries?: AbsensiSiswaEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
