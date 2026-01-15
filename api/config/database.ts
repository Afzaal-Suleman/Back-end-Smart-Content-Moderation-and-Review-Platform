import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "mydb",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "admin",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully");
  } catch (error: any) {
    console.error("⚠️ DB connection failed:", error.message);
  }
};

export default sequelize;
