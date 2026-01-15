import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import resolvers from './graphql/resolvers';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

// Minimal Hello World GraphQL schema
// const typeDefs = gql`
//   type Query {
//     hello: String
//   }
// `;

// const resolvers = {
//   Query: {
//     hello: () => "Hello World from GraphQL!",
//   },
// };

// Apollo Server instance (safe, no DB yet)
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  csrfPrevention: false,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');

  // Lazy DB connection (if needed)
  let sequelize: any = null;
  try {
    const { Sequelize } = await import('sequelize');
    sequelize = new Sequelize(
      process.env.DATABASE_URL || "",
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
        pool: { max: 5, min: 0, idle: 10000 },
      }
    );
    await sequelize.authenticate();
    console.log('✅ DB connected');
  } catch (err: any) {
    console.warn('⚠️ DB connection failed:', err.message);
    // continue, do NOT crash
  }

  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({
      kind: 'single',
      singleResult: {
        errors: [
          {
            message: 'GraphQL operations must contain a non-empty `query` or a `persistedQuery` extension.',
            code: 'BAD_REQUEST',
          },
        ],
      },
    });
  }

  // Decode JWT
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  let user = null;

  if (token && sequelize) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      // Lazy import model
      const UserModule = await import('./models/User');
      const User = UserModule.default;
      user = await User.findByPk(decoded.id).catch(() => null);
    } catch {
      console.log('Invalid or expired token');
    }
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
