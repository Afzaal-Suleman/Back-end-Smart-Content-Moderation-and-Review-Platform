import { ApolloServer } from '@apollo/server';
import { typeDefs } from './graphql/schema';
import resolvers from './graphql/resolvers';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

let server: ApolloServer | null = null;
let sequelize: any = null;

async function getServer() {
  if (!server) {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      csrfPrevention: false,
    });
  }
  return server;
}

async function getSequelize() {
  if (!sequelize) {
    const { Sequelize } = await import('sequelize');
    sequelize = new Sequelize(process.env.DATABASE_URL || '', {
      dialect: 'postgres',
      logging: false,
    });
    await sequelize.authenticate();
    console.log('✅ DB connected');
  }
  return sequelize;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
 const allowedOrigin = process.env.FRONTEND_URL || '*';
res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query, variables } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  const sequelize = await getSequelize();
  let user = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const User = (await import('./models/User')).default;
      user = await User.findByPk(decoded.id);
    } catch {
      console.log('⚠️ Invalid or expired token');
    }
  }

  const serverInstance = await getServer();
  try {
    const result = await serverInstance.executeOperation(
      { query, variables },
      { contextValue: { user, token, sequelize } }
    );
    res.status(200).json(result);
  } catch (err: any) {
    console.error('GraphQL execution error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
