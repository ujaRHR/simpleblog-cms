import { Sequelize } from "sequelize";

const { DB_TYPE, DB_HOST, DB_NAME, DB_USER, DB_PASS } = process.env;

if (!DB_TYPE || !DB_NAME || !DB_USER || !DB_PASS || !DB_HOST) {
  throw new Error("Missing database configuration");
}

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: DB_TYPE as
    | "mysql"
    | "postgres"
    | "sqlite"
    | "mariadb"
    | "mssql"
    | "db2"
    | "snowflake"
});

// Testing DB connection
// try {
//   await sequelize.authenticate();
//   console.log("DB connected successfully...");
// } catch (error) {
//   console.error("Unable to connect the DB: ", error);
// }
