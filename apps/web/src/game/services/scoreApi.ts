import { apiConfig } from '../../config/api';
import type {
  ApiErrorResponse,
  ApiScoreRecord,
  ApiSubmitResponse,
  ApiSubmitStatus,
  ApiTopResponse,
  FetchTopScoresResult,
  SubmitScoreResult,
} from '../types/api.types';

/**
 * HTTP client for the Dino Runner REST API.
 *
 * Design notes:
 *  - All public methods return a normalized discriminated-union result.
 *    Callers must branch on `kind` instead of catching exceptions.
 *  - `AbortController` enforces a timeout on every request so the UI never
 *    waits forever when the API is unreachable.
 *  - The raw `Response` is hidden from the UI layer to keep UI tests
 *    free of fetch plumbing.
 */
export interface ScoreApi {
  submitScore(nick: string, score: number): Promise<SubmitScoreResult>;
  fetchTopScores(limit?: number): Promise<FetchTopScoresResult>;
  getApiBaseUrl(): string;
}

interface HttpError {
  code: 'NETWORK' | 'TIMEOUT' | 'SERVER' | 'UNKNOWN';
  message: string;
}

const buildUrl = (path: string, query?: Record<string, string | number>): string => {
  const base = apiConfig.baseUrl.replace(/\/+$/, '');
  const url = new URL(`${base}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
};

const fetchWithTimeout = async (
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const toHttpError = (err: unknown): HttpError => {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return { code: 'TIMEOUT', message: 'The API request timed out.' };
  }
  if (err instanceof TypeError) {
    // fetch rejects with TypeError on network failure
    return { code: 'NETWORK', message: 'Unable to reach the API. Check your connection.' };
  }
  return {
    code: 'UNKNOWN',
    message: err instanceof Error ? err.message : 'Unexpected error contacting the API.',
  };
};

const isApiError = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.message === 'string' && typeof candidate.code === 'string';
};

const mapStatusToSubmitStatus = (apiMessage: string): ApiSubmitStatus => {
  const normalized = apiMessage.toLowerCase();
  if (normalized.includes('updated')) return 'updated';
  if (normalized.includes('greater or equal') || normalized.includes('no update')) return 'kept';
  return 'registered';
};

const parseErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const body = (await response.json()) as unknown;
    if (isApiError(body)) return body.message;
  } catch {
    /* ignore JSON parse errors */
  }
  return fallback;
};

export const createScoreApi = (): ScoreApi => ({
  getApiBaseUrl() {
    return apiConfig.baseUrl;
  },

  async submitScore(nick, score) {
    try {
      const response = await fetchWithTimeout(
        buildUrl(apiConfig.endpoints.submitScore),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nick, score }),
        },
        apiConfig.timeoutMs,
      );

      if (response.ok) {
        const body = (await response.json()) as ApiSubmitResponse;
        return {
          kind: 'success',
          status: mapStatusToSubmitStatus(body.message),
          record: body.data,
          message: body.message,
          source: 'api',
        };
      }

      if (response.status >= 400 && response.status < 500) {
        const message = await parseErrorMessage(response, 'Invalid request payload.');
        return { kind: 'error', code: 'VALIDATION', message };
      }

      const message = await parseErrorMessage(response, 'The API returned an unexpected error.');
      return { kind: 'error', code: 'SERVER', message };
    } catch (err) {
      const httpError = toHttpError(err);
      return { kind: 'error', code: httpError.code, message: httpError.message };
    }
  },

  async fetchTopScores(limit = 10) {
    try {
      const response = await fetchWithTimeout(
        buildUrl(apiConfig.endpoints.topScores, { limit }),
        { method: 'GET', headers: { Accept: 'application/json' } },
        apiConfig.timeoutMs,
      );

      if (!response.ok) {
        const message = await parseErrorMessage(response, 'Failed to load leaderboard.');
        return {
          kind: 'error',
          code: response.status >= 500 ? 'SERVER' : 'UNKNOWN',
          message,
        };
      }

      const body = (await response.json()) as ApiTopResponse;
      const entries: ApiScoreRecord[] = Array.isArray(body.data) ? body.data : [];
      return { kind: 'success', entries };
    } catch (err) {
      const httpError = toHttpError(err);
      return { kind: 'error', code: httpError.code, message: httpError.message };
    }
  },
});

export const scoreApi: ScoreApi = createScoreApi();
