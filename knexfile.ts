import { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
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
  },
  production: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: "./dist/migrations",
      extension: "js",
    },
    seeds: {
      directory: "./dist/seeds",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

module.exports = config;
