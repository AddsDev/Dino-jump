import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import ScoreBoard from '../game/components/ScoreBoard';
import GameOverModal from '../game/components/GameOverModal';

const okResponse = (body: unknown) =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
  }) as Response;

describe('React Component Rendering & Transitions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should render the Welcome Page dashboard', () => {
    render(<App />);
    
    // Header check
    expect(screen.getAllByText(/Dino/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Jump/i).length).toBeGreaterThan(0);
    
    // Play button check
    const startBtn = screen.getByRole('button', { name: /Iniciar Misión/i });
    expect(startBtn).toBeInTheDocument();

    // Leaderboard title check
    expect(screen.getByText(/Misión Leaderboard/i)).toBeInTheDocument();
  });

  it('should navigate to the game screen upon click', () => {
    render(<App />);
    
    const startBtn = screen.getByRole('button', { name: /Iniciar Misión/i });
    fireEvent.click(startBtn);
    
    // Assert that the canvas container is now rendered on GamePage
    const canvas = screen.getByTestId('game-canvas');
    expect(canvas).toBeInTheDocument();

    // Scoreboard indicators should be visible
    expect(screen.getByTestId('current-score')).toBeInTheDocument();
    expect(screen.getByTestId('high-score')).toBeInTheDocument();
  });

  it('should render ScoreBoard layout with initial values', () => {
    render(<ScoreBoard score={45} highScore={250} />);
    
    const current = screen.getByTestId('current-score');
    const high = screen.getByTestId('high-score');
    
    expect(current.textContent).toBe('00045');
    expect(high.textContent).toBe('00250');
  });

  it('should prompt validation errors for short nicknames inside the GameOverModal', async () => {
    const onRestartMock = vi.fn();
    const onBackToMenuMock = vi.fn();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <GameOverModal 
        score={120} 
        onRestart={onRestartMock} 
        onBackToMenu={onBackToMenuMock} 
      />
    );

    // Final score displayed correctly
    expect(screen.getByText('120')).toBeInTheDocument();

    // Input element check
    const input = screen.getByLabelText(/Registrar Nickname del Piloto/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Submit button
    const submitBtn = screen.getByRole('button', { name: /Guardar Registro/i });

    // Enter an invalid 2-char nick and submit
    fireEvent.change(input, { target: { value: 'JD' } });
    fireEvent.click(submitBtn);

    // Assert warning message
    const errorMsg = await screen.findByTestId('error-message');
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg.textContent).toContain('between 3 and 30 characters');

    // No API call should be made on validation failure
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should display success saving state inside the GameOverModal', async () => {
    const onRestartMock = vi.fn();
    const onBackToMenuMock = vi.fn();
    const onScoreSubmitted = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        okResponse({ nick: 'CYBER_PLAYER', score: 120, message: 'Score registered successfully' })
      )
    );

    render(
      <GameOverModal 
        score={120} 
        onRestart={onRestartMock} 
        onBackToMenu={onBackToMenuMock} 
        onScoreSubmitted={onScoreSubmitted}
      />
    );

    const input = screen.getByLabelText(/Registrar Nickname del Piloto/i) as HTMLInputElement;
    const submitBtn = screen.getByRole('button', { name: /Guardar Registro/i });

    // Enter a valid nick
    fireEvent.change(input, { target: { value: 'CYBER_PLAYER' } });
    fireEvent.click(submitBtn);

    // Success indicator should be rendered
    const successMsg = await screen.findByTestId('success-message');
    expect(successMsg).toBeInTheDocument();
    expect(successMsg.textContent).toContain('registered');
    expect(onScoreSubmitted).toHaveBeenCalled();
  });
});
