import React from 'react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, highScore }) => {
  // Format numbers to a classic arcade 5-digit string (e.g. 00124)
  const formatScore = (num: number): string => {
    return String(num).padStart(5, '0');
  };

  return (
    <div 
      className="glass-panel" 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto 16px auto',
        border: '1px solid var(--space-border)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        background: 'var(--space-bg-dark)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--space-blue)', fontWeight: 700 }}>
          Score
        </span>
        <span 
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '28px',
            color: 'var(--space-text-primary)',
            fontWeight: 'bold',
          }}
          data-testid="current-score"
        >
          {formatScore(score)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--space-blue)', fontWeight: 700 }}>
          Hi-Score
        </span>
        <span 
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '28px',
            color: 'var(--space-orange)',
            fontWeight: 'bold',
          }}
          data-testid="high-score"
        >
          {formatScore(highScore)}
        </span>
      </div>
    </div>
  );
};
export default ScoreBoard;
