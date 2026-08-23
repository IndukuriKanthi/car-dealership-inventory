import prisma from '../config/database';
import { CreateVehicleInput, UpdateVehicleInput, SearchQueryInput } from '../schemas/vehicleSchemas';
import { Prisma } from '@prisma/client';

const vehicleRepository = {
  findAll: () =>
    prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } }),

  findById: (id: string) =>
    prisma.vehicle.findUnique({ where: { id } }),

  create: (data: CreateVehicleInput) =>
    prisma.vehicle.create({ data: { ...data, price: new Prisma.Decimal(data.price) } }),

  update: (id: string, data: UpdateVehicleInput) =>
    prisma.vehicle.update({
      where: { id },
      data: data.price !== undefined ? { ...data, price: new Prisma.Decimal(data.price) } : data,
    }),

  delete: (id: string) =>
    prisma.vehicle.delete({ where: { id } }),

  search: (filters: SearchQueryInput) => {
    const where: Prisma.VehicleWhereInput = {};
    if (filters.make) where.make = { contains: filters.make, mode: 'insensitive' };
    if (filters.model) where.model = { contains: filters.model, mode: 'insensitive' };
    if (filters.category) where.category = { contains: filters.category, mode: 'insensitive' };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = new Prisma.Decimal(filters.minPrice);
      if (filters.maxPrice !== undefined) where.price.lte = new Prisma.Decimal(filters.maxPrice);
    }
    return prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  // Atomic decrement — only succeeds if quantity > 0, preventing negative stock
  // under concurrent requests. Returns the number of rows updated (0 = out of stock).
  decrementStock: async (id: string): Promise<number> => {
    const result = await prisma.$executeRaw`
      UPDATE "Vehicle" SET quantity = quantity - 1, "updatedAt" = NOW()
      WHERE id = ${id} AND quantity > 0
    `;
    return result;
  },

  // Atomic increment for restock
  incrementStock: async (id: string, amount: number): Promise<number> => {
    const result = await prisma.$executeRaw`
      UPDATE "Vehicle" SET quantity = quantity + ${amount}, "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    return result;
  },
};

export default vehicleRepository;
