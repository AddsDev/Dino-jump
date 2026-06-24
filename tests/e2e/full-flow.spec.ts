import { test, expect } from '@playwright/test';
import { installHappyApiMock } from './mocks/handlers';

test.describe('Full user flow', () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage between tests so previous runs don't leak state.
    await context.clearCookies();
  });

  test('player can start, save score, see it in the leaderboard', async ({ page }) => {
    const state = await installHappyApiMock(page, {
      initialTop: [],
    });

    await page.goto('/');

    // 1. Welcome page renders with an empty leaderboard from the API
    await expect(page.getByRole('heading', { name: /DINO/i })).toBeVisible();
    await expect(page.getByTestId('leaderboard-source-badge')).toHaveText(/Global/i);
    await expect(page.getByText(/No scores recorded yet/i)).toBeVisible();

    // 2. Start the game
    await page.getByRole('button', { name: /Iniciar Misión/i }).click();
    await expect(page.getByTestId('game-canvas')).toBeVisible();

    // 3. Trigger a game over via the dev test hook
    await page.waitForFunction(() => Boolean((window as unknown as { __dino_test__?: { isReady: () => boolean } }).__dino_test__?.isReady?.()));
    await page.evaluate(() => {
      (window as unknown as { __dino_test__: { triggerGameOver: (s: number) => void } }).__dino_test__.triggerGameOver(1234);
    });

    // 4. Fill the nick and submit
    await expect(page.getByTestId('nick-input')).toBeVisible();
    await page.getByTestId('nick-input').fill('CYBER_E2E');
    await page.getByTestId('submit-score').click();

    // 5. Success message renders
    await expect(page.getByTestId('success-message')).toContainText(/registered/i);

    // 6. The page must have called the API submit and a follow-up top fetch
    expect(state.submitCalls).toEqual([{ nick: 'CYBER_E2E', score: 1234 }]);
    expect(state.topCalls).toBeGreaterThanOrEqual(1);

    // 7. Back to menu and confirm the leaderboard now shows the new entry
    await page.getByTestId('back-to-menu').click();
    await expect(page.getByTestId('leaderboard-source-badge')).toHaveText(/Global/i);
    await expect(page.getByText('CYBER_E2E')).toBeVisible();
    await expect(page.getByText('1234')).toBeVisible();
  });
});
