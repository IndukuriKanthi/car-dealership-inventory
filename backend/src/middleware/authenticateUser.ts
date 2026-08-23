import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { AppError } from '../utils/AppError';

export function authenticateUser(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication token is required'));
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    req.authenticatedUser = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired authentication token'));
  }
}
