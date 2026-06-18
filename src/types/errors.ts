/**
 * Error types and error handling utilities
 */

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

export class ValidationError extends AppError {
  constructor(
    public fieldErrors: Record<string, string[]>,
    message: string = 'Validation failed',
  ) {
    super('VALIDATION_ERROR', message, 400, { fieldErrors });
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super('AUTH_ERROR', message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super('AUTHZ_ERROR', message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(public retryAfter: number) {
    super('RATE_LIMIT', 'Too many requests', 429, { retryAfter });
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super('SERVER_ERROR', message, 500);
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Determine if error is an instance of our custom AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError('UNKNOWN_ERROR', error.message, 500, {
      originalError: error.name,
    });
  }

  return new AppError('UNKNOWN_ERROR', String(error), 500);
}
