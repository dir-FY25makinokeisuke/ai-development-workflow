// Tetrisゲームの型定義

export type TetriminoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
export type Cell = TetriminoType | null;
export type Board = Cell[][];

export interface Position {
  x: number;
  y: number;
}

export interface Tetrimino {
  type: TetriminoType;
  shape: number[][];
  color: string;
}
