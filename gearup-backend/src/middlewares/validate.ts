import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { badRequest, formatZodError } from '../utils/ApiError';

type Source = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, source: Source = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      // Replace with parsed (and coerced) data
      (req as unknown as Record<Source, unknown>)[source] = parsed;
      next();
    } catch (err) {
      if (err && typeof err === 'object' && 'issues' in err) {
        next(badRequest('Validation failed', formatZodError(err as never)));
        return;
      }
      next(err);
    }
  };
