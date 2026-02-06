// キーボード操作を管理するカスタムフック

import { useEffect } from 'react';

interface UseKeyboardControlsProps {
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  rotate: () => void;
  hardDrop: () => void;
  togglePause: () => void;
  gameOver: boolean;
  isPaused: boolean;
}

export const useKeyboardControls = ({
  moveLeft,
  moveRight,
  moveDown,
  rotate,
  hardDrop,
  togglePause,
  gameOver,
  isPaused,
}: UseKeyboardControlsProps): void => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (!isPaused) moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!isPaused) moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isPaused) moveDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isPaused) rotate();
          break;
        case ' ':
          e.preventDefault();
          if (!isPaused) hardDrop();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPaused, moveLeft, moveRight, moveDown, rotate, hardDrop, togglePause]);
};
