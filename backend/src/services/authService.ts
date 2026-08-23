import userRepository from '../repositories/userRepository';
import { hashPassword, verifyPassword } from '../utils/passwordUtils';
import { signToken } from '../utils/jwtUtils';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput } from '../schemas/authSchemas';

const authService = {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError(409, 'This email address is already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return { user };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      // Use the same message for wrong email and wrong password to prevent
      // user enumeration attacks
      throw new AppError(401, 'Invalid email or password');
    }

    const passwordIsValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordIsValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = signToken({ userId: user.id, role: user.role });

    // Return safe user data — exclude passwordHash
    const { passwordHash: _omitted, ...safeUser } = user;
    return { token, user: safeUser };
  },
};

export default authService;
