'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Tetromino shapes (4x4 grid representation)
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f0f0',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000f0',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f0a000',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#f0f000',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00f000',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a000f0',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#f00000',
  },
};

type TetrominoType = keyof typeof TETROMINOES;
type Cell = string | null;
type Grid = Cell[][];

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
  position: Position;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

const createEmptyGrid = (): Grid => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
};

const getRandomTetromino = (): Tetromino => {
  const types = Object.keys(TETROMINOES) as TetrominoType[];
  const type = types[Math.floor(Math.random() * types.length)];
  const { shape, color } = TETROMINOES[type];

  return {
    type,
    shape,
    color,
    position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2), y: 0 },
  };
};

const rotateTetromino = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rotated[x][rows - 1 - y] = shape[y][x];
    }
  }

  return rotated;
};

export default function TetrisPage() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [currentTetromino, setCurrentTetromino] = useState<Tetromino>(getRandomTetromino());
  const [nextTetromino, setNextTetromino] = useState<Tetromino>(getRandomTetromino());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const checkCollision = useCallback((tetromino: Tetromino, offsetX = 0, offsetY = 0): boolean => {
    for (let y = 0; y < tetromino.shape.length; y++) {
      for (let x = 0; x < tetromino.shape[y].length; x++) {
        if (tetromino.shape[y][x]) {
          const newX = tetromino.position.x + x + offsetX;
          const newY = tetromino.position.y + y + offsetY;

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && grid[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, [grid]);

  const mergeTetromino = useCallback(() => {
    const newGrid = grid.map(row => [...row]);

    for (let y = 0; y < currentTetromino.shape.length; y++) {
      for (let x = 0; x < currentTetromino.shape[y].length; x++) {
        if (currentTetromino.shape[y][x]) {
          const gridY = currentTetromino.position.y + y;
          const gridX = currentTetromino.position.x + x;

          if (gridY >= 0 && gridY < BOARD_HEIGHT && gridX >= 0 && gridX < BOARD_WIDTH) {
            newGrid[gridY][gridX] = currentTetromino.color;
          }
        }
      }
    }

    return newGrid;
  }, [currentTetromino, grid]);

  const clearLines = useCallback((gridToClear: Grid): { clearedGrid: Grid; linesCleared: number } => {
    const newGrid: Grid = [];
    let linesCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (gridToClear[y].every(cell => cell !== null)) {
        linesCleared++;
      } else {
        newGrid.unshift(gridToClear[y]);
      }
    }

    while (newGrid.length < BOARD_HEIGHT) {
      newGrid.unshift(Array(BOARD_WIDTH).fill(null));
    }

    return { clearedGrid: newGrid, linesCleared };
  }, []);

  const lockTetromino = useCallback(() => {
    const mergedGrid = mergeTetromino();
    const { clearedGrid, linesCleared } = clearLines(mergedGrid);

    setGrid(clearedGrid);
    setScore(prev => prev + linesCleared * 100);

    // Check game over
    if (checkCollision(nextTetromino, 0, 0)) {
      setGameOver(true);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    setCurrentTetromino(nextTetromino);
    setNextTetromino(getRandomTetromino());
  }, [mergeTetromino, clearLines, nextTetromino, checkCollision]);

  const moveDown = useCallback(() => {
    if (gameOver || isPaused) return;

    if (!checkCollision(currentTetromino, 0, 1)) {
      setCurrentTetromino(prev => ({
        ...prev,
        position: { ...prev.position, y: prev.position.y + 1 },
      }));
    } else {
      lockTetromino();
    }
  }, [currentTetromino, checkCollision, lockTetromino, gameOver, isPaused]);

  const moveLeft = useCallback(() => {
    if (!checkCollision(currentTetromino, -1, 0)) {
      setCurrentTetromino(prev => ({
        ...prev,
        position: { ...prev.position, x: prev.position.x - 1 },
      }));
    }
  }, [currentTetromino, checkCollision]);

  const moveRight = useCallback(() => {
    if (!checkCollision(currentTetromino, 1, 0)) {
      setCurrentTetromino(prev => ({
        ...prev,
        position: { ...prev.position, x: prev.position.x + 1 },
      }));
    }
  }, [currentTetromino, checkCollision]);

  const rotate = useCallback(() => {
    const rotated = rotateTetromino(currentTetromino.shape);
    const rotatedTetromino = { ...currentTetromino, shape: rotated };

    if (!checkCollision(rotatedTetromino, 0, 0)) {
      setCurrentTetromino(rotatedTetromino);
    }
  }, [currentTetromino, checkCollision]);

  const hardDrop = useCallback(() => {
    let dropDistance = 0;
    while (!checkCollision(currentTetromino, 0, dropDistance + 1)) {
      dropDistance++;
    }

    setCurrentTetromino(prev => ({
      ...prev,
      position: { ...prev.position, y: prev.position.y + dropDistance },
    }));

    setTimeout(() => lockTetromino(), 50);
  }, [currentTetromino, checkCollision, lockTetromino]);

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setCurrentTetromino(getRandomTetromino());
    setNextTetromino(getRandomTetromino());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
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
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop, gameOver]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      moveDown();
    }, 1000);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveDown, gameOver, isPaused]);

  // Render the game board with current tetromino
  const renderBoard = () => {
    const displayGrid = grid.map(row => [...row]);

    // Draw current tetromino on the display grid
    for (let y = 0; y < currentTetromino.shape.length; y++) {
      for (let x = 0; x < currentTetromino.shape[y].length; x++) {
        if (currentTetromino.shape[y][x]) {
          const gridY = currentTetromino.position.y + y;
          const gridX = currentTetromino.position.x + x;

          if (gridY >= 0 && gridY < BOARD_HEIGHT && gridX >= 0 && gridX < BOARD_WIDTH) {
            displayGrid[gridY][gridX] = currentTetromino.color;
          }
        }
      }
    }

    return displayGrid;
  };

  const displayGrid = renderBoard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          テトリス
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Main game board */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6">
            <div
              className="grid gap-[1px] bg-slate-700 p-[1px]"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
              }}
            >
              {displayGrid.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className="border border-slate-600"
                    style={{
                      width: `${CELL_SIZE}px`,
                      height: `${CELL_SIZE}px`,
                      backgroundColor: cell || '#1e293b',
                    }}
                  />
                ))
              )}
            </div>

            {gameOver && (
              <div className="mt-4 text-center">
                <p className="text-red-400 text-2xl font-bold mb-4">ゲームオーバー</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  もう一度プレイ
                </button>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="mt-4 text-center">
                <p className="text-yellow-400 text-2xl font-bold">一時停止中</p>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            {/* Score */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">スコア</h2>
              <p className="text-4xl font-bold text-blue-400">{score}</p>
            </div>

            {/* Next piece */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Next</h2>
              <div className="flex justify-center">
                <div
                  className="grid gap-[1px] bg-slate-700 p-[1px]"
                  style={{
                    gridTemplateColumns: `repeat(4, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(4, ${CELL_SIZE}px)`,
                  }}
                >
                  {Array.from({ length: 4 }, (_, y) =>
                    Array.from({ length: 4 }, (_, x) => {
                      const cell = nextTetromino.shape[y]?.[x];
                      return (
                        <div
                          key={`${y}-${x}`}
                          className="border border-slate-600"
                          style={{
                            width: `${CELL_SIZE}px`,
                            height: `${CELL_SIZE}px`,
                            backgroundColor: cell ? nextTetromino.color : '#1e293b',
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">操作方法</h2>
              <div className="space-y-2 text-sm text-slate-300">
                <p><span className="text-blue-400">←→</span>: 移動</p>
                <p><span className="text-blue-400">↓</span>: ソフトドロップ</p>
                <p><span className="text-blue-400">↑</span>: 回転</p>
                <p><span className="text-blue-400">スペース</span>: ハードドロップ</p>
                <p><span className="text-blue-400">P</span>: 一時停止</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
