import { test, expect, type Page, type Route } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

const jsonResponse = (route: Route, status: number, body: unknown) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

/**
 * Install a happy-path mock of the API on the given page.
 *
 * Returns a `state` object that specs can read to assert on the
 * calls the page made (e.g. the top-10 fetch after a submit).
 */
export interface MockState {
  submitCalls: Array<{ nick: string; score: number }>;
  topCalls: number;
  records: { nick: string; score: number }[];
}

export const installHappyApiMock = async (
  page: Page,
  options?: { initialTop?: { nick: string; score: number }[] }
): Promise<MockState> => {
  const state: MockState = {
    submitCalls: [],
    topCalls: 0,
    records: [...(options?.initialTop ?? [])],
  };

  await page.route(`${API_BASE}/api/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/scores' && route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as { nick: string; score: number };
      state.submitCalls.push(body);
      // Mirror the real backend: keep the best score per nick.
      const existing = state.records.find(
        (r) => r.nick.toLowerCase() === body.nick.toLowerCase()
      );
      if (existing) {
        if (body.score > existing.score) existing.score = body.score;
      } else {
        state.records.push({ nick: body.nick, score: body.score });
      }
      return jsonResponse(route, 201, {
        data: { nick: body.nick, score: body.score },
        message: 'Score registered successfully',
      });
    }
    if (url.pathname === '/api/scores/top') {
      state.topCalls += 1;
      const sorted = [...state.records].sort((a, b) => b.score - a.score);
      const limit = Number(url.searchParams.get('limit') ?? sorted.length);
      return jsonResponse(route, 200, { data: sorted.slice(0, limit) });
    }
    return jsonResponse(route, 404, { message: 'Not found' });
  });

  await page.route(`${API_BASE}/api/health`, (route) =>
    jsonResponse(route, 200, { status: 'ok' })
  );

  return state;
};

/**
 * Make the API fail with network errors (TypeError) for the whole
 * leaderboard, simulating the API being completely unreachable.
 */
export const installApiDownMock = async (page: Page): Promise<void> => {
  await page.route(`${API_BASE}/api/**`, (route) => route.abort('failed'));
};

export const API_BASE_URL = API_BASE;
