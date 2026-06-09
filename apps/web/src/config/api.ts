import { env } from './env';

/**
 * API endpoint paths (relative to apiBaseUrl).
 */
export const apiEndpoints = {
  health: '/health',
  submitScore: '/api/scores',
  topScores: '/api/scores/top',
} as const;

export const apiConfig = {
  baseUrl: env.apiBaseUrl,
  timeoutMs: env.apiTimeoutMs,
  endpoints: apiEndpoints,
} as const;

export type ApiEndpoint = keyof typeof apiEndpoints;
