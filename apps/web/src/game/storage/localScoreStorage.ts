import { ScoreRecord } from '../types/game.types';

const STORAGE_KEY = 'dino_runner_scores';

export const localScoreStorage = {
  /**
   * Get all score records sorted descending by score.
   */
  getScores(): ScoreRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed: ScoreRecord[] = JSON.parse(stored);
      return parsed.sort((a, b) => b.score - a.score);
    } catch (e) {
      console.error('Error reading scores from localStorage:', e);
      return [];
    }
  },

  /**
   * Save or update a score for a given nickname.
   * Enforces validations:
   * - nick must be between 3 and 30 characters.
   * - score must be >= 0.
   * Returns a status message indicating the outcome.
   */
  saveScore(nick: string, score: number): { success: boolean; message: string; record?: ScoreRecord } {
    // 1. Validations
    if (!nick || typeof nick !== 'string') {
      return { success: false, message: 'Nickname is required.' };
    }

    const trimmedNick = nick.trim();
    if (trimmedNick.length < 3 || trimmedNick.length > 30) {
      return { success: false, message: 'Nickname must be between 3 and 30 characters.' };
    }

    if (score < 0 || !Number.isInteger(score)) {
      return { success: false, message: 'Score must be a positive integer.' };
    }

    const scores = this.getScores();
    const existingIndex = scores.findIndex(s => s.nick.toLowerCase() === trimmedNick.toLowerCase());

    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      const existing = scores[existingIndex];
      // Rule: Only update if the new score is greater than the previous one
      if (score > existing.score) {
        scores[existingIndex] = {
          nick: existing.nick, // preserve original casing
          score,
          date: now
        };
        this.persist(scores);
        return { 
          success: true, 
          message: 'High score updated!', 
          record: scores[existingIndex] 
        };
      } else {
        return { 
          success: true, 
          message: 'Existing score is greater or equal. No update applied.', 
          record: existing 
        };
      }
    } else {
      // Create new player record
      const newRecord: ScoreRecord = {
        nick: trimmedNick,
        score,
        date: now
      };
      scores.push(newRecord);
      this.persist(scores);
      return { 
        success: true, 
        message: 'Score registered!', 
        record: newRecord 
      };
    }
  },

  /**
   * Helper to persist records back to storage.
   */
  persist(scores: ScoreRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
      console.error('Error writing scores to localStorage:', e);
    }
  }
};
