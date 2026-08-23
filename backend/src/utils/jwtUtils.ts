import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: Role;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
};

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, getSecret(), { expiresIn: '24h' });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, getSecret()) as JwtPayload;
