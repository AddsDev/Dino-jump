import React, { useState, useEffect } from 'react';
import { GameStatus } from '../game/types/game.types';
import { localScoreStorage } from '../game/storage/localScoreStorage';
import { ScoreBoard } from '../game/components/ScoreBoard';
import { GameCanvas } from '../game/components/GameCanvas';
import { GameOverModal } from '../game/components/GameOverModal';

interface GamePageProps {
  onBackToMenu: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({ onBackToMenu }) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Load high score on mount
  useEffect(() => {
    const scores = localScoreStorage.getScores();
    if (scores.length > 0) {
      setHighScore(scores[0].score);
    }
  }, []);

  const handleStartGame = () => {
    setGameStatus('running');
    setCurrentScore(0);
  };

  const handleGameOver = (finalScore: number) => {
    setGameStatus('game-over');
    setCurrentScore(finalScore);
    
    // Refresh high score locally if beaten
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
  };

  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score);
  };

  const handleRestart = () => {
    setGameStatus('running');
    setCurrentScore(0);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HUD Scoreboard header */}
      <ScoreBoard score={currentScore} highScore={highScore} />

      {/* Main Canvas Container */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <GameCanvas 
          status={gameStatus} 
          onGameOver={handleGameOver} 
          onScoreUpdate={handleScoreUpdate} 
        />

        {/* Back navigation button floating underneath canvas when idle */}
        {gameStatus === 'idle' && (
          <button
            onClick={onBackToMenu}
            style={{
              position: 'absolute',
              bottom: '-60px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px 20px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            ← Back to Main Menu
          </button>
        )}
      </div>

      {/* Floating control trigger when idle */}
      {gameStatus === 'idle' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <button 
            onClick={handleStartGame}
            className="glow-btn-teal"
            style={{ padding: '14px 36px', fontSize: '15px' }}
          >
            Start Run [ Enter ]
          </button>
        </div>
      )}

      {/* Game Over Popup Modal */}
      {gameStatus === 'game-over' && (
        <GameOverModal 
          score={currentScore} 
          onRestart={handleRestart} 
          onBackToMenu={onBackToMenu} 
        />
      )}
    </div>
  );
};
export default GamePage;
