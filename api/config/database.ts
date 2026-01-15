// config/database.js
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.DATABASE_URL || '');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
  } catch (err) {
    console.error('DB connection failed:', err);
  }
};

export default connectDB;
export { sequelize };
