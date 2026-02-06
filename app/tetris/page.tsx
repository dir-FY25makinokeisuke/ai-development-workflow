'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// テトリミノの種類と形状の定義
type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
}

// テトリミノの定義（標準的な色で）
const TETROMINOS: Record<TetrominoType, Omit<Tetromino, 'type'>> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f0f0', // Cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000f0', // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f0a000', // Orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#f0f000', // Yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00f000', // Green
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a000f0', // Purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#f00000', // Red
  },
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

// ボードの初期化
const createEmptyBoard = (): number[][] => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(EMPTY_CELL)
  );
};

// ランダムなテトリミノを生成
const getRandomTetromino = (): Tetromino => {
  const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    type,
    ...TETROMINOS[type],
  };
};

// テトリミノを回転
const rotateTetromino = (shape: number[][]): number[][] => {
  const n = shape.length;
  const rotated = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[j][n - 1 - i] = shape[i][j];
    }
  }

  return rotated;
};

export default function TetrisPage() {
  const [board, setBoard] = useState<number[][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // 衝突判定
  const checkCollision = useCallback(
    (piece: Tetromino, position: Position, boardState: number[][]): boolean => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x] !== 0) {
            const newX = position.x + x;
            const newY = position.y + y;

            if (
              newX < 0 ||
              newX >= BOARD_WIDTH ||
              newY >= BOARD_HEIGHT ||
              (newY >= 0 && boardState[newY][newX] !== EMPTY_CELL)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  // ピースをボードに固定
  const mergePieceToBoard = useCallback(
    (piece: Tetromino, position: Position, boardState: number[][]): number[][] => {
      const newBoard = boardState.map(row => [...row]);

      piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            const newY = position.y + y;
            const newX = position.x + x;
            if (newY >= 0 && newY < BOARD_HEIGHT && newX >= 0 && newX < BOARD_WIDTH) {
              newBoard[newY][newX] = 1;
            }
          }
        });
      });

      return newBoard;
    },
    []
  );

  // ライン消去
  const clearLines = useCallback((boardState: number[][]): { newBoard: number[][]; linesCleared: number } => {
    let linesCleared = 0;
    const newBoard = boardState.filter(row => {
      if (row.every(cell => cell !== EMPTY_CELL)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    // 消去された行数分、上に空の行を追加
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
    }

    return { newBoard, linesCleared };
  }, []);

  // 新しいピースを生成
  const spawnNewPiece = useCallback(() => {
    if (!nextPiece) return;

    const newPiece = nextPiece;
    const newPosition = {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2),
      y: 0,
    };

    if (checkCollision(newPiece, newPosition, board)) {
      setGameOver(true);
      return;
    }

    setCurrentPiece(newPiece);
    setCurrentPosition(newPosition);
    setNextPiece(getRandomTetromino());
  }, [nextPiece, board, checkCollision]);

  // ピースを移動
  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameOver || isPaused) return;

      const newPosition = {
        x: currentPosition.x + dx,
        y: currentPosition.y + dy,
      };

      if (!checkCollision(currentPiece, newPosition, board)) {
        setCurrentPosition(newPosition);
        return true;
      }

      // 下方向への移動で衝突した場合、ピースを固定
      if (dy > 0) {
        const newBoard = mergePieceToBoard(currentPiece, currentPosition, board);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

        setBoard(clearedBoard);
        setScore(prev => prev + linesCleared * 100);
        spawnNewPiece();
      }

      return false;
    },
    [currentPiece, currentPosition, board, gameOver, isPaused, checkCollision, mergePieceToBoard, clearLines, spawnNewPiece]
  );

  // ピースを回転
  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotatedShape = rotateTetromino(currentPiece.shape);
    const rotatedPiece = { ...currentPiece, shape: rotatedShape };

    if (!checkCollision(rotatedPiece, currentPosition, board)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, currentPosition, board, gameOver, isPaused, checkCollision]);

  // ハードドロップ
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let newY = currentPosition.y;
    while (
      !checkCollision(
        currentPiece,
        { x: currentPosition.x, y: newY + 1 },
        board
      )
    ) {
      newY++;
    }

    const newPosition = { x: currentPosition.x, y: newY };
    const newBoard = mergePieceToBoard(currentPiece, newPosition, board);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

    setBoard(clearedBoard);
    setScore(prev => prev + linesCleared * 100 + (newY - currentPosition.y) * 2);
    spawnNewPiece();
  }, [currentPiece, currentPosition, board, gameOver, isPaused, checkCollision, mergePieceToBoard, clearLines, spawnNewPiece]);

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotatePiece();
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
  }, [movePiece, rotatePiece, hardDrop, gameOver]);

  // ゲームループ
  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      movePiece(0, 1);
    }, 1000);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [movePiece, gameOver, isPaused]);

  // ゲーム初期化
  useEffect(() => {
    setNextPiece(getRandomTetromino());
    setCurrentPiece(getRandomTetromino());
    setCurrentPosition({
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
    });
  }, []);

  // リスタート
  const restart = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setNextPiece(getRandomTetromino());
    setCurrentPiece(getRandomTetromino());
    setCurrentPosition({
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
    });
  };

  // ボードのレンダリング用配列を作成
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    // 現在のピースを描画
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            const newY = currentPosition.y + y;
            const newX = currentPosition.x + x;
            if (newY >= 0 && newY < BOARD_HEIGHT && newX >= 0 && newX < BOARD_WIDTH) {
              displayBoard[newY][newX] = 2; // 現在のピースを示す値
            }
          }
        });
      });
    }

    return displayBoard;
  };

  const displayBoard = renderBoard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          TETRIS
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
          {/* メインゲームボード */}
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-8">
            <div
              className="grid gap-[1px] bg-gray-700"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, 28px)`,
                gridTemplateRows: `repeat(${BOARD_HEIGHT}, 28px)`,
              }}
            >
              {displayBoard.map((row, y) =>
                row.map((cell, x) => {
                  let bgColor = 'bg-gray-950';

                  if (cell === 1) {
                    bgColor = 'bg-gray-400';
                  } else if (cell === 2 && currentPiece) {
                    bgColor = `bg-[${currentPiece.color}]`;
                  }

                  return (
                    <div
                      key={`${y}-${x}`}
                      className={`${bgColor} border border-gray-800`}
                      style={{
                        backgroundColor: cell === 2 && currentPiece ? currentPiece.color : undefined,
                      }}
                    />
                  );
                })
              )}
            </div>

            {gameOver && (
              <div className="mt-4 text-center">
                <p className="text-red-500 text-2xl font-bold mb-4">GAME OVER</p>
                <button
                  onClick={restart}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  リスタート
                </button>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="mt-4 text-center">
                <p className="text-yellow-500 text-2xl font-bold">PAUSED</p>
              </div>
            )}
          </div>

          {/* サイドパネル */}
          <div className="flex flex-col gap-6">
            {/* スコア */}
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-6">
              <h2 className="text-white text-xl font-bold mb-4">スコア</h2>
              <p className="text-4xl font-bold text-blue-400">{score}</p>
            </div>

            {/* Next */}
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-6">
              <h2 className="text-white text-xl font-bold mb-4">Next</h2>
              {nextPiece && (
                <div
                  className="grid gap-[1px] bg-gray-700 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 24px)`,
                    gridTemplateRows: `repeat(${nextPiece.shape.length}, 24px)`,
                    width: 'fit-content',
                  }}
                >
                  {nextPiece.shape.map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`${y}-${x}`}
                        className={`border border-gray-800`}
                        style={{
                          backgroundColor: cell !== 0 ? nextPiece.color : '#0a0a0a',
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 操作方法 */}
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-6">
              <h2 className="text-white text-xl font-bold mb-4">操作方法</h2>
              <div className="text-gray-300 text-sm space-y-2">
                <p>← → : 移動</p>
                <p>↓ : ソフトドロップ</p>
                <p>↑ : 回転</p>
                <p>Space : ハードドロップ</p>
                <p>P : 一時停止</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
