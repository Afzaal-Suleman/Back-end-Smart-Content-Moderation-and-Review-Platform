import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@apollo/server/next';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import resolvers from './graphql/resolvers';
import { connectDB } from './config/database';
import sequelize from './config/database';
import jwt from 'jsonwebtoken';
import User from './models/User';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

// Connect to database
connectDB();

async function initDB() {
  await sequelize.sync();
  console.log('All models synchronized successfully.');
}

initDB().catch((err) => console.error('DB sync error:', err));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        path: error.path,
        locations: error.locations,
      }),
    };
  },
  introspection: process.env.NODE_ENV !== 'production',
  csrfPrevention: false,
});

// Serverless handler for Vercel
export default startServerAndCreateNextHandler(server, {
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) return {};

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      return { user, token };
    } catch (err) {
      console.log('Invalid or expired token');
      return {};
    }
  },
});
