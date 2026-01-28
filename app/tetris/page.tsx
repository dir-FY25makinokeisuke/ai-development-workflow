'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
type TetriminoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
type Cell = TetriminoType | null;
type Board = Cell[][];

interface Position {
  x: number;
  y: number;
}

interface Tetrimino {
  type: TetriminoType;
  shape: number[][];
  color: string;
}

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 1000;
const SPEED_INCREMENT = 50;

// Tetrimino shapes and colors
const TETRIMINOS: Record<TetriminoType, Omit<Tetrimino, 'type'>> = {
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

// Utility functions
const createEmptyBoard = (): Board => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
};

const getRandomTetrimino = (): Tetrimino => {
  const types: TetriminoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    type,
    ...TETRIMINOS[type],
  };
};

const rotateTetrimino = (shape: number[][]): number[][] => {
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

const checkCollision = (
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

const mergeTetriminoToBoard = (
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

const clearLines = (board: Board): { board: Board; linesCleared: number } => {
  const newBoard = board.filter(row => row.some(cell => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => null));
  }

  return { board: newBoard, linesCleared };
};

const getCellColor = (cell: Cell): string => {
  if (!cell) return 'bg-gray-800';
  return TETRIMINOS[cell].color;
};

export default function TetrisPage() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentTetrimino, setCurrentTetrimino] = useState<Tetrimino>(
    getRandomTetrimino()
  );
  const [nextTetrimino, setNextTetrimino] = useState<Tetrimino>(
    getRandomTetrimino()
  );
  const [position, setPosition] = useState<Position>({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const spawnNewTetrimino = useCallback(() => {
    const newTetrimino = nextTetrimino;
    const newPosition = { x: 3, y: 0 };

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
      setScore(prev => prev + linesCleared * 100);

      if (linesCleared > 0) {
        setSpeed(prev => Math.max(100, prev - SPEED_INCREMENT));
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

    setPosition(newPosition);
    moveDown();
  }, [board, currentTetrimino, position, moveDown]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentTetrimino(getRandomTetrimino());
    setNextTetrimino(getRandomTetrimino());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setSpeed(INITIAL_SPEED);
  };

  // Keyboard controls
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
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPaused, moveLeft, moveRight, moveDown, rotate, hardDrop]);

  // Game loop
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

  // Render board with current tetrimino
  const displayBoard = (): Board => {
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

  const renderBoard = displayBoard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          TETRIS
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Main game board */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
            <div
              className="grid gap-[1px] bg-gray-700 p-1 rounded-lg"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1.5rem)`,
              }}
            >
              {renderBoard.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-6 h-6 ${getCellColor(cell)} border border-gray-700 rounded-sm transition-colors`}
                  />
                ))
              )}
            </div>

            {gameOver && (
              <div className="mt-4 text-center">
                <p className="text-red-500 text-2xl font-bold mb-4">GAME OVER</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  リスタート
                </button>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="mt-4 text-center">
                <p className="text-yellow-400 text-2xl font-bold">PAUSED</p>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            {/* Score */}
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">スコア</h2>
              <p className="text-4xl font-bold text-blue-400">{score}</p>
            </div>

            {/* Next piece */}
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">次のブロック</h2>
              <div
                className="grid gap-[1px] bg-gray-700 p-2 rounded-lg w-fit"
                style={{
                  gridTemplateColumns: `repeat(4, 1.5rem)`,
                }}
              >
                {Array.from({ length: 4 }, (_, row) =>
                  Array.from({ length: 4 }, (_, col) => {
                    const isBlock =
                      row < nextTetrimino.shape.length &&
                      col < nextTetrimino.shape[row].length &&
                      nextTetrimino.shape[row][col];

                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`w-6 h-6 ${
                          isBlock ? TETRIMINOS[nextTetrimino.type].color : 'bg-gray-800'
                        } border border-gray-700 rounded-sm`}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">操作方法</h2>
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-blue-400 font-medium">←/→</span> : 左右移動</p>
                <p><span className="text-blue-400 font-medium">↓</span> : ソフトドロップ</p>
                <p><span className="text-blue-400 font-medium">↑</span> : 回転</p>
                <p><span className="text-blue-400 font-medium">スペース</span> : ハードドロップ</p>
                <p><span className="text-blue-400 font-medium">P</span> : 一時停止</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
