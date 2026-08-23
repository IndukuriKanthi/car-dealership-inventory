// AppError is a known, intentional error with an HTTP status code.
// Throwing AppError signals "this is a business/validation error, not a bug".
// The centralized error handler checks instanceof AppError to decide
// whether to expose the message to the client.
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
    // Restore prototype chain — required when extending built-in classes in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
