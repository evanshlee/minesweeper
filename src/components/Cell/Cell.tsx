import React from "react";
import { CellData, GameStatus } from "../../models/types";
import { getCellAriaLabel } from "../../utils/accessibilityUtils";

interface CellProps {
  cell: CellData;
  x: number;
  y: number;
  gameStatus: GameStatus;
  isFocused: boolean;
  onCellClick: (x: number, y: number) => void;
  onCellFlag: (x: number, y: number) => void;
  onCellKeyDown: (e: React.KeyboardEvent, x: number, y: number) => void;
  onCellFocus: (x: number, y: number) => void;
  cellRef: (el: HTMLButtonElement | null) => void;
}

export const Cell: React.FC<CellProps> = ({
  cell,
  x,
  y,
  gameStatus,
  isFocused,
  onCellClick,
  onCellFlag,
  onCellKeyDown,
  onCellFocus,
  cellRef,
}) => {
  const handleContextMenu = (e: React.MouseEvent) => {
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
      disabled={
        (cell.isRevealed && cell.isMine) ||
        gameStatus === "won" ||
        gameStatus === "lost"
      }
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
