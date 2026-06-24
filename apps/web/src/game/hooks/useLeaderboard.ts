import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiScoreRecord } from '../types/api.types';
import { scoreApi } from '../services/scoreApi';
import { localScoreStorage } from '../storage/localScoreStorage';
import type { ScoreRecord } from '../types/game.types';

export type LeaderboardSource = 'api' | 'local' | 'none';

export interface UseLeaderboardResult {
  entries: ApiScoreRecord[];
  source: LeaderboardSource;
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
}

const mapLocalToApi = (local: ScoreRecord[]): ApiScoreRecord[] =>
  local.map(({ nick, score }) => ({ nick, score }));

/**
 * Loads the leaderboard from the API and falls back to localStorage
 * when the API is unreachable. The returned `source` lets the UI
 * render a "Global" or "Local (offline)" badge.
 */
export const useLeaderboard = (limit = 10): UseLeaderboardResult => {
  const [entries, setEntries] = useState<ApiScoreRecord[]>([]);
  const [source, setSource] = useState<LeaderboardSource>('none');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await scoreApi.fetchTopScores(limit);

    if (!mounted.current) return;

    if (result.kind === 'success') {
      setEntries(result.entries);
      setSource('api');
      setIsLoading(false);
      return;
    }

    const local = mapLocalToApi(localScoreStorage.getScores().slice(0, limit));
    setEntries(local);
    setSource(local.length > 0 ? 'local' : 'none');
    setErrorMessage(result.message);
    setIsLoading(false);
  }, [limit]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { entries, source, isLoading, errorMessage, refresh: load };
};
