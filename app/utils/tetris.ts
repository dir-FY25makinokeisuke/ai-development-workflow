// Tetrisゲームのユーティリティ関数（純粋関数）

import type { Board, Cell, Tetrimino, TetriminoType, Position } from '@/app/types/tetris';
import { BOARD_WIDTH, BOARD_HEIGHT } from '@/app/constants/tetris';

// Tetriminoの形状と色の定義
export const TETRIMINOS: Record<TetriminoType, Omit<Tetrimino, 'type'>> = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: 'bg-cyan-500',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'bg-blue-600',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'bg-orange-500',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-yellow-400',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'bg-green-500',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'bg-purple-500',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'bg-red-500',
  },
};

// 空のボードを作成
export const createEmptyBoard = (): Board => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
};

// ランダムなテトリミノを取得
export const getRandomTetrimino = (): Tetrimino => {
  const types: TetriminoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    type,
    ...TETRIMINOS[type],
  };
};

// テトリミノを回転
export const rotateTetrimino = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => 0)
  );

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rotated[col][rows - 1 - row] = shape[row][col];
    }
  }

  return rotated;
};

// 衝突判定
export const checkCollision = (
  board: Board,
  tetrimino: Tetrimino,
  position: Position
): boolean => {
  for (let row = 0; row < tetrimino.shape.length; row++) {
    for (let col = 0; col < tetrimino.shape[row].length; col++) {
      if (tetrimino.shape[row][col]) {
        const newX = position.x + col;
        const newY = position.y + row;

        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

// テトリミノをボードにマージ
export const mergeTetriminoToBoard = (
  board: Board,
  tetrimino: Tetrimino,
  position: Position
): Board => {
  const newBoard = board.map(row => [...row]);

  for (let row = 0; row < tetrimino.shape.length; row++) {
    for (let col = 0; col < tetrimino.shape[row].length; col++) {
      if (tetrimino.shape[row][col]) {
        const newY = position.y + row;
        const newX = position.x + col;
        if (newY >= 0) {
          newBoard[newY][newX] = tetrimino.type;
        }
      }
    }
  }

  return newBoard;
};

// ラインを消去
export const clearLines = (board: Board): { board: Board; linesCleared: number } => {
  const newBoard = board.filter(row => row.some(cell => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => null));
  }

  return { board: newBoard, linesCleared };
};

// セルの色を取得
export const getCellColor = (cell: Cell): string => {
  if (!cell) return 'bg-gray-800';
  return TETRIMINOS[cell].color;
};

// 表示用のボードを生成（現在のテトリミノを含む）
export const createDisplayBoard = (
  board: Board,
  currentTetrimino: Tetrimino,
  position: Position
): Board => {
  const display = board.map(row => [...row]);

  for (let row = 0; row < currentTetrimino.shape.length; row++) {
    for (let col = 0; col < currentTetrimino.shape[row].length; col++) {
      if (currentTetrimino.shape[row][col]) {
        const newY = position.y + row;
        const newX = position.x + col;
        if (newY >= 0 && newY < BOARD_HEIGHT && newX >= 0 && newX < BOARD_WIDTH) {
          display[newY][newX] = currentTetrimino.type;
        }
      }
    }
  }

  return display;
};
