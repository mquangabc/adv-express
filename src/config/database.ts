import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const config = {
  client: "postgresql",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "minhquang",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "demo",
  },
  migrations: {
    directory: "./src/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./src/seeds",
  },
  pool: {
    min: 2,
    max: 10,
  },
};

export const db = knex(config);

export const initDatabase = async (): Promise<void> => {
  try {
    // Test the connection
    await db.raw("SELECT 1");
    console.log("✅ Database connected successfully");

    // Run migrations
    await db.migrate.latest();
    console.log("✅ Database migrations completed");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

export default db;
