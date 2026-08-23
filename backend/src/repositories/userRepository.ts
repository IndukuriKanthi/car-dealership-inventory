import prisma from '../config/database';
import { Role } from '@prisma/client';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

// Fields safe to return to the client — passwordHash is always excluded
export const safeUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  findByEmailSafe: (email: string) =>
    prisma.user.findUnique({ where: { email }, select: safeUserFields }),

  create: (data: CreateUserData) =>
    prisma.user.create({ data, select: safeUserFields }),
};

export default userRepository;
