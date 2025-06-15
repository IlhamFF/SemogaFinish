
import "reflect-metadata"; // Ensure this is the very first import
import { DataSource, type DataSourceOptions } from "typeorm";
import { UserEntity } from "@/entities/user.entity";
import { AccountEntity } from "@/entities/account.entity";
import { SessionEntity } from "@/entities/session.entity";
import { VerificationTokenEntity } from "@/entities/verification-token.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { SklEntity } from "@/entities/skl.entity";
import { CpEntity } from "@/entities/cp.entity";
import { MateriKategoriEntity } from "@/entities/materi-kategori.entity";
import { MateriAjarEntity } from "@/entities/materi-ajar.entity";
import { StrukturKurikulumEntity } from "@/entities/struktur-kurikulum.entity";


// Import other application-specific entities here as they are created
// e.g., import { KelasEntity } from "@/entities/kelas.entity";

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB || "educentral",
  synchronize: process.env.NODE_ENV === "development", // true for dev, false for prod (use migrations)
  logging: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  entities: [
    UserEntity,
    AccountEntity,
    SessionEntity,
    VerificationTokenEntity,
    MataPelajaranEntity,
    SklEntity,
    CpEntity,
    MateriKategoriEntity,
    MateriAjarEntity,
    StrukturKurikulumEntity,
    // Add other entities here:
    // KelasEntity,
  ],
  migrations: [], // Add path to migration files for production
  subscribers: [],
};

let AppDataSource: DataSource;


export async function getInitializedDataSource(): Promise<DataSource> {
  if (!AppDataSource || !AppDataSource.isInitialized) {
    const newDataSource = new DataSource(dataSourceOptions);
    try {
      await newDataSource.initialize();
      AppDataSource = newDataSource;
      console.log("DataSource has been initialized successfully.");
    } catch (err) {
      console.error("Error during DataSource initialization:", err);
      if (AppDataSource && AppDataSource.isInitialized) {
        console.warn("Using previously initialized AppDataSource despite new initialization attempt error.");
        return AppDataSource;
      }
      throw err; 
    }
  }
  return AppDataSource;
}
