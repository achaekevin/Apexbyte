import prisma from '../src/config/database';
import { UserRole } from '@prisma/client';
import { hashPassword } from '../src/utils/helpers';

async function main() {
  console.log('Ensuring owner and admin accounts exist with SUPER_ADMIN privileges...');
  const adminPasswordPlain = process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Admin@12345';
  const hashedPassword = await hashPassword(adminPasswordPlain);

  // 1. Owner account: achaekevin@gmail.com
  const ownerEmail = process.env.OWNER_EMAIL || 'achaekevin@gmail.com';
  const existingOwner = await prisma.user.findUnique({ where: { email: ownerEmail } });

  if (existingOwner) {
    await prisma.user.update({
      where: { email: ownerEmail },
      data: {
        role: UserRole.SUPER_ADMIN,
        isVerified: true,
      },
    });
    console.log(`✅ Updated ${ownerEmail} to SUPER_ADMIN!`);
  } else {
    await prisma.user.create({
      data: {
        email: ownerEmail,
        password: hashedPassword,
        firstName: 'Kevin',
        lastName: 'Achae',
        role: UserRole.SUPER_ADMIN,
        isVerified: true,
      },
    });
    console.log(`✅ Created owner account ${ownerEmail} with SUPER_ADMIN role!`);
  }

  // 2. Default admin account: admin@laptopstore.com
  const defaultAdmin = process.env.ADMIN_EMAIL || 'admin@laptopstore.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: defaultAdmin } });
  if (existingAdmin) {
    await prisma.user.update({
      where: { email: defaultAdmin },
      data: {
        role: UserRole.SUPER_ADMIN,
        isVerified: true,
      },
    });
    console.log(`✅ Confirmed ${defaultAdmin} as SUPER_ADMIN!`);
  } else {
    await prisma.user.create({
      data: {
        email: defaultAdmin,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.SUPER_ADMIN,
        isVerified: true,
      },
    });
    console.log(`✅ Created ${defaultAdmin} with SUPER_ADMIN role!`);
  }
}

main()
  .then(() => {
    console.log('Admin verification completed successfully.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error ensuring admin:', e);
    process.exit(1);
  });
