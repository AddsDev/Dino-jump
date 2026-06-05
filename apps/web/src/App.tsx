import React, { useState } from 'react';
import { WelcomePage } from './pages/WelcomePage';
import { GamePage } from './pages/GamePage';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<'welcome' | 'game'>('welcome');
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);

  const goToGame = () => {
    setActiveScreen('game');
  };

  const goToWelcome = () => {
    setLeaderboardRefreshKey((n) => n + 1);
    setActiveScreen('welcome');
  };

  const handleScoreSubmitted = () => {
    setLeaderboardRefreshKey((n) => n + 1);
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        paddingBottom: '40px',
      }}
    >
      {/* Top Navbar */}
      <header 
        style={{
          borderBottom: '1px solid rgba(143, 175, 199, 0.12)',
          padding: '16px 0',
          background: 'rgba(15, 23, 32, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div 
            onClick={() => setActiveScreen('welcome')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            {/* Low-Poly Space Emblem Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12,2 18,9 18,16 12,21 6,16 6,9" fill="#253140" stroke="#8fafc7" strokeWidth="1.5" strokeLinejoin="round"/>
              <polygon points="12,2 12,21 18,16" fill="rgba(143, 175, 199, 0.25)" stroke="#8fafc7" strokeWidth="0.5" strokeLinejoin="round"/>
              <polygon points="12,6 15,10 12,14 9,10" fill="#d9a066" stroke="#e4ae77" strokeWidth="0.5" strokeLinejoin="round"/>
            </svg>
            <span 
              style={{ 
                fontFamily: 'var(--font-sans)', 
                fontWeight: 900, 
                fontSize: '18px', 
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: '#f3f4f6'
              }}
            >
              DINO <span style={{ color: '#d9a066' }}>JUMP</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#cbd5e1',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(143, 175, 199, 0.08)',
                border: '1px solid rgba(143, 175, 199, 0.15)',
                padding: '5px 12px',
                borderRadius: '6px',
              }}
            >
              v1.0.0-dev
            </span>
          </div>
        </div>
      </header>

      {/* Main Screen Router */}
      <main style={{ flex: 1 }}>
        {activeScreen === 'welcome' ? (
          <WelcomePage onStartGame={goToGame} refreshKey={leaderboardRefreshKey} />
        ) : (
          <GamePage
            onBackToMenu={goToWelcome}
            onScoreSubmitted={handleScoreSubmitted}
          />
        )}
      </main>
    </div>
  );
};
export default App;
