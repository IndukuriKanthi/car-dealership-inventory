import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Seed credentials are for local development only.
// Never use these passwords in production.
// Change all credentials before any real deployment.
const BCRYPT_ROUNDS = 10;

async function main() {
  // ------------------------------------------------------------------
  // Users
  // ------------------------------------------------------------------
  const adminPasswordHash = await bcrypt.hash('Admin@1234', BCRYPT_ROUNDS);
  const userPasswordHash = await bcrypt.hash('User@1234', BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dealership.dev' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@dealership.dev',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@dealership.dev' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@dealership.dev',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  });

  // ------------------------------------------------------------------
  // Vehicles — varied makes, categories, and price ranges
  // ------------------------------------------------------------------
  const vehicles = [
    { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 26000, quantity: 8 },
    { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 32000, quantity: 5 },
    { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 12 },
    { make: 'Honda', model: 'CR-V', category: 'SUV', price: 34000, quantity: 3 },
    { make: 'Ford', model: 'F-150', category: 'Truck', price: 45000, quantity: 6 },
    { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 55000, quantity: 2 },
    { make: 'Chevrolet', model: 'Silverado', category: 'Truck', price: 42000, quantity: 4 },
    { make: 'BMW', model: '3 Series', category: 'Sedan', price: 48000, quantity: 1 },
    { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 42000, quantity: 7 },
    // Intentionally zero stock — frontend must show "Out of Stock"
    { make: 'Porsche', model: 'Cayenne', category: 'SUV', price: 85000, quantity: 0 },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({ data: vehicle });
  }

  // eslint-disable-next-line no-console
  console.log(`Seed complete.`);
  // eslint-disable-next-line no-console
  console.log(`  Admin : ${admin.email}  (password: Admin@1234)`);
  // eslint-disable-next-line no-console
  console.log(`  User  : ${normalUser.email}  (password: User@1234)`);
  // eslint-disable-next-line no-console
  console.log(`  Vehicles created: ${vehicles.length}`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
