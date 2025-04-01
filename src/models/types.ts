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

export const DifficultySettings: Record<
  Exclude<Difficulty, "custom">,
  BoardConfig
> = {
  beginner: {
    rows: 9,
    columns: 9,
    mines: 10,
  },
  intermediate: {
    rows: 16,
    columns: 16,
    mines: 40,
  },
  expert: {
    rows: 16,
    columns: 30,
    mines: 99,
  },
};
