import { Sequelize, Options, Dialect, ModelStatic } from "sequelize";
import process from "process";
import dbConfig from "../config/config";
import user from "./user";
import project from "./project";

interface ConfigInterface extends Options {
  use_env_variable?: string;
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
}

type Environment = "development" | "test" | "production";

const env = (process.env.NODE_ENV || "development") as Environment;

const config: ConfigInterface = dbConfig[env];

console.log({ config });

let sequelize: Sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable] as string,
    config,
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

/**
 * Add all model created to this object
 */
const models = { user, project };

type DB = { [key in keyof typeof models]: ModelStatic<any> };

export const db: DB = Object.values(models)
  /**
   * Initialize models
   */
  .map((model) => {
    if (typeof model.initialize === "function") {
      model.initialize(sequelize);
    }
    return model;
  })
  /**
   * Handle associations/relationships
   */
  .map((model) => {
    if (typeof model.associate === "function") {
      model.associate(sequelize);
    }
    return model;
  })
  .reduce((prev, curr) => {
    const tableName = curr.tableName as keyof typeof models;
    prev[tableName] = curr;
    return prev;
  }, {} as DB);

console.log({ db });
