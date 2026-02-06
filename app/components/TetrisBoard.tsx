// テトリスボード表示コンポーネント

import type { Board } from '@/app/types/tetris';
import { getCellColor } from '@/app/utils/tetris';
import { BOARD_WIDTH } from '@/app/constants/tetris';

interface TetrisBoardProps {
  board: Board;
}

export const TetrisBoard = ({ board }: TetrisBoardProps) => {
  return (
    <div
      className="grid gap-[1px] bg-gray-700 p-1 rounded-lg"
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1.5rem)`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`w-6 h-6 ${getCellColor(cell)} border border-gray-700 rounded-sm transition-colors`}
          />
        ))
      )}
    </div>
  );
};
