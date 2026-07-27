import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gearup.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const adminName = process.env.ADMIN_NAME || 'GearUp Admin';

  // 1. Admin
  const hashed = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: Role.ADMIN,
    },
  });
  // eslint-disable-next-line no-console
  console.log(`Admin: ${admin.email} (password: ${adminPassword})`);

  // 2. Categories
  const categories = [
    { name: 'Cycling', slug: 'cycling' },
    { name: 'Camping', slug: 'camping' },
    { name: 'Water Sports', slug: 'water-sports' },
    { name: 'Hiking', slug: 'hiking' },
    { name: 'Winter Sports', slug: 'winter-sports' },
    { name: 'Fitness', slug: 'fitness' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  // eslint-disable-next-line no-console
  console.log(`Categories seeded: ${categories.length}`);

  // 3. Sample provider + customer
  const providerHash = await bcrypt.hash('Provider@123', 10);
  const customerHash = await bcrypt.hash('Customer@123', 10);
  const provider = await prisma.user.upsert({
    where: { email: 'provider@gearup.com' },
    update: {},
    create: {
      name: 'Adventure Gear Co.',
      email: 'provider@gearup.com',
      password: providerHash,
      role: Role.PROVIDER,
      phone: '+1-555-0100',
      address: '123 Mountain Rd',
    },
  });
  const customer = await prisma.user.upsert({
    where: { email: 'customer@gearup.com' },
    update: {},
    create: {
      name: 'John Customer',
      email: 'customer@gearup.com',
      password: customerHash,
      role: Role.CUSTOMER,
      phone: '+1-555-0200',
      address: '456 Forest Ave',
    },
  });
  // eslint-disable-next-line no-console
  console.log(`Sample provider: provider@gearup.com / Provider@123`);
  // eslint-disable-next-line no-console
  console.log(`Sample customer: customer@gearup.com / Customer@123`);

  // 4. Sample gear
  const cycling = await prisma.category.findUnique({ where: { slug: 'cycling' } });
  const camping = await prisma.category.findUnique({ where: { slug: 'camping' } });
  const hiking = await prisma.category.findUnique({ where: { slug: 'hiking' } });
  const fitness = await prisma.category.findUnique({ where: { slug: 'fitness' } });

  const sampleGear = [
    {
      name: 'Trekking Mountain Bike X1',
      description: 'High-performance mountain bike perfect for trails and rough terrain.',
      brand: 'TrekPro',
      pricePerDay: 25,
      stock: 10,
      images: ['https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800'],
      specifications: { gears: 21, wheelSize: '29"', weight: '13kg' },
      categoryId: cycling!.id,
    },
    {
      name: '4-Person Camping Tent',
      description: 'Waterproof dome tent ideal for family camping trips.',
      brand: 'OutdoorPlus',
      pricePerDay: 18,
      stock: 8,
      images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
      specifications: { capacity: '4 people', weight: '5kg', waterproof: true },
      categoryId: camping!.id,
    },
    {
      name: 'Hiking Backpack 65L',
      description: 'Large capacity hiking backpack with multiple compartments.',
      brand: 'TrekPro',
      pricePerDay: 12,
      stock: 15,
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
      specifications: { capacity: '65L', material: 'Nylon' },
      categoryId: hiking!.id,
    },
    {
      name: 'Adjustable Dumbbell Set',
      description: 'Space-saving adjustable dumbbell set 5-50 lbs.',
      brand: 'FitMax',
      pricePerDay: 10,
      stock: 6,
      images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'],
      specifications: { weightRange: '5-50 lbs', pieces: 2 },
      categoryId: fitness!.id,
    },
  ];

  for (const g of sampleGear) {
    const exists = await prisma.gearItem.findFirst({ where: { name: g.name } });
    if (!exists) {
      await prisma.gearItem.create({ data: { ...g, providerId: provider.id } });
    }
  }
  // eslint-disable-next-line no-console
  console.log(`Sample gear seeded: ${sampleGear.length} items`);

  // Avoid unused-var warning for customer
  void customer;
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
