import { PrismaClient } from '@/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    // For build time or when DATABASE_URL is not set, return a mock client
    // This will be replaced at runtime with the real client
    // @ts-expect-error - intentionally using a placeholder for build time
    return {
      $connect: async () => {},
      $disconnect: async () => {},
    };
  }
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Only create real prisma client at runtime, not during build
const prismaInstance = globalForPrisma.prisma ?? (process.env.NODE_ENV === 'production' ? createPrismaClient() : undefined);

export const prisma = prismaInstance ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production' && prismaInstance) {
  globalForPrisma.prisma = prismaInstance;
}

export default prisma;
