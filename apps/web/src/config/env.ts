/**
 * Application configuration resolved from Vite environment variables.
 *
 * Vite exposes only variables prefixed with `VITE_` to the client bundle.
 * Defaults are provided so the app boots cleanly in `vite dev` without a
 * .env file.
 */

const DEFAULT_API_BASE_URL = 'http://localhost:3001';
const DEFAULT_API_TIMEOUT_MS = 5000;

interface AppEnv {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  isDev: boolean;
  isProd: boolean;
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const rawTimeout = import.meta.env.VITE_API_TIMEOUT_MS as string | undefined;

const apiBaseUrl = (rawBaseUrl && rawBaseUrl.length > 0)
  ? rawBaseUrl.replace(/\/+$/, '')
  : DEFAULT_API_BASE_URL;

const apiTimeoutMs = (() => {
  if (!rawTimeout) return DEFAULT_API_TIMEOUT_MS;
  const parsed = Number(rawTimeout);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_API_TIMEOUT_MS;
})();

export const env: AppEnv = {
  apiBaseUrl,
  apiTimeoutMs,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
