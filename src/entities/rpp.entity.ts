import "reflect-metadata"; 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import type { MataPelajaranEntity } from "./mata-pelajaran.entity";
import type { UserEntity } from "./user.entity";

@Entity({ name: "rpp" }) 
export class RppEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  judul!: string;

  @Column({ type: "uuid" })
  mapelId!: string;

  @ManyToOne(() => MataPelajaranEntity, (mapel) => mapel.rppList, { onDelete: "CASCADE" })
  @JoinColumn({ name: "mapelId" })
  mapel!: MataPelajaranEntity;

  @Column({ type: "varchar", length: 100 })
  kelas!: string;

  @Column({ type: "int" })
  pertemuanKe!: number;

  @Column({ type: "text", nullable: true })
  materiPokok?: string | null;

  @Column({ type: "text", nullable: true })
  kegiatanPembelajaran?: string | null;

  @Column({ type: "text", nullable: true })
  penilaian?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  namaFileOriginal?: string | null;

  @Column({ type: "varchar", length: 500, nullable: true }) 
  fileUrl?: string | null;

  @Column({ type: "uuid" })
  uploaderId!: string;

  @ManyToOne(() => UserEntity, (user) => user.rppUploaded, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "uploaderId" })
  uploader?: UserEntity | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
