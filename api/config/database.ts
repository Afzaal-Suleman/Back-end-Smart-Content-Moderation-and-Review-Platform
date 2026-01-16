// config/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// IMPORTANT: Force load pg module before Sequelize
import 'pg';
import 'pg-hstore';

// Validate DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not defined');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('DATABASE')));
}

// Create Sequelize instance with explicit PostgreSQL config
const sequelize = new Sequelize(databaseUrl!, {
  dialect: 'postgres', // Explicitly set dialect
  logging: console.log, // Enable logging to see connection attempts
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  retry: {
    max: 3,
    timeout: 5000
  }
});

// Test connection immediately
sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL connection established'))
  .catch(err => console.error('❌ PostgreSQL connection error:', err));

export { sequelize };