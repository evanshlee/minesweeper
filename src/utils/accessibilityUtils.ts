import type { CellData } from "../core/types";

/**
 * Function to generate ARIA label for a cell
 */
export function getCellAriaLabel(x: number, y: number, cell: CellData): string {
  const baseLabel = `Cell at row ${y + 1}, column ${x + 1}`;

  if (cell.isRevealed) {
    if (cell.isMine) {
      return `${baseLabel}, contains a mine. Game over.`;
    } else if (cell.adjacentMines > 0) {
      return `${baseLabel}, ${cell.adjacentMines} adjacent mines`;
    } else {
      return `${baseLabel}, empty cell`;
    }
  } else if (cell.isFlagged) {
    return `${baseLabel}, flagged as potential mine`;
  } else {
    return `${baseLabel}, unrevealed`;
  }
}
