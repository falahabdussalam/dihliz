import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !["postgres:", "postgresql:"].includes(new URL(connectionString).protocol)) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL.");
  }
  const databaseUrl = new URL(connectionString);
  // Preserve full certificate verification when pg changes its SSL aliases.
  if (["prefer", "require", "verify-ca"].includes(databaseUrl.searchParams.get("sslmode") ?? "")) {
    databaseUrl.searchParams.set("sslmode", "verify-full");
  }
  const adapter = new PrismaPg({
    connectionString: databaseUrl.toString(),
    max: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 5),
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
  });
  return new PrismaClient({ adapter });
}
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
