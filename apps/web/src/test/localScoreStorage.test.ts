import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localScoreStorage } from '../game/storage/localScoreStorage';

describe('localScoreStorage Business Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return empty score array initially', () => {
    const scores = localScoreStorage.getScores();
    expect(scores).toEqual([]);
  });

  it('should validate nickname character length restrictions', () => {
    // Too short (2 characters)
    const shortResult = localScoreStorage.saveScore('JD', 100);
    expect(shortResult.success).toBe(false);
    expect(shortResult.message).toContain('between 3 and 30 characters');

    // Too long (31 characters)
    const longResult = localScoreStorage.saveScore('A'.repeat(31), 100);
    expect(longResult.success).toBe(false);
    expect(longResult.message).toContain('between 3 and 30 characters');

    // Just right (3 characters)
    const passResult = localScoreStorage.saveScore('JON', 100);
    expect(passResult.success).toBe(true);
    expect(localScoreStorage.getScores()).toHaveLength(1);
  });

  it('should validate score boundary properties', () => {
    // Negative score
    const negResult = localScoreStorage.saveScore('JON', -50);
    expect(negResult.success).toBe(false);
    expect(negResult.message).toContain('positive integer');

    // Decimal score
    const decResult = localScoreStorage.saveScore('JON', 10.5);
    expect(decResult.success).toBe(false);
    expect(decResult.message).toContain('positive integer');
  });

  it('should create new score record and sort rankings descending', () => {
    localScoreStorage.saveScore('PL1', 100);
    localScoreStorage.saveScore('PL2', 300);
    localScoreStorage.saveScore('PL3', 200);

    const scores = localScoreStorage.getScores();
    expect(scores).toHaveLength(3);
    
    // Ordered highest to lowest
    expect(scores[0].nick).toBe('PL2');
    expect(scores[0].score).toBe(300);
    expect(scores[1].nick).toBe('PL3');
    expect(scores[1].score).toBe(200);
    expect(scores[2].nick).toBe('PL1');
    expect(scores[2].score).toBe(100);
  });

  it('should only update scores if the new value is strictly greater', () => {
    // Initial score
    const r1 = localScoreStorage.saveScore('CHAMP', 500);
    expect(r1.success).toBe(true);
    expect(r1.message).toBe('Score registered!');

    // Save smaller score (should NOT update)
    const r2 = localScoreStorage.saveScore('CHAMP', 400);
    expect(r2.success).toBe(true);
    expect(r2.message).toContain('No update applied');
    
    let scores = localScoreStorage.getScores();
    expect(scores[0].score).toBe(500);

    // Save identical score (should NOT update)
    const r3 = localScoreStorage.saveScore('CHAMP', 500);
    expect(r3.success).toBe(true);
    expect(r3.message).toContain('No update applied');

    // Save greater score (should update!)
    const r4 = localScoreStorage.saveScore('CHAMP', 750);
    expect(r4.success).toBe(true);
    expect(r4.message).toBe('High score updated!');

    scores = localScoreStorage.getScores();
    expect(scores[0].score).toBe(750);
  });
});
