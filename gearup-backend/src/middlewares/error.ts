import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

import { ZodError } from 'zod';
import { formatZodError } from '../utils/ApiError';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorDetails: err.errorDetails,
    });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errorDetails: formatZodError(err),
    });
    return;
  }
  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error('[UNHANDLED ERROR]', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
      errorDetails: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    return;
  }
  res.status(500).json({
    success: false,
    message: 'Unknown error',
  });
};
