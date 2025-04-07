import { useCallback, type FC } from "react";
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
    lastFocusedCellRef,
    handleArrowKey,
    handleBoardFocus,
    handleBoardBlur,
    handleBoardKeyDown,
    handleCellClick,
  } = useBoardNavigation<HTMLDivElement>(board);

  // Keyboard navigation handler for individual cells
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, x: number, y: number) => {
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

  const handleCellFocus = useCallback(
    (x: number, y: number) => {
      lastFocusedCellRef.current = `${x},${y}`;
    },
    [lastFocusedCellRef]
  );

  return (
    <div
      className="game-board"
      data-testid="game-board"
      data-status={gameStatus}
      role="grid"
      aria-describedby={ariaDescribedBy}
      aria-label="Minesweeper game board"
      ref={gameBoardRef}
      tabIndex={0}
      onFocus={handleBoardFocus}
      onBlur={handleBoardBlur}
      onKeyDown={handleBoardKeyDown}
    >
      {board.map((row, y) => (
        <div key={y} className="board-row" role="row">
          {row.map((cell, x) => {
            const key = `${y},${x}`;
            const isFocused = focusPosition[0] === y && focusPosition[1] === x;

            return (
              <Cell
                key={`${x}-${y}`}
                cell={cell}
                x={x}
                y={y}
                gameStatus={gameStatus}
                isFocused={isFocused}
                onCellClick={(x, y) => handleCellClick(x, y, onCellClick)}
                onCellFlag={onCellFlag}
                onCellKeyDown={handleKeyDown}
                onCellFocus={handleCellFocus}
                cellRef={(el) => cellRefs.current.set(key, el)}
              />
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
