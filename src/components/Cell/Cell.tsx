import type { FC, KeyboardEvent, MouseEvent } from "react";
import { CellData } from "../../models/types";
import { getCellAriaLabel } from "../../utils/accessibilityUtils";

interface CellProps {
  cell: CellData;
  x: number;
  y: number;
  isFocused: boolean;
  onCellClick: (x: number, y: number) => void;
  onCellFlag: (x: number, y: number) => void;
  onCellKeyDown: (e: KeyboardEvent, x: number, y: number) => void;
  onCellFocus: (x: number, y: number) => void;
  cellRef: (el: HTMLButtonElement | null) => void;
}

export const Cell: FC<CellProps> = ({
  cell,
  x,
  y,
  isFocused,
  onCellClick,
  onCellFlag,
  onCellKeyDown,
  onCellFocus,
  cellRef,
}) => {
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onCellFlag(x, y);
  };

  return (
    <button
      ref={cellRef}
      className={`
        cell
        ${cell.isRevealed ? "revealed" : ""}
        ${cell.isRevealed && cell.isMine ? "mine" : ""}
        ${cell.isFlagged ? "flagged" : ""}
        ${
          cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
            ? `adjacent-${cell.adjacentMines}`
            : ""
        }
      `}
      onClick={() => onCellClick(x, y)}
      onContextMenu={handleContextMenu}
      onKeyDown={(e) => onCellKeyDown(e, x, y)}
      onFocus={() => onCellFocus(x, y)}
      disabled={cell.isRevealed}
      aria-label={getCellAriaLabel(x, y, cell)}
      aria-pressed={cell.isRevealed}
      tabIndex={isFocused ? 0 : -1}
      role="gridcell"
    >
      {cell.isFlagged && !cell.isRevealed ? "🚩" : ""}
      {cell.isRevealed && cell.isMine ? "💣" : ""}
      {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
        ? cell.adjacentMines
        : ""}
    </button>
  );
};
