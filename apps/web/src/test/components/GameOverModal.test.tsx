import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GameOverModal from '../../game/components/GameOverModal';
import * as scoreApiModule from '../../game/services/scoreApi';
import type { SubmitScoreResult } from '../../game/types/api.types';

const okSubmit = (message = 'Score registered successfully'): SubmitScoreResult => ({
  kind: 'success',
  status: 'registered',
  record: { nick: 'CYBER', score: 100 },
  message,
  source: 'api',
});

const errSubmit = (
  code: 'NETWORK' | 'TIMEOUT' | 'SERVER' | 'VALIDATION' | 'UNKNOWN',
  message: string
): SubmitScoreResult => ({ kind: 'error', code, message });

const okResponse = (body: unknown) =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
  }) as Response;

describe('<GameOverModal />', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('shows a validation error and never calls the API for a too-short nick', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const onScoreSubmitted = vi.fn();

    render(
      <GameOverModal
        score={120}
        onRestart={vi.fn()}
        onBackToMenu={vi.fn()}
        onScoreSubmitted={onScoreSubmitted}
      />
    );

    const input = screen.getByLabelText(/Registrar Nickname del Piloto/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'AB' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Registro/i }));

    const error = await screen.findByTestId('error-message');
    expect(error.textContent).toContain('between 3 and 30 characters');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onScoreSubmitted).not.toHaveBeenCalled();
  });

  it('renders the success state and caches locally after a successful API call', async () => {
    vi.spyOn(scoreApiModule.scoreApi, 'submitScore').mockResolvedValueOnce(okSubmit());
    const onScoreSubmitted = vi.fn();

    render(
      <GameOverModal
        score={120}
        onRestart={vi.fn()}
        onBackToMenu={vi.fn()}
        onScoreSubmitted={onScoreSubmitted}
      />
    );

    const input = screen.getByLabelText(/Registrar Nickname del Piloto/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'CYBER_PLAYER' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Registro/i }));

    const success = await screen.findByTestId('success-message');
    expect(success.textContent).toContain('registered');
    expect(onScoreSubmitted).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('dino_runner_scores') ?? '[]')[0].nick).toBe('CYBER_PLAYER');
  });

  it('falls back to localStorage and shows a fallback notice on network failure', async () => {
    vi.spyOn(scoreApiModule.scoreApi, 'submitScore').mockResolvedValueOnce(
      errSubmit('NETWORK', 'offline')
    );

    render(
      <GameOverModal score={10} onRestart={vi.fn()} onBackToMenu={vi.fn()} />
    );

    const input = screen.getByLabelText(/Registrar Nickname del Piloto/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'FALLBACK_NICK' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Registro/i }));

    const success = await screen.findByTestId('success-message');
    expect(success.textContent).toContain('registered');
    const notice = await screen.findByTestId('fallback-notice');
    expect(notice.textContent).toContain('API network');
  });

  it('does not fall back on VALIDATION errors', async () => {
    vi.spyOn(scoreApiModule.scoreApi, 'submitScore').mockResolvedValueOnce(
      errSubmit('VALIDATION', 'Invalid nick')
    );
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<GameOverModal score={10} onRestart={vi.fn()} onBackToMenu={vi.fn()} />);

    const input = screen.getByLabelText(/Registrar Nickname del Piloto/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'VALIDATED' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Registro/i }));

    const error = await screen.findByTestId('error-message');
    expect(error.textContent).toContain('Invalid nick');
    expect(screen.queryByTestId('success-message')).toBeNull();
    expect(screen.queryByTestId('fallback-notice')).toBeNull();
  });

  it('uses the fetch API directly when no mock is provided (sanity check)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        okResponse({
          data: { nick: 'REAL', score: 50 },
          message: 'Score registered successfully',
        })
      )
    );

    render(<GameOverModal score={50} onRestart={vi.fn()} onBackToMenu={vi.fn()} />);
    const input = screen.getByLabelText(/Registrar Nickname del Piloto/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'REAL_NICK' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Registro/i }));

    await waitFor(() => {
      expect(screen.getByTestId('success-message').textContent).toContain('registered');
    });
  });
});
