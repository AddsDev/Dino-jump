/**
 * Test hook installed on `window.__dino_test__` only in development builds.
 *
 * The whole module is imported behind `import.meta.env.DEV`, which Vite
 * statically evaluates to `false` for production bundles and tree-shakes
 * the entire file (including the `window` augmentation) out of `dist/`.
 *
 * Playwright E2E specs use this hook to deterministically trigger a
 * "game over" without having to simulate a collision on the canvas.
 */

export const DINO_TEST_GAMEOVER_EVENT = 'dino:test:gameover';

export interface DinoTestApi {
  triggerGameOver: (score: number) => void;
  isReady: () => boolean;
}

declare global {
  interface Window {
    __dino_test__?: DinoTestApi;
  }
}

export const installDevTestHook = (): void => {
  if (!import.meta.env.DEV) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  const api: DinoTestApi = {
    triggerGameOver: (score: number) => {
      const event = new CustomEvent<{ score: number }>(DINO_TEST_GAMEOVER_EVENT, {
        detail: { score },
      });
      window.dispatchEvent(event);
    },
    isReady: () => true,
  };

  window.__dino_test__ = api;
};
