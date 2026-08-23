import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Must be used after authenticateUser — relies on req.authenticatedUser being set
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.authenticatedUser?.role !== 'ADMIN') {
    return next(new AppError(403, 'Admin access required'));
  }
  next();
}
