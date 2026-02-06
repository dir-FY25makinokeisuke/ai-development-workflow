// Tetrisのゲームロジックを管理するカスタムフック

import { useState, useCallback } from 'react';
import type { Board, Tetrimino, Position } from '@/app/types/tetris';
import {
  createEmptyBoard,
  getRandomTetrimino,
  rotateTetrimino,
  checkCollision,
  mergeTetriminoToBoard,
  clearLines,
} from '@/app/utils/tetris';
import {
  INITIAL_SPEED,
  SPEED_INCREMENT,
  MIN_SPEED,
  POINTS_PER_LINE,
  INITIAL_POSITION_X,
  INITIAL_POSITION_Y,
} from '@/app/constants/tetris';

export interface UseTetrisGameReturn {
  board: Board;
  currentTetrimino: Tetrimino;
  nextTetrimino: Tetrimino;
  position: Position;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
  speed: number;
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  rotate: () => void;
  hardDrop: () => void;
  togglePause: () => void;
  resetGame: () => void;
}

export const useTetrisGame = (): UseTetrisGameReturn => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentTetrimino, setCurrentTetrimino] = useState<Tetrimino>(
    getRandomTetrimino()
  );
  const [nextTetrimino, setNextTetrimino] = useState<Tetrimino>(
    getRandomTetrimino()
  );
  const [position, setPosition] = useState<Position>({
    x: INITIAL_POSITION_X,
    y: INITIAL_POSITION_Y,
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const spawnNewTetrimino = useCallback(() => {
    const newTetrimino = nextTetrimino;
    const newPosition = { x: INITIAL_POSITION_X, y: INITIAL_POSITION_Y };

    if (checkCollision(board, newTetrimino, newPosition)) {
      setGameOver(true);
      return false;
    }

    setCurrentTetrimino(newTetrimino);
    setNextTetrimino(getRandomTetrimino());
    setPosition(newPosition);
    return true;
  }, [board, nextTetrimino]);

  const moveDown = useCallback(() => {
    const newPosition = { x: position.x, y: position.y + 1 };

    if (!checkCollision(board, currentTetrimino, newPosition)) {
      setPosition(newPosition);
    } else {
      const newBoard = mergeTetriminoToBoard(board, currentTetrimino, position);
      const { board: clearedBoard, linesCleared } = clearLines(newBoard);

      setBoard(clearedBoard);
      setScore(prev => prev + linesCleared * POINTS_PER_LINE);

      if (linesCleared > 0) {
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
      }

      if (!spawnNewTetrimino()) {
        return;
      }
    }
  }, [board, currentTetrimino, position, spawnNewTetrimino]);

  const moveLeft = useCallback(() => {
    const newPosition = { x: position.x - 1, y: position.y };
    if (!checkCollision(board, currentTetrimino, newPosition)) {
      setPosition(newPosition);
    }
  }, [board, currentTetrimino, position]);

  const moveRight = useCallback(() => {
    const newPosition = { x: position.x + 1, y: position.y };
    if (!checkCollision(board, currentTetrimino, newPosition)) {
      setPosition(newPosition);
    }
  }, [board, currentTetrimino, position]);

  const rotate = useCallback(() => {
    const rotated = rotateTetrimino(currentTetrimino.shape);
    const rotatedTetrimino = { ...currentTetrimino, shape: rotated };

    if (!checkCollision(board, rotatedTetrimino, position)) {
      setCurrentTetrimino(rotatedTetrimino);
    }
  }, [board, currentTetrimino, position]);

  const hardDrop = useCallback(() => {
    let newPosition = { ...position };

    while (!checkCollision(board, currentTetrimino, { x: newPosition.x, y: newPosition.y + 1 })) {
      newPosition.y += 1;
    }

    // 直接ボードにマージして新しいブロックをスポーン
    const newBoard = mergeTetriminoToBoard(board, currentTetrimino, newPosition);
    const { board: clearedBoard, linesCleared } = clearLines(newBoard);

    setBoard(clearedBoard);
    setScore(prev => prev + linesCleared * POINTS_PER_LINE);

    if (linesCleared > 0) {
      setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
    }

    spawnNewTetrimino();
  }, [board, currentTetrimino, position, spawnNewTetrimino]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentTetrimino(getRandomTetrimino());
    setNextTetrimino(getRandomTetrimino());
    setPosition({ x: INITIAL_POSITION_X, y: INITIAL_POSITION_Y });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setSpeed(INITIAL_SPEED);
  }, []);

  return {
    board,
    currentTetrimino,
    nextTetrimino,
    position,
    score,
    gameOver,
    isPaused,
    speed,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    togglePause,
    resetGame,
  };
};
