import { ApolloServer } from "@apollo/server";
import jwt from "jsonwebtoken";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";
import { typeDefs } from "./graphql/schema.js";
import resolvers from "./graphql/resolvers/index.js";
import { sequelize } from "./config/database.js"; // use instance, not function

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  csrfPrevention: false,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();

  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({
      errors: [{ message: "No query provided", code: "BAD_REQUEST" }],
    });
  }

  // Lazy DB connection
  try {
    await sequelize.authenticate();
    console.log("DB connected");
  } catch (err: any) {
    console.error("DB connection failed:", err.message);
    return res.status(500).json({ error: "Database connection failed" });
  }

  // JWT
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  let user = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { default: User } = await import("./models/User.js");
      user = await User.findByPk(decoded.id).catch(() => null);
    } catch {
      console.log("Invalid or expired token");
    }
  }

  try {
    const result: any = await server.executeOperation(
      { query, variables },
      { contextValue: { user, token, sequelize } }
    );
    res.status(200).json(result.body.singleResult);
  } catch (err: any) {
    console.error("GraphQL execution error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
