import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'hrq@hotmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Production enforcement: require ADMIN_PASSWORD
  if (process.env.NODE_ENV === 'production' && !adminPassword) {
    throw new Error('ADMIN_PASSWORD_REQUIRED: ADMIN_PASSWORD environment variable must be set in production');
  }

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD_REQUIRED: ADMIN_PASSWORD environment variable must be set');
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  if (existingAdmin) {
    // Update existing admin with new password
    const updatedAdmin = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        passwordHash,
        role: 'ADMIN',
        email: adminEmail,
      },
    });
    console.log(`Updated admin user: ${updatedAdmin.email} (Role: ${updatedAdmin.role})`);
    return;
  }

  // Create new admin
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
    console.error('Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
