import { ApolloServer } from '@apollo/server';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import resolvers from './graphql/resolvers';
import { Sequelize } from 'sequelize';
import jwt from 'jsonwebtoken';
import User from './models/User';
import type { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

// Initialize Sequelize without connecting yet
const sequelize = new Sequelize(
  process.env.DB_NAME || 'mydb',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
    pool: { max: 5, min: 0, idle: 10000 },
  }
);

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  csrfPrevention: false,
  formatError: (error) => ({
    message: error.message,
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
  }),
});

// Serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Attempt DB connection inside the handler
  try {
    await sequelize.authenticate();
    console.log('DB connected');
  } catch (err: any) {
    console.warn('DB connection failed:', err.message);
    // do NOT crash the serverless function
  }

  // Decode JWT
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  let user = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      user = await User.findByPk(decoded.id).catch(() => null);
    } catch {
      console.log('Invalid or expired token');
    }
  }

  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({
      kind: 'single',
      singleResult: {
        errors: [
          {
            message:
              'GraphQL operations must contain a non-empty `query` or a `persistedQuery` extension.',
            code: 'BAD_REQUEST',
          },
        ],
      },
    });
  }

  try {
    const result = await server.executeOperation(
      { query, variables },
      { contextValue: { user, token, sequelize } }
    );
    res.status(200).json(result);
  } catch (err: any) {
    console.error('GraphQL execution error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
