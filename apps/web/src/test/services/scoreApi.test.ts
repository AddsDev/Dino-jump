import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createScoreApi } from '../../game/services/scoreApi';
import { apiConfig } from '../../config/api';

const okJson = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

const errJson = (body: unknown, status: number) =>
  ({
    ok: false,
    status,
    json: async () => body,
  }) as unknown as Response;

const jsonlessResponse = (status: number) =>
  ({
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError('bad json');
    },
  }) as unknown as Response;

describe('scoreApi client', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let api: ReturnType<typeof createScoreApi>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    api = createScoreApi();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes the configured base URL', () => {
    expect(api.getApiBaseUrl()).toBe(apiConfig.baseUrl);
  });

  it('submits a score with POST and JSON body', async () => {
    fetchMock.mockResolvedValueOnce(
      okJson({
        data: { nick: 'CYBER', score: 42 },
        message: 'Score registered successfully',
      })
    );

    const result = await api.submitScore('CYBER', 42);

    expect(result.kind).toBe('success');
    if (result.kind !== 'success') return;

    expect(result.status).toBe('registered');
    expect(result.record).toEqual({ nick: 'CYBER', score: 42 });
    expect(result.source).toBe('api');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain(apiConfig.endpoints.submitScore);
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({ nick: 'CYBER', score: 42 });
  });

  it('maps an "updated" API message to status=updated', async () => {
    fetchMock.mockResolvedValueOnce(
      okJson({
        data: { nick: 'CYBER', score: 99 },
        message: 'Score updated to a higher value',
      })
    );

    const result = await api.submitScore('CYBER', 99);
    if (result.kind !== 'success') throw new Error('expected success');
    expect(result.status).toBe('updated');
  });

  it('returns VALIDATION error on 400 with API message', async () => {
    fetchMock.mockResolvedValueOnce(
      errJson({ code: 'VALIDATION_ERROR', message: 'Nick too short' }, 400)
    );

    const result = await api.submitScore('AB', 1);
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.code).toBe('VALIDATION');
    expect(result.message).toBe('Nick too short');
  });

  it('returns SERVER error on 500', async () => {
    fetchMock.mockResolvedValueOnce(
      errJson({ code: 'INTERNAL', message: 'Boom' }, 500)
    );

    const result = await api.submitScore('OK', 10);
    if (result.kind !== 'error') throw new Error('expected error');
    expect(result.code).toBe('SERVER');
  });

  it('falls back to a default validation message on a non-JSON 400', async () => {
    fetchMock.mockResolvedValueOnce(jsonlessResponse(400));
    const result = await api.submitScore('OK', 10);
    if (result.kind !== 'error') throw new Error('expected error');
    expect(result.code).toBe('VALIDATION');
    expect(result.message).toBe('Invalid request payload.');
  });

  it('returns NETWORK on a TypeError (fetch failure)', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await api.submitScore('OK', 10);
    if (result.kind !== 'error') throw new Error('expected error');
    expect(result.code).toBe('NETWORK');
  });

  it('returns TIMEOUT on an AbortError', async () => {
    fetchMock.mockImplementationOnce(() => {
      const err = new DOMException('Aborted', 'AbortError');
      return Promise.reject(err);
    });

    const result = await api.submitScore('OK', 10);
    if (result.kind !== 'error') throw new Error('expected error');
    expect(result.code).toBe('TIMEOUT');
  });

  it('fetches the top scores with a query string', async () => {
    fetchMock.mockResolvedValueOnce(
      okJson({
        data: [
          { nick: 'A', score: 10 },
          { nick: 'B', score: 5 },
        ],
      })
    );

    const result = await api.fetchTopScores(2);
    if (result.kind !== 'success') throw new Error('expected success');
    expect(result.entries).toEqual([
      { nick: 'A', score: 10 },
      { nick: 'B', score: 5 },
    ]);

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(apiConfig.endpoints.topScores);
    expect(url).toContain('limit=2');
  });

  it('returns an empty list when API payload has no data array', async () => {
    fetchMock.mockResolvedValueOnce(okJson({ message: 'noop' }));
    const result = await api.fetchTopScores();
    if (result.kind !== 'success') throw new Error('expected success');
    expect(result.entries).toEqual([]);
  });

  it('returns SERVER error from fetchTopScores on 5xx', async () => {
    fetchMock.mockResolvedValueOnce(jsonlessResponse(503));
    const result = await api.fetchTopScores();
    if (result.kind !== 'error') throw new Error('expected error');
    expect(result.code).toBe('SERVER');
  });
});
