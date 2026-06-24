import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useLeaderboard } from '../../game/hooks/useLeaderboard';
import * as scoreApiModule from '../../game/services/scoreApi';
import type { FetchTopScoresResult } from '../../game/types/api.types';

const success = (entries: { nick: string; score: number }[] = []): FetchTopScoresResult => ({
  kind: 'success',
  entries,
});

const failure = (code: 'NETWORK' | 'TIMEOUT' | 'SERVER' | 'UNKNOWN' = 'NETWORK', message = 'fail'): FetchTopScoresResult => ({
  kind: 'error',
  code,
  message,
});

describe('useLeaderboard hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns API entries and source=api on success', async () => {
    vi.spyOn(scoreApiModule.scoreApi, 'fetchTopScores').mockResolvedValueOnce(
      success([
        { nick: 'A', score: 100 },
        { nick: 'B', score: 50 },
      ])
    );

    const { result } = renderHook(() => useLeaderboard(5));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entries).toEqual([
      { nick: 'A', score: 100 },
      { nick: 'B', score: 50 },
    ]);
    expect(result.current.source).toBe('api');
    expect(result.current.errorMessage).toBeNull();
  });

  it('falls back to localStorage when the API fails and there are stored scores', async () => {
    const stored = [
      { nick: 'LOCAL', score: 999, date: new Date().toISOString() },
    ];
    localStorage.setItem('dino_runner_scores', JSON.stringify(stored));
    vi.spyOn(scoreApiModule.scoreApi, 'fetchTopScores').mockResolvedValueOnce(
      failure('NETWORK', 'offline')
    );

    const { result } = renderHook(() => useLeaderboard(5));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entries).toEqual([{ nick: 'LOCAL', score: 999 }]);
    expect(result.current.source).toBe('local');
    expect(result.current.errorMessage).toBe('offline');
  });

  it('returns source=none when the API fails and localStorage is empty', async () => {
    vi.spyOn(scoreApiModule.scoreApi, 'fetchTopScores').mockResolvedValueOnce(
      failure('SERVER', 'boom')
    );

    const { result } = renderHook(() => useLeaderboard(5));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entries).toEqual([]);
    expect(result.current.source).toBe('none');
    expect(result.current.errorMessage).toBe('boom');
  });

  it('exposes a refresh function that re-fetches the API', async () => {
    const spy = vi
      .spyOn(scoreApiModule.scoreApi, 'fetchTopScores')
      .mockResolvedValueOnce(success([{ nick: 'A', score: 1 }]))
      .mockResolvedValueOnce(success([{ nick: 'A', score: 1 }, { nick: 'B', score: 2 }]));

    const { result } = renderHook(() => useLeaderboard(5));

    await waitFor(() => expect(result.current.entries).toHaveLength(1));
    await act(async () => {
      await result.current.refresh();
    });
    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('passes the limit parameter to the API', async () => {
    const spy = vi
      .spyOn(scoreApiModule.scoreApi, 'fetchTopScores')
      .mockResolvedValueOnce(success([]));

    renderHook(() => useLeaderboard(7));
    await waitFor(() => expect(spy).toHaveBeenCalledWith(7));
  });
});
