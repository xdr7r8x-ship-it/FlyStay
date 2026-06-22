import { PrismaClient } from '@/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Lazy-load PrismaClient to avoid build-time errors when DATABASE_URL is not set
let _prisma: any = null;
let _dbReachable: boolean | null = null;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  if (!_prisma) {
    _prisma = createPrismaClient();
  }
  return _prisma;
}

// Check if database is reachable
export async function isDatabaseReachable(): Promise<boolean> {
  if (_dbReachable === false) {
    return false;
  }
  
  const prisma = getPrisma();
  if (!prisma) {
    _dbReachable = false;
    return false;
  }
  
  try {
    await prisma.$connect();
    _dbReachable = true;
    return true;
  } catch (error) {
    console.error('[DB] Database not reachable:', error);
    _dbReachable = false;
    return false;
  }
}

// For backward compatibility - returns null if DATABASE_URL is not set
export const prisma = getPrisma();

export default prisma;
