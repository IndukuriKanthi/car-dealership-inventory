// Augment Express Request to carry the authenticated user payload.
// This is set by authenticateUser middleware after JWT verification.
declare namespace Express {
  interface Request {
    authenticatedUser?: {
      userId: string;
      role: import('@prisma/client').Role;
    };
  }
}
