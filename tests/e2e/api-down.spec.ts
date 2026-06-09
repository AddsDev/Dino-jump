import { test, expect } from '@playwright/test';
import { installApiDownMock } from './mocks/handlers';

test.describe('API down fallback', () => {
  test('leaderboard shows offline badge and save still works via localStorage', async ({ page }) => {
    // Seed localStorage so the fallback path can render a "Local" badge.
    await page.addInitScript(() => {
      localStorage.setItem(
        'dino_runner_scores',
        JSON.stringify([{ nick: 'SEEDED', score: 1, date: new Date().toISOString() }])
      );
    });

    await installApiDownMock(page);

    await page.goto('/');

    // 1. Welcome page shows the "Local (offline)" badge because the API fetch failed
    await expect(page.getByTestId('leaderboard-source-badge')).toHaveText(/Local/i);
    await expect(page.getByTestId('leaderboard-error')).toBeVisible();

    // 2. Start the game
    await page.getByRole('button', { name: /Iniciar Misión/i }).click();
    await expect(page.getByTestId('game-canvas')).toBeVisible();

    // 3. Trigger a game over
    await page.waitForFunction(() => Boolean((window as unknown as { __dino_test__?: { isReady: () => boolean } }).__dino_test__?.isReady?.()));
    await page.evaluate(() => {
      (window as unknown as { __dino_test__: { triggerGameOver: (s: number) => void } }).__dino_test__.triggerGameOver(777);
    });

    // 4. Save the score — submit fails, fallback to localStorage
    await page.getByTestId('nick-input').fill('OFFLINE_NICK');
    await page.getByTestId('submit-score').click();

    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('fallback-notice')).toBeVisible();

    // 5. The local entry is persisted alongside the seed
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('dino_runner_scores');
      return raw ? JSON.parse(raw) : null;
    });
    expect(stored).toBeTruthy();
    const nicks = stored.map((s: { nick: string }) => s.nick);
    expect(nicks).toContain('OFFLINE_NICK');
    const offline = stored.find((s: { nick: string }) => s.nick === 'OFFLINE_NICK');
    expect(offline.score).toBe(777);
  });
});
