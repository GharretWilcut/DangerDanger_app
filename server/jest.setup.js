
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { execSync } from "child_process";

// Create PG pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Prisma client WITH adapter (REQUIRED)
const prisma = new PrismaClient({
  adapter,
});

beforeAll(async () => {
  // Ensure schema is applied
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env },
  });

  await prisma.$connect();
});

beforeEach(async () => {
  // Truncate all public tables except Prisma internal ones
  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE '_prisma_%';
  `);

  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${tablename}" CASCADE;`
    );
  }
});

afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});

// Make prisma available in tests
global.prisma = prisma;
