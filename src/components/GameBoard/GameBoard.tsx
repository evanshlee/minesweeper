import { useCallback, type FC, type KeyboardEvent } from "react";
import { useBoardNavigation } from "../../hooks/useBoardNavigation/useBoardNavigation";
import { CellData, GameStatus } from "../../models/types";
import { Cell } from "../Cell/Cell";
import "./GameBoard.css";

interface GameBoardProps {
  board: CellData[][];
  gameStatus: GameStatus;
  onCellClick: (x: number, y: number) => void;
  onCellFlag: (x: number, y: number) => void;
  "aria-describedby"?: string;
}

const GameBoard: FC<GameBoardProps> = ({
  board,
  gameStatus,
  onCellClick,
  onCellFlag,
  "aria-describedby": ariaDescribedBy,
}) => {
  const {
    focusPosition,
    focusActive,
    cellRefs,
    gameBoardRef,
    handleArrowKey,
    handleBoardFocus,
    handleBoardBlur,
    handleBoardKeyDown,
    handleCellClick,
    handleCellFocus,
  } = useBoardNavigation<HTMLDivElement>(board);

  // Keyboard navigation handler for individual cells
  const handleKeyDown = useCallback(
    (e: KeyboardEvent, x: number, y: number) => {
      // Do not process key events if focus is not active
      if (!focusActive) return;

      // Handle arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        handleArrowKey(e.key);
        return;
      }

      switch (e.key) {
        case "f":
        case "F":
          e.preventDefault();
          onCellFlag(x, y);
          break;
        case "Enter":
        case " ": // Space key
          e.preventDefault();
          if (!board[y][x].isFlagged) {
            handleCellClick(x, y, onCellClick);
          }
          break;
        case "Tab":
          // Let Tab event bubble up to allow natural tabbing
          // but track that we're leaving this component
          break;
        default:
          break;
      }
    },
    [
      focusActive,
      handleArrowKey,
      onCellFlag,
      board,
      handleCellClick,
      onCellClick,
    ]
  );

  // Calculate current game state for aria-live announcements
  const gameStatusAnnouncement =
    gameStatus === "won"
      ? "Congratulations! You've won the game!"
      : gameStatus === "lost"
      ? "Game over! You hit a mine."
      : "";

  const rowCount = board.length;
  const columnCount = board[0]?.length || 0;

  return (
    <div
      className="game-board"
      data-testid="game-board"
      data-status={gameStatus}
      role="grid"
      aria-describedby={ariaDescribedBy}
      aria-label={`Minesweeper game board, ${rowCount} rows by ${columnCount} columns`}
      aria-rowcount={rowCount}
      aria-colcount={columnCount}
      ref={gameBoardRef}
      tabIndex={0}
      onFocus={handleBoardFocus}
      onBlur={handleBoardBlur}
      onKeyDown={handleBoardKeyDown}
    >
      {board.map((row, y) => (
        <div key={y} className="board-row" role="row" aria-rowindex={y + 1}>
          {row.map((cell, x) => {
            const key = `${y},${x}`;
            const isFocused = focusPosition[0] === y && focusPosition[1] === x;

            return (
              <Cell
                key={`${x}-${y}`}
                cell={cell}
                x={x}
                y={y}
                isFocused={isFocused}
                onCellClick={(x, y) => handleCellClick(x, y, onCellClick)}
                onCellFlag={onCellFlag}
                onCellKeyDown={handleKeyDown}
                onCellFocus={handleCellFocus}
                ref={(el) => cellRefs.current.set(key, el)}
              />
            );
          })}
        </div>
      ))}

      {gameStatusAnnouncement && (
        <div className="visually-hidden" role="status" aria-live="assertive">
          {gameStatusAnnouncement}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
