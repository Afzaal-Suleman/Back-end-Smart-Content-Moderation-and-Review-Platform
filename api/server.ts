// api/server.ts
import { ApolloServer } from '@apollo/server';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import resolvers from './graphql/resolvers';
import { connectDB } from './config/database';
import sequelize from './config/database';
import jwt from 'jsonwebtoken';
import User from './models/User';
import type { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

// Connect to database
connectDB();

// Optional: sync DB manually (avoid in serverless)
sequelize.sync().catch((err) => console.error('DB sync error:', err));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  csrfPrevention: false,
  formatError: (error) => ({
    message: error.message,
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
  }),
});

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { query, variables } = req.body;

  // Decode JWT
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  let user = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      user = await User.findByPk(decoded.id);
    } catch (err) {
      console.log('Invalid or expired token');
    }
  }

  try {
    const result = await server.executeOperation(
      {
        query,
        variables,
      },
      {
        contextValue: { user, token },
      }
    );

    res.status(200).json(result);
  } catch (err: any) {
    console.error('GraphQL execution error:', err);
    res.status(500).json({ error: err.message });
  }
}
