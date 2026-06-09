import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Dino Runner E2E suite.
 *
 * - Runs the Vite dev server for the web app.
 * - Mock the API at the network level via `page.route()` in the specs,
 *   so the tests are self-contained and don't need a real backend.
 * - No real `npm run start` server is launched.
 */
export default defineConfig({
  testDir: '..',
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['github'], ['list']]
    : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5173',
    cwd: '../../apps/web',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      VITE_API_BASE_URL: 'http://localhost:3001',
    },
  },
});
