import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { RegisterInput, LoginInput } from '../schemas/authSchemas';

const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body as RegisterInput);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body as LoginInput);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
