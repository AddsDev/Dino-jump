import React, { useState } from 'react';
import { localScoreStorage } from '../storage/localScoreStorage';
import { scoreApi } from '../services/scoreApi';

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
  onBackToMenu: () => void;
  onScoreSubmitted?: () => void;
}

interface SubmitState {
  isSubmitting: boolean;
  successMessage: string;
  errorMessage: string;
  fallbackNotice: string;
  isSaved: boolean;
}

const initialSubmitState: SubmitState = {
  isSubmitting: false,
  successMessage: '',
  errorMessage: '',
  fallbackNotice: '',
  isSaved: false,
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  onRestart,
  onBackToMenu,
  onScoreSubmitted,
}) => {
  const [nick, setNick] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>(initialSubmitState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState({ ...initialSubmitState });

    const trimmed = nick.trim();
    if (trimmed.length < 3 || trimmed.length > 30) {
      setSubmitState((s) => ({ ...s, errorMessage: 'Nickname must be between 3 and 30 characters.' }));
      return;
    }

    setSubmitState((s) => ({ ...s, isSubmitting: true }));

    // 1) Try the API
    const result = await scoreApi.submitScore(trimmed, score);

    if (result.kind === 'success') {
      // Cache the record locally so the WelcomePage has something
      // to show even if the API is unreachable on the next visit.
      localScoreStorage.saveScore(trimmed, score);
      setSubmitState({
        isSubmitting: false,
        successMessage: result.message,
        errorMessage: '',
        fallbackNotice: '',
        isSaved: true,
      });
      onScoreSubmitted?.();
      return;
    }

    // 2) Fallback to localStorage on network/timeout/server errors
    if (result.code === 'VALIDATION') {
      setSubmitState({
        isSubmitting: false,
        successMessage: '',
        errorMessage: result.message,
        fallbackNotice: '',
        isSaved: false,
      });
      return;
    }

    const fallback = localScoreStorage.saveScore(trimmed, score);
    if (!fallback.success) {
      setSubmitState({
        isSubmitting: false,
        successMessage: '',
        errorMessage: fallback.message,
        fallbackNotice: '',
        isSaved: false,
      });
      return;
    }

    setSubmitState({
      isSubmitting: false,
      successMessage: fallback.message,
      errorMessage: '',
      fallbackNotice: `Saved locally — API ${result.code.toLowerCase()}.`,
      isSaved: true,
    });
    onScoreSubmitted?.();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(8, 12, 16, 0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="space-card"
        style={{
          width: '90%',
          maxWidth: '430px',
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '32px',
            fontWeight: 900,
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--space-orange)',
          }}
        >
          Misión Fallida
        </h1>

        <p style={{ color: 'var(--space-text-secondary)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>
          ¡Tu explorador ha colisionado contra los fragmentos de desechos espaciales!
        </p>

        <div
          style={{
            margin: '20px 0 32px 0',
            background: 'var(--space-surface)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--space-border)',
          }}
        >
          <span
            style={{
              display: 'block',
              color: 'var(--space-blue)',
              textTransform: 'uppercase',
              fontSize: '11px',
              letterSpacing: '1.5px',
              marginBottom: '6px',
              fontWeight: 700,
            }}
          >
            Distancia Registrada
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '44px',
              fontWeight: 'bold',
              color: 'var(--space-text-primary)',
            }}
          >
            {score}
          </span>
        </div>

        {!submitState.isSaved ? (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left', marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                color: 'var(--space-blue)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px',
              }}
              htmlFor="nick-input"
            >
              Registrar Nickname del Piloto
            </label>
            <input
              id="nick-input"
              type="text"
              placeholder="e.g., PILOTO01"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              disabled={submitState.isSubmitting}
              style={{
                width: '100%',
                backgroundColor: 'var(--space-bg-darker)',
                border: '1px solid var(--space-border)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'var(--space-text-primary)',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--space-orange)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--space-border)')}
              maxLength={35}
              data-testid="nick-input"
            />

            {submitState.errorMessage && (
              <p
                style={{
                  color: '#ff6b6b',
                  fontSize: '13px',
                  marginTop: '8px',
                  fontWeight: 600,
                }}
                data-testid="error-message"
              >
                ⚠️ {submitState.errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="space-btn-orange"
              disabled={submitState.isSubmitting}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                fontSize: '13px',
                opacity: submitState.isSubmitting ? 0.6 : 1,
                cursor: submitState.isSubmitting ? 'not-allowed' : 'pointer',
              }}
              data-testid="submit-score"
            >
              {submitState.isSubmitting ? 'Enviando…' : 'Guardar Registro'}
            </button>
          </form>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <p
              style={{
                color: 'var(--space-orange)',
                fontWeight: 700,
                fontSize: '15px',
                marginBottom: '10px',
              }}
              data-testid="success-message"
            >
              🎉 {submitState.successMessage}
            </p>
            {submitState.fallbackNotice && (
              <p
                style={{
                  color: '#fbbf24',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
                data-testid="fallback-notice"
              >
                ⚠️ {submitState.fallbackNotice}
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onRestart}
            className="space-btn-orange"
            style={{ flex: 1, padding: '12px', fontSize: '13px' }}
          >
            Reintentar
          </button>
          <button
            onClick={onBackToMenu}
            data-testid="back-to-menu"
            style={{
              flex: 1,
              backgroundColor: 'rgba(143, 175, 199, 0.08)',
              border: '1px solid var(--space-border)',
              borderRadius: '8px',
              color: 'var(--space-text-primary)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(143, 175, 199, 0.15)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(143, 175, 199, 0.08)')}
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
export default GameOverModal;
