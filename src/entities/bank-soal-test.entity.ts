
import "reflect-metadata";
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import type { TestEntity } from "./test.entity";
import type { SoalEntity } from "./soal.entity";

@Entity({ name: "bank_soal_test" })
export class BankSoalTestEntity {
  @PrimaryColumn({ type: "uuid" })
  testId!: string;

  @PrimaryColumn({ type: "uuid" })
  soalId!: string;

  @ManyToOne("TestEntity", (test: TestEntity) => test.bankSoalTest, { onDelete: "CASCADE" })
  @JoinColumn({ name: "testId" })
  test!: TestEntity;

  @ManyToOne("SoalEntity", (soal: SoalEntity) => soal.bankSoalTest, { onDelete: "CASCADE" })
  @JoinColumn({ name: "soalId" })
  soal!: SoalEntity;
}
