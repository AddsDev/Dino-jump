import React, { useEffect } from 'react';
import { useLeaderboard } from '../game/hooks/useLeaderboard';
import type { ApiScoreRecord } from '../game/types/api.types';

interface WelcomePageProps {
  onStartGame: () => void;
  refreshKey?: number;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onStartGame, refreshKey = 0 }) => {
  const { entries, source, isLoading, errorMessage, refresh } = useLeaderboard(10);

  useEffect(() => {
    // Apply space theme class to body on mount
    document.body.classList.add('space-theme-body');

    return () => {
      // Remove class on unmount
      document.body.classList.remove('space-theme-body');
    };
  }, []);

  useEffect(() => {
    // Re-fetch when the parent signals a new score has been saved
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const badgeLabel =
    source === 'api' ? 'Global' : source === 'local' ? 'Local (offline)' : 'Vacío';
  const badgeColor =
    source === 'api' ? 'var(--space-orange)' : source === 'local' ? '#fbbf24' : 'var(--space-blue)';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 1. HEADER HERO PANEL (Astronaut Space Explorer Theme) */}
      <div className="space-card">
        
        {/* Floating Decals: Low-Poly Geometric Planet Illustration */}
        <div style={{ position: 'absolute', top: '24px', right: '32px', opacity: 0.85 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Geometric Planet Body */}
            <polygon points="50,15 75,30 75,60 50,75 25,60 25,30" fill="rgba(143, 175, 199, 0.1)" stroke="var(--space-blue)" strokeWidth="1.5" strokeLinejoin="round"/>
            <polygon points="50,15 50,75 75,60" fill="rgba(143, 175, 199, 0.08)" stroke="var(--space-blue)" strokeWidth="1" strokeLinejoin="round"/>
            <polygon points="50,15 50,75 25,30" fill="rgba(143, 175, 199, 0.05)" stroke="var(--space-blue)" strokeWidth="1" strokeLinejoin="round"/>
            <polygon points="50,15 75,30 50,45" fill="rgba(217, 160, 102, 0.15)" stroke="var(--space-orange)" strokeWidth="1" strokeLinejoin="round"/>
            <polygon points="50,15 25,30 50,45" fill="rgba(217, 160, 102, 0.08)" stroke="var(--space-orange)" strokeWidth="1" strokeLinejoin="round"/>
            
            {/* Slanted orbit rings */}
            <line x1="10" y1="65" x2="90" y2="25" stroke="var(--space-blue)" strokeWidth="1.5" strokeDasharray="3 3"/>
            <line x1="15" y1="70" x2="85" y2="35" stroke="rgba(217, 160, 102, 0.4)" strokeWidth="1"/>
            
            {/* Low-Poly Star particles */}
            <polygon points="15,20 18,22 15,24 12,22" fill="var(--space-blue)"/>
            <polygon points="85,80 87,81 85,82 83,81" fill="var(--space-orange)"/>
            <polygon points="88,20 90,21 88,22 86,21" fill="var(--space-blue)"/>
          </svg>
        </div>

        {/* Decorative Space Terrains */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', opacity: 0.15, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 40" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,40 100,20 220,35 340,15 480,30 620,10 720,25 800,5 800,40" fill="var(--space-blue)" stroke="var(--space-blue)" strokeWidth="1"/>
            <polygon points="0,40 80,30 180,15 300,35 440,20 580,25 700,10 800,30 800,40" fill="var(--space-orange)" stroke="var(--space-orange)" strokeWidth="0.5"/>
          </svg>
        </div>

        <span className="space-badge">
          🌌 Space Mission Edition
        </span>

        {/* Dynamic Low-Poly Astronaut Helmet Decal Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer space suit collar geometric polygons */}
            <polygon points="20,80 80,80 72,92 28,92" fill="#253140" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round"/>
            <polygon points="30,70 70,70 80,80 20,80" fill="#1b2430" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round"/>
            
            {/* Helmet Main Shell Facets */}
            <polygon points="50,8 82,24 82,62 50,78 18,62 18,24" fill="#334155" stroke="#475569" strokeWidth="2" strokeLinejoin="round"/>
            <polygon points="50,8 82,24 50,43" fill="#475569" stroke="#64748B" strokeWidth="1" strokeLinejoin="round"/>
            <polygon points="50,8 18,24 50,43" fill="#253140" stroke="#334155" strokeWidth="1" strokeLinejoin="round"/>
            <polygon points="18,24 18,62 50,43" fill="#1e293b" stroke="#334155" strokeWidth="1" strokeLinejoin="round"/>
            <polygon points="82,24 82,62 50,43" fill="#475569" stroke="#64748B" strokeWidth="1" strokeLinejoin="round"/>
            
            {/* Hexagonal Gold Visor (low-poly desaturated orange facets) */}
            <polygon points="50,22 74,34 74,54 50,66 26,54 26,34" fill="#d9a066" stroke="#e4ae77" strokeWidth="1.5" strokeLinejoin="round"/>
            <polygon points="50,22 50,66 74,54" fill="rgba(255,255,255,0.12)" stroke="#e4ae77" strokeWidth="0.5" strokeLinejoin="round"/>
            <polygon points="50,22 50,66 26,34" fill="rgba(0,0,0,0.1)" stroke="#d9a066" strokeWidth="0.5" strokeLinejoin="round"/>
            
            {/* Visor shine facets */}
            <polygon points="58,26 68,31 60,42 50,37" fill="rgba(255,255,255,0.25)" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="space-title">
          DINO <span className="space-title-highlight">JUMP</span>
        </h1>

        <p className="space-subtitle">
          Explora, esquiva obstáculos y supera tu mejor puntaje.
        </p>

        <button 
          onClick={onStartGame}
          className="space-btn-orange"
        >
          Iniciar Misión
        </button>

        {/* Clean Geometric Keyboard Instruction Cards */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '36px',
            borderTop: '1px solid var(--space-border)',
            paddingTop: '32px'
          }}
        >
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span className="space-key-tag">
              SPACE / ↑
            </span>
            <p style={{ fontSize: '12px', color: 'var(--space-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Saltar
            </p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span className="space-key-tag">
              ↓ ARROW
            </span>
            <p style={{ fontSize: '12px', color: 'var(--space-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Agacharse
            </p>
          </div>
        </div>
      </div>

      {/* 2. LEADERBOARD LIST PANEL */}
      <div 
        className="space-card"
        style={{
          padding: '32px',
          background: 'var(--space-bg-dark)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--space-text-primary)' }}>
            📡 Misión Leaderboard
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              data-testid="leaderboard-source-badge"
              style={{
                fontSize: '11px',
                color: badgeColor,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 700,
                border: `1px solid ${badgeColor}`,
                padding: '4px 10px',
                borderRadius: '6px',
              }}
            >
              {badgeLabel}
            </span>
            <button
              type="button"
              onClick={() => void refresh()}
              data-testid="leaderboard-refresh"
              style={{
                background: 'transparent',
                border: '1px solid var(--space-border)',
                color: 'var(--space-text-secondary)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {errorMessage && source === 'local' && (
          <p
            data-testid="leaderboard-error"
            style={{
              color: '#fbbf24',
              fontSize: '12px',
              marginBottom: '12px',
              fontWeight: 600,
            }}
          >
            ⚠️ {errorMessage}
          </p>
        )}

        {isLoading && entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', border: '1px dashed var(--space-border)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--space-text-secondary)', fontSize: '14px' }}>Loading leaderboard…</p>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', border: '1px dashed var(--space-border)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--space-text-secondary)', fontSize: '14px' }}>
              No scores recorded yet. Be the first to establish a high score!
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="space-table" data-testid="leaderboard-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Player Nick</th>
                  <th style={{ textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item: ApiScoreRecord, index: number) => {
                  const isTop3 = index < 3;
                  return (
                    <tr key={item.nick + index} data-testid="leaderboard-row">
                      <td style={{ padding: '16px' }}>
                        <span className={`space-rank-number ${index === 0 ? 'space-rank-1' : ''}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--space-text-primary)' }}>
                        {item.nick}
                        {index === 0 && <span className="space-rank-champion-tag">ELITE</span>}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <span className={`space-score-col ${isTop3 ? 'space-score-top' : ''}`}>
                          {item.score}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default WelcomePage;
