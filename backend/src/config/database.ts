import { PrismaClient } from '@prisma/client';

// A single PrismaClient instance is reused across the application.
// Instantiating multiple clients wastes connection pool resources.
const prisma = new PrismaClient();

export default prisma;
