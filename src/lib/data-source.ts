
import "reflect-metadata"; // Ensure this is the very first import
import { DataSource, type DataSourceOptions } from "typeorm";
import { UserEntity } from "@/entities/user.entity";
import { AccountEntity } from "@/entities/account.entity";
import { SessionEntity } from "@/entities/session.entity";
import { VerificationTokenEntity } from "@/entities/verification-token.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";

// Import other application-specific entities here as they are created
// e.g., import { KelasEntity } from "@/entities/kelas.entity";

const dataSourceOptions: DataSourceOptions = {
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
    // Add other entities here:
    // KelasEntity,
  ],
  migrations: [], // Add path to migration files for production
  subscribers: [],
};

export const AppDataSource = new DataSource(dataSourceOptions);

// Initialize DataSource
// It's often better to initialize it once and export the initialized instance
// or handle initialization carefully at the application's entry point.
// For Next.js API routes, you might need to ensure it's initialized before use.

let _isDataSourceInitialized = false; 

export async function getInitializedDataSource(): Promise<DataSource> {
  if (!AppDataSource.isInitialized && !_isDataSourceInitialized) { 
    try {
      await AppDataSource.initialize();
      _isDataSourceInitialized = true; 
      console.log("DataSource has been initialized successfully.");
    } catch (err) {
      console.error("Error during DataSource initialization:", err);
      throw err; // Re-throw error to handle it further up the call stack if needed
    }
  }
  return AppDataSource;
}
