import { CellData } from "../core/types";

export interface BoardDimensions {
  rows: number;
  cols: number;
}

export const positionToKey = (y: number, x: number): string => `${y},${x}`;

export const keyToPosition = (key: string): [number, number] =>
  key.split(",").map(Number) as [number, number];

export const getBoardDimensions = (board: CellData[][]): BoardDimensions => ({
  rows: board.length,
  cols: board[0]?.length || 0,
});

export const calculateArrowKeyMovement = (
  key: string,
  currentPos: [number, number],
  dimensions: BoardDimensions
): [number, number] => {
  const { rows, cols } = dimensions;
  const [currY, currX] = currentPos;
  let newY = currY;
  let newX = currX;

  switch (key) {
    case "ArrowUp":
      newY = Math.max(0, currY - 1);
      break;
    case "ArrowDown":
      newY = Math.min(rows - 1, currY + 1);
      break;
    case "ArrowLeft":
      newX = Math.max(0, currX - 1);
      break;
    case "ArrowRight":
      newX = Math.min(cols - 1, currX + 1);
      break;
  }

  return [newY, newX];
};
