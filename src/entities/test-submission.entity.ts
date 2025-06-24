
import "reflect-metadata"; // Ensure this is the very first import
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import type { UserEntity } from "./user.entity";
import type { TestEntity } from "./test.entity";

export type TestSubmissionStatus = "Berlangsung" | "Selesai" | "Dinilai";

@Entity({ name: "test_submissions" })
@Index(["siswaId", "testId"], { unique: true }) // Siswa hanya bisa submit satu kali per test
export class TestSubmissionEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  siswaId!: string;

  @ManyToOne("UserEntity", (user) => user.testSubmissions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "siswaId" })
  siswa!: UserEntity;

  @Column({ type: "uuid" })
  testId!: string;

  @ManyToOne("TestEntity", (test) => test.submissions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "testId" })
  test!: TestEntity;

  @Column({ type: "timestamp with time zone" })
  waktuMulai!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  waktuSelesai?: Date | null;

  @Column({ type: "jsonb", nullable: true }) // Untuk menyimpan jawaban siswa, misal: { "soal1": "A", "soal2": "C" }
  jawabanSiswa?: any;

  @Column({ type: "numeric", precision: 5, scale: 2, nullable: true })
  nilai?: number | null;

  @Column({ type: "text", nullable: true })
  catatanGuru?: string | null;

  @Column({
    type: "enum",
    enum: ["Berlangsung", "Selesai", "Dinilai"],
    default: "Berlangsung",
  })
  status!: TestSubmissionStatus;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
