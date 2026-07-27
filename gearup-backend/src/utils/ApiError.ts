import { z } from 'zod';

export class ApiError extends Error {
  public statusCode: number;
  public errorDetails: unknown;

  constructor(statusCode: number, message: string, errorDetails?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new ApiError(400, message, details);

export const unauthorized = (message = 'Unauthorized') =>
  new ApiError(401, message);

export const forbidden = (message = 'Forbidden') =>
  new ApiError(403, message);

export const notFound = (message = 'Resource not found') =>
  new ApiError(404, message);

export const conflict = (message: string, details?: unknown) =>
  new ApiError(409, message, details);

export const formatZodError = (err: z.ZodError) =>
  err.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }));
