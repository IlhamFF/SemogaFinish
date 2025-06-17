
import "reflect-metadata"; // Ensure this is the very first import
import { DataSource, type DataSourceOptions } from "typeorm";
import { UserEntity } from "@/entities/user.entity";
// Entitas AccountEntity, SessionEntity, dan VerificationTokenEntity tidak lagi diimpor
// karena sudah tidak digunakan setelah penghapusan NextAuth.js
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

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB || "educentral",
  synchronize: process.env.NODE_ENV === "development", 
  logging: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  entities: [
    UserEntity,
    // AccountEntity, // REMOVED - No longer used
    // SessionEntity, // REMOVED - No longer used
    // VerificationTokenEntity, // REMOVED - No longer used
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
    TestEntity,
  ],
  migrations: [], 
  subscribers: [],
};

let AppDataSource: DataSource | undefined = undefined;

export async function getInitializedDataSource(): Promise<DataSource> {
  // If already initialized and connected, return it.
  if (AppDataSource && AppDataSource.isInitialized) {
    return AppDataSource;
  }

  // If AppDataSource exists but is not initialized (e.g., previous attempt failed)
  // or if it doesn't exist, create a new instance.
  const newDataSource = new DataSource(dataSourceOptions);
  try {
    console.log("Attempting to initialize DataSource...");
    await newDataSource.initialize();
    AppDataSource = newDataSource; // Assign to global AppDataSource only after successful initialization
    console.log("DataSource has been initialized successfully.");
    return AppDataSource;
  } catch (err) {
    console.error("Error during DataSource initialization:", err);
    // If initialization fails, ensure AppDataSource is reset so subsequent calls try fresh.
    AppDataSource = undefined; 
    throw err; // Re-throw the error to be handled by the caller.
  }
}

