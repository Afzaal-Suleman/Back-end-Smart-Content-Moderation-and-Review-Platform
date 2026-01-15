import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mydb' as string,
  process.env.DB_USER || 'postgres' as string,
  process.env.DB_PASSWORD || 'admin' as string,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected");
  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};

export default sequelize;
