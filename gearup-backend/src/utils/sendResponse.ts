import { Response } from 'express';

interface SuccessOptions<T> {
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const sendSuccess = <T>(
  res: Response,
  { statusCode = 200, message = 'Success', data, meta }: SuccessOptions<T>
) => {
  const body: Record<string, unknown> = { success: true, message };
  if (data !== undefined) body.data = data;
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
};
