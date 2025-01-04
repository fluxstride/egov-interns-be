import { Dialect } from "sequelize";
import pg from "pg";
import "dotenv/config";

interface DbConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
  dialectModule: any;
}

type Environment = "development" | "test" | "production";

type Config = {
  [key in Environment]: DbConfig;
};

var config: Config = {
  development: {
    username: process.env.DEV_DB_USERNAME as string,
    password: process.env.DEV_DB_PASSWORD as string,
    database: process.env.DEV_DB_DATABASE as string,
    host: process.env.DEV_DB_HOST as string,
    port: Number(process.env.DEV_DB_PORT),
    dialect: process.env.DEV_DB_DIALECT as Dialect,
    dialectModule: pg,
  },
  test: {
    username: process.env.TEST_DB_USERNAME as string,
    password: process.env.TEST_DB_PASSWORD as string,
    database: process.env.TEST_DB_DATABASE as string,
    host: process.env.TEST_DB_HOST as string,
    port: Number(process.env.TEST_DB_PORT),
    dialect: process.env.TEST_DB_DIALECT as Dialect,
    dialectModule: pg,
  },

  production: {
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT as Dialect,
    dialectModule: pg,
  },
};

export default config;
