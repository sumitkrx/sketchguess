import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg(new Pool({ connectionString }));

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export const prisma = new PrismaClient({ adapter });
