import { useEffect } from 'react';

interface KeyboardCallbacks {
  onJump?: () => void;
  onDuck?: (ducking: boolean) => void;
  onStart?: () => void;
}

export const useKeyboardControls = (callbacks: KeyboardCallbacks, active: boolean) => {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scroll behavior for game control keys
      if (['Space', ' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowUp') {
        if (callbacks.onJump) callbacks.onJump();
      }

      if (e.key === 'ArrowDown') {
        if (callbacks.onDuck) callbacks.onDuck(true);
      }

      if (e.key === 'Enter') {
        if (callbacks.onStart) callbacks.onStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        if (callbacks.onDuck) callbacks.onDuck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [callbacks, active]);
};
