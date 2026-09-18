import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });
config();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prismaClient =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

export const prisma = prismaClient;

export * from "@prisma/client";

