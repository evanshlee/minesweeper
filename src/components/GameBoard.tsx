import React, { useCallback, useEffect, useRef, useState } from "react";
import { CellData, GameStatus } from "../models/types";
import "./GameBoard.css";

interface GameBoardProps {
  board: CellData[][];
  gameStatus: GameStatus;
  onCellClick: (x: number, y: number) => void;
  onCellFlag: (x: number, y: number) => void;
  "aria-describedby"?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  gameStatus,
  onCellClick,
  onCellFlag,
  "aria-describedby": ariaDescribedBy,
}) => {
  // Initialize focus position with safe values
  const [focusPosition, setFocusPosition] = useState<[number, number]>([0, 0]);

  // Create a mutable ref for tracking cells
  const cellRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const handleContextMenu = (
    e: React.MouseEvent,
    x: number,
    y: number
  ): void => {
    e.preventDefault();
    onCellFlag(x, y);
  };

  // Reset focus position when board dimensions change
  useEffect(() => {
    const rows = board.length;
    const cols = board[0]?.length || 0;

    // Ensure focus position is within valid board dimensions
    setFocusPosition(([y, x]) => [
      Math.min(y, rows - 1),
      Math.min(x, cols - 1),
    ]);

    // Clear ref map when board changes
    cellRefs.current.clear();
  }, [board]);

  // Focus on cell when focus position changes
  useEffect(() => {
    const [y, x] = focusPosition;
    const key = `${y},${x}`;
    const element = cellRefs.current.get(key);

    if (element && document.activeElement !== element) {
      element.focus();
    }
  }, [focusPosition]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, x: number, y: number) => {
      const rows = board.length;
      const cols = board[0]?.length || 0;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setFocusPosition(([cy, cx]) => [Math.max(0, cy - 1), cx]);
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusPosition(([cy, cx]) => [Math.min(rows - 1, cy + 1), cx]);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusPosition(([cy, cx]) => [cy, Math.max(0, cx - 1)]);
          break;
        case "ArrowRight":
          e.preventDefault();
          setFocusPosition(([cy, cx]) => [cy, Math.min(cols - 1, cx + 1)]);
          break;
        case "f":
        case "F":
          e.preventDefault();
          onCellFlag(x, y);
          break;
        case "Enter":
        case " ": // Space key
          e.preventDefault();
          if (!board[y][x].isFlagged) {
            onCellClick(x, y);
          }
          break;
        default:
          break;
      }
    },
    [board, onCellClick, onCellFlag]
  );

  // Announce current cell position to screen readers
  const getAriaLabel = (x: number, y: number, cell: CellData): string => {
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
  };

  return (
    <div
      className="game-board"
      data-testid="game-board"
      data-status={gameStatus}
      role="grid"
      aria-describedby={ariaDescribedBy}
      aria-label="Minesweeper game board"
    >
      {board.map((row, y) => (
        <div key={y} className="board-row" role="row">
          {row.map((cell, x) => {
            const key = `${y},${x}`;
            return (
              <button
                key={`${x}-${y}`}
                ref={(el) => cellRefs.current.set(key, el)}
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
                onContextMenu={(e) => handleContextMenu(e, x, y)}
                onKeyDown={(e) => handleKeyDown(e, x, y)}
                disabled={
                  cell.isRevealed ||
                  gameStatus === "won" ||
                  gameStatus === "lost"
                }
                aria-label={getAriaLabel(x, y, cell)}
                aria-pressed={cell.isRevealed}
                tabIndex={
                  focusPosition[0] === y && focusPosition[1] === x ? 0 : -1
                }
                role="gridcell"
              >
                {cell.isFlagged && !cell.isRevealed ? "🚩" : ""}
                {cell.isRevealed && cell.isMine ? "💣" : ""}
                {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
                  ? cell.adjacentMines
                  : ""}
              </button>
            );
          })}
        </div>
      ))}

      {gameStatus === "won" && (
        <div className="visually-hidden" role="status" aria-live="assertive">
          Congratulations! You've won the game!
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="visually-hidden" role="alert">
          Game over! You hit a mine.
        </div>
      )}
    </div>
  );
};

export default GameBoard;
