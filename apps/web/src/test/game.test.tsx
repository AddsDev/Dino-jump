import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import ScoreBoard from '../game/components/ScoreBoard';
import GameOverModal from '../game/components/GameOverModal';

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

  it('should prompt validation errors for short nicknames inside the GameOverModal', () => {
    const onRestartMock = vi.fn();
    const onBackToMenuMock = vi.fn();

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
    const errorMsg = screen.getByTestId('error-message');
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg.textContent).toContain('between 3 and 30 characters');
  });

  it('should display success saving state inside the GameOverModal', () => {
    const onRestartMock = vi.fn();
    const onBackToMenuMock = vi.fn();

    render(
      <GameOverModal 
        score={120} 
        onRestart={onRestartMock} 
        onBackToMenu={onBackToMenuMock} 
      />
    );

    const input = screen.getByLabelText(/Registrar Nickname del Piloto/i) as HTMLInputElement;
    const submitBtn = screen.getByRole('button', { name: /Guardar Registro/i });

    // Enter a valid nick
    fireEvent.change(input, { target: { value: 'CYBER_PLAYER' } });
    fireEvent.click(submitBtn);

    // Success indicator should be rendered
    const successMsg = screen.getByTestId('success-message');
    expect(successMsg).toBeInTheDocument();
    expect(successMsg.textContent).toContain('registered');
  });
});
