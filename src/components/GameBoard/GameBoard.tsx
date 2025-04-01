import React from "react";
import { CellData, GameStatus } from "../../models/types";
import "./GameBoard.css";

interface GameBoardProps {
  board: CellData[][];
  gameStatus: GameStatus;
  onCellClick: (x: number, y: number) => void;
  onCellFlag: (x: number, y: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  gameStatus,
  onCellClick,
  onCellFlag,
}) => {
  const handleContextMenu = (
    e: React.MouseEvent,
    x: number,
    y: number
  ): void => {
    e.preventDefault();
    onCellFlag(x, y);
  };

  return (
    <div
      className="game-board"
      data-testid="game-board"
      data-status={gameStatus}
    >
      {board.map((row, y) => (
        <div key={y} className="board-row">
          {row.map((cell, x) => (
            <button
              key={`${x}-${y}`}
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
              disabled={
                cell.isRevealed || gameStatus === "won" || gameStatus === "lost"
              }
              aria-label={`Cell at row ${y + 1}, column ${x + 1}`}
            >
              {cell.isFlagged && !cell.isRevealed ? "🚩" : ""}
              {cell.isRevealed && cell.isMine ? "💣" : ""}
              {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
                ? cell.adjacentMines
                : ""}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
