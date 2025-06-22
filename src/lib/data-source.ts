
import "reflect-metadata";
import { DataSource, type DataSourceOptions } from "typeorm";
import { UserEntity } from "@/entities/user.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { SklEntity } from "@/entities/skl.entity";
import { CpEntity } from "@/entities/cp.entity";
import { MateriKategoriEntity } from "@/entities/materi-kategori.entity";
import { MateriAjarEntity } from "@/entities/materi-ajar.entity";
import { StrukturKurikulumEntity } from "@/entities/struktur-kurikulum.entity";
import { SilabusEntity } from "@/entities/silabus.entity";
import { RppEntity } from "@/entities/rpp.entity";
import { RuanganEntity } from "@/entities/ruangan.entity";
import { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import { TugasEntity } from "@/entities/tugas.entity";
import { TestEntity } from "@/entities/test.entity";
import { TugasSubmissionEntity } from "@/entities/tugas-submission.entity";
import { TestSubmissionEntity } from "@/entities/test-submission.entity";
import { AbsensiSiswaEntity } from "@/entities/absensi-siswa.entity";
import { NilaiSemesterSiswaEntity } from "@/entities/nilai-semester-siswa.entity";

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB || "educentral",
  // In development, `synchronize: true` automatically creates the database schema on every connection.
  // This should be `false` in production to prevent accidental data loss. Use migrations instead.
  synchronize: process.env.NODE_ENV === "development", 
  // Logs all SQL queries in development, but only errors in production.
  logging: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  entities: [
    UserEntity,
    MataPelajaranEntity,
    SklEntity,
    CpEntity,
    MateriKategoriEntity,
    MateriAjarEntity,
    StrukturKurikulumEntity,
    SilabusEntity,
    RppEntity,
    RuanganEntity,
    SlotWaktuEntity,
    JadwalPelajaranEntity,
    TugasEntity,
    TugasSubmissionEntity,
    TestEntity,
    TestSubmissionEntity,
    AbsensiSiswaEntity,
    NilaiSemesterSiswaEntity,
  ],
  migrations: [], 
  subscribers: [],
};

// Singleton instance of the DataSource.
let AppDataSource: DataSource | undefined = undefined;

/**
 * Initializes and returns a singleton instance of the TypeORM DataSource.
 * If already initialized, it returns the existing instance.
 * @returns A promise that resolves to the initialized DataSource.
 */
export async function getInitializedDataSource(): Promise<DataSource> {
  // If already initialized and connected, return it.
  if (AppDataSource && AppDataSource.isInitialized) {
    return AppDataSource;
  }

  const newDataSource = new DataSource(dataSourceOptions);
  try {
    console.log("Attempting to initialize DataSource...");
    await newDataSource.initialize();
    AppDataSource = newDataSource;
    console.log("DataSource has been initialized successfully.");
    return AppDataSource;
  } catch (err) {
    console.error("Error during DataSource initialization:", err);
    AppDataSource = undefined; 
    throw err;
  }
}
