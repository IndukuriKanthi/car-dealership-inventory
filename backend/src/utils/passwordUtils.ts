import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = (plaintext: string): Promise<string> =>
  bcrypt.hash(plaintext, SALT_ROUNDS);

export const verifyPassword = (plaintext: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plaintext, hash);
