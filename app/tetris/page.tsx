'use client';

import { useTetrisGame } from '@/app/hooks/useTetrisGame';
import { useKeyboardControls } from '@/app/hooks/useKeyboardControls';
import { useGameLoop } from '@/app/hooks/useGameLoop';
import { TetrisBoard } from '@/app/components/TetrisBoard';
import { NextBlock } from '@/app/components/NextBlock';
import { ScoreDisplay } from '@/app/components/ScoreDisplay';
import { Controls } from '@/app/components/Controls';
import { createDisplayBoard } from '@/app/utils/tetris';

export default function TetrisPage() {
  const {
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
  } = useTetrisGame();

  useKeyboardControls({
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    togglePause,
    gameOver,
    isPaused,
  });

  useGameLoop({
    moveDown,
    gameOver,
    isPaused,
    speed,
  });

  const displayBoard = createDisplayBoard(board, currentTetrimino, position);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          TETRIS
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Main game board */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
            <TetrisBoard board={displayBoard} />

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
            <ScoreDisplay score={score} />
            <NextBlock nextTetrimino={nextTetrimino} />
            <Controls />
          </div>
        </div>
      </div>
    </div>
  );
}
