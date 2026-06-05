import { z } from 'zod';

export const createScoreSchema = z.object({
  nick: z
    .string({ required_error: 'Nick is required' })
    .trim()
    .min(3, 'Nick must be at least 3 characters long')
    .max(30, 'Nick must be at most 30 characters long'),
  score: z
    .number({ required_error: 'Score is required', invalid_type_error: 'Score must be a number' })
    .int('Score must be an integer')
    .min(0, 'Score must be greater than or equal to 0'),
});

export type CreateScoreInput = z.infer<typeof createScoreSchema>;

export const topQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? 10 : Number(val)))
    .refine((n) => Number.isInteger(n) && n > 0 && n <= 100, {
      message: 'Limit must be an integer between 1 and 100',
    }),
});

export type TopQuery = z.infer<typeof topQuerySchema>;

export const nickParamSchema = z.object({
  nick: z
    .string()
    .min(3, 'Nick must be at least 3 characters long')
    .max(30, 'Nick must be at most 30 characters long'),
});

export type NickParam = z.infer<typeof nickParamSchema>;
