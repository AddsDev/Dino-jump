import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors/AppError';
import { env } from '../../config/env';
import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const validation = new ValidationError('Invalid request payload', err.flatten().fieldErrors);
    res.status(validation.statusCode).json({
      message: validation.message,
      code: validation.code,
      details: validation.details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (env.NODE_ENV !== 'production') {
    console.error('Unhandled error:', err);
  }

  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};
