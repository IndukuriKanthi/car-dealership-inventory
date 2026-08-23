import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Returns a middleware that validates req.body against the given Zod schema.
// On failure it throws a ZodError, which the centralized error handler catches.
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}

// Validates req.query against the given Zod schema.
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.query = schema.parse(req.query);
    next();
  };
}
