// ゲームループを管理するカスタムフック

import { useEffect, useRef } from 'react';

interface UseGameLoopProps {
  moveDown: () => void;
  gameOver: boolean;
  isPaused: boolean;
  speed: number;
}

export const useGameLoop = ({
  moveDown,
  gameOver,
  isPaused,
  speed,
}: UseGameLoopProps): void => {
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;

      if (deltaTime >= speed) {
        moveDown();
        lastTimeRef.current = currentTime;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameOver, isPaused, speed, moveDown]);
};
