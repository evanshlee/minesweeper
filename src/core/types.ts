export type Difficulty = "beginner" | "intermediate" | "expert" | "custom";

export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface CellData {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

export interface BoardConfig {
  rows: number;
  columns: number;
  mines: number;
}
