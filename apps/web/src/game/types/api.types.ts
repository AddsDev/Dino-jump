/**
 * DTOs that mirror the shape returned by the Dino Runner REST API.
 * Keep them in sync with apps/api/src/modules/scores/score.dto.ts.
 */

export interface ApiScoreRecord {
  nick: string;
  score: number;
}

export interface ApiScoreDetail extends ApiScoreRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiSubmitStatus = 'registered' | 'updated' | 'kept';

export interface ApiSubmitResponse {
  message: string;
  data: ApiScoreRecord;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, string[] | string>;
}

export interface ApiTopResponse {
  data: ApiScoreRecord[];
}

/**
 * Normalized submit result surfaced to the UI layer.
 * The UI should branch on `kind`, never on HTTP details.
 */
export type SubmitScoreResult =
  | {
      kind: 'success';
      status: ApiSubmitStatus;
      record: ApiScoreRecord;
      message: string;
      source: 'api';
    }
  | {
      kind: 'error';
      code: 'NETWORK' | 'TIMEOUT' | 'VALIDATION' | 'SERVER' | 'UNKNOWN';
      message: string;
    };

/**
 * Fetch failure reason returned by fetchTopScores.
 * `null` means a network/server failure, not an empty leaderboard.
 */
export type FetchTopScoresResult =
  | { kind: 'success'; entries: ApiScoreRecord[] }
  | { kind: 'error'; code: 'NETWORK' | 'TIMEOUT' | 'SERVER' | 'UNKNOWN'; message: string };
