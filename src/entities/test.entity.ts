
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import type { UserEntity } from "./user.entity";
import type { TestSubmissionEntity } from "./test-submission.entity";
import type { BankSoalTestEntity } from "./bank-soal-test.entity";

export type TestTipe = "Kuis" | "Ulangan Harian" | "UTS" | "UAS" | "Lainnya";
export type TestStatus = "Draf" | "Terjadwal" | "Berlangsung" | "Selesai" | "Dinilai";

@Entity({ name: "tests" })
export class TestEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  judul!: string;

  @Column({ type: "varchar", length: 255 }) // Nama mata pelajaran
  mapel!: string;

  @Column({ type: "varchar", length: 255 }) // Bisa "Semua Kelas X", "X IPA 1, X IPA 2"
  kelas!: string;

  @Column({ type: "timestamp with time zone" })
  tanggal!: Date; // Tanggal dan waktu pelaksanaan

  @Column({ type: "int" }) // Durasi dalam menit
  durasi!: number;

  @Column({
    type: "enum",
    enum: ["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"],
  })
  tipe!: TestTipe;

  @Column({
    type: "enum",
    enum: ["Draf", "Terjadwal", "Berlangsung", "Selesai", "Dinilai"],
    default: "Draf",
  })
  status!: TestStatus;

  @Column({ type: "text", nullable: true })
  deskripsi?: string | null;

  @Column({ type: "uuid" })
  uploaderId!: string;

  @ManyToOne("UserEntity", (user: UserEntity) => user.testUploaded, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "uploaderId" })
  uploader!: UserEntity;
  
  @OneToMany("TestSubmissionEntity", (submission: TestSubmissionEntity) => submission.test)
  submissions?: TestSubmissionEntity[];

  @OneToMany("BankSoalTestEntity", (bankSoalTest) => bankSoalTest.test)
  bankSoalTest?: BankSoalTestEntity[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
