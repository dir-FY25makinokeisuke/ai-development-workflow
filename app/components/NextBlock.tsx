// 次のブロック表示コンポーネント

import type { Tetrimino } from '@/app/types/tetris';
import { TETRIMINOS } from '@/app/utils/tetris';

interface NextBlockProps {
  nextTetrimino: Tetrimino;
}

export const NextBlock = ({ nextTetrimino }: NextBlockProps) => {
  return (
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
  );
};
