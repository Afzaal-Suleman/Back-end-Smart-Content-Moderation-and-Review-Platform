import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import jwt from "jsonwebtoken";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { typeDefs } from "./graphql/schema.js";
import resolvers from "./graphql/resolvers/index.js";
import { sequelize } from "./config/database.js";
import User from "./models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  csrfPrevention: false,
});

let serverStarted = false;
async function ensureStarted() {
  if (!serverStarted) {
    await server.start();
    serverStarted = true;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://smart-content-moderation-and-review.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, variables } = req.body || {};

  if (!query) {
    return res
      .status(400)
      .json({ errors: [{ message: "No GraphQL query provided" }] });
  }

  // ✅ DB connection
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (err: any) {
    console.error("❌ DB connection failed:", err.message);
    return res.status(500).json({ error: "Database connection failed" });
  }

  // ✅ JWT parsing
  let user = null;
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      user = await User.findByPk(decoded.id).catch(() => null);
    } catch {
      console.log("⚠️ Invalid token");
    }
  }

  try {
    await ensureStarted();

    const result: any = await server.executeOperation(
      { query, variables },
      {
        contextValue: {
          user,
          token,
          sequelize,
        },
      }
    );

    // ✅ Normalize Apollo response
    if (result.body?.singleResult) {
      return res.status(200).json(result.body.singleResult);
    }

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ GraphQL execution error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
