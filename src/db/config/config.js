"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
require("dotenv/config");
var config = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_DATABASE,
    host: process.env.DEV_DB_HOST,
    port: Number(process.env.DEV_DB_PORT),
    dialect: process.env.DEV_DB_DIALECT,
    dialectModule: pg_1.default,
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_DATABASE,
    host: process.env.TEST_DB_HOST,
    port: Number(process.env.TEST_DB_PORT),
    dialect: process.env.TEST_DB_DIALECT,
    dialectModule: pg_1.default,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT,
    dialectModule: pg_1.default,
  },
};
exports.default = config;
