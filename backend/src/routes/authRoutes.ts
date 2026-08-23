import { Router } from 'express';
import authController from '../controllers/authController';
import { validateBody } from '../middleware/validateRequest';
import { registerSchema, loginSchema } from '../schemas/authSchemas';

const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), authController.register);
authRoutes.post('/login', validateBody(loginSchema), authController.login);

export default authRoutes;
