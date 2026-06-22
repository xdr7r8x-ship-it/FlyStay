import { PrismaClient } from '../src/generated/prisma';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@flystay.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Password123!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`Created admin user: ${admin.email} (Role: ${admin.role})`);
}

main()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
