import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from "typeorm";
import { UserEntity } from "./user.entity";
import { MataPelajaranEntity } from "./mata-pelajaran.entity";

export type SemesterTypeEntity = "Ganjil" | "Genap";

@Entity({ name: "nilai_semester_siswa" })
@Unique(["siswaId", "mapelId", "kelasId", "semester", "tahunAjaran"])
export class NilaiSemesterSiswaEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  siswaId!: string;

  @ManyToOne(() => UserEntity, (user) => user.nilaiSemesterSiswa, { onDelete: "CASCADE" })
  @JoinColumn({ name: "siswaId" })
  siswa!: UserEntity;

  @Column({ type: "uuid" })
  mapelId!: string;

  @ManyToOne(() => MataPelajaranEntity, (mapel) => mapel.nilaiSemesterSiswaEntries, { onDelete: "CASCADE" })
  @JoinColumn({ name: "mapelId" })
  mapel!: MataPelajaranEntity;

  @Column({ type: "varchar", length: 100 }) // Kelas saat nilai diinput, misal "X IPA 1"
  kelasId!: string;

  @Column({ type: "enum", enum: ["Ganjil", "Genap"] })
  semester!: SemesterTypeEntity;

  @Column({ type: "varchar", length: 10 }) // Format: "2023/2024"
  tahunAjaran!: string;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  nilaiTugas?: number | null;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  nilaiUTS?: number | null;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  nilaiUAS?: number | null;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  nilaiHarian?: number | null; // Bisa jadi rata-rata dari beberapa nilai harian

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  nilaiAkhir?: number | null; // Bisa dihitung atau diinput manual

  @Column({ type: "varchar", length: 5, nullable: true }) // Misal: A, B+, C
  predikat?: string | null;

  @Column({ type: "text", nullable: true })
  catatanGuru?: string | null;

  @Column({ type: "uuid" })
  dicatatOlehGuruId!: string; // Guru yang menginput/bertanggung jawab atas nilai ini

  @ManyToOne(() => UserEntity, (guru) => guru.nilaiDicatatOlehGuru, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "dicatatOlehGuruId" })
  dicatatOlehGuru?: UserEntity;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
