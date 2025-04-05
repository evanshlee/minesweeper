import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { CellData, GameStatus } from "../../models/types";
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
  // Initialize focus position with safe values
  const [focusPosition, setFocusPosition] = useState<[number, number]>([0, 0]);
  const [focusActive, setFocusActive] = useState(false);

  // Create a mutable ref for tracking cells
  const cellRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  // Add a ref for the game board container
  const gameBoardRef = useRef<HTMLDivElement | null>(null);

  // Track the last focused cell to help maintain focus
  const lastFocusedCellRef = useRef<string | null>(null);

  const handleContextMenu = (
    e: React.MouseEvent,
    x: number,
    y: number
  ): void => {
    e.preventDefault();
    onCellFlag(x, y);
  };

  // Find a valid cell to focus on - simplified from useCallback
  const findFocusableCell = useCallback(() => {
    const rows = board.length;
    const cols = board[0]?.length || 0;

    if (rows === 0 || cols === 0) return [0, 0];

    // First try the current focus position
    const [currY, currX] = focusPosition;
    if (currY < rows && currX < cols && !board[currY][currX].isRevealed) {
      return [currY, currX];
    }

    // Then check if there is a last focused cell that's still valid
    if (lastFocusedCellRef.current) {
      const [y, x] = lastFocusedCellRef.current.split(",").map(Number);
      if (y < rows && x < cols && !board[y][x].isRevealed) {
        return [y, x];
      }
    }

    // Otherwise find the first unrevealed cell
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!board[y][x].isRevealed) {
          return [y, x];
        }
      }
    }

    // Fallback to [0, 0] if all cells are revealed
    return [0, 0];
  }, [board, focusPosition]);

  // Reset focus position when board dimensions change
  useEffect(() => {
    const [newY, newX] = findFocusableCell();
    setFocusPosition([newY, newX]);

    // Clear ref map when board changes
    cellRefs.current.clear();
  }, [board, findFocusableCell]);

  // Focus cell when focus position changes and focus is active
  useEffect(() => {
    if (!focusActive) return;

    const [y, x] = focusPosition;
    const key = `${y},${x}`;
    const element = cellRefs.current.get(key);

    if (element && document.activeElement !== element) {
      element.focus();
      lastFocusedCellRef.current = key;
    }
  }, [focusPosition, focusActive]);

  // Wrapper for cell click to maintain focus - simplified from useCallback
  const handleCellClick = (x: number, y: number) => {
    // Store the current state to compare after the click
    const wasRevealed = board[y][x].isRevealed;

    // Activate focus tracking
    setFocusActive(true);

    // Call the original click handler
    onCellClick(x, y);

    // If the cell wasn't revealed before, we need to find a new focus target
    if (!wasRevealed) {
      // Wait for the board state to update
      setTimeout(() => {
        const [newY, newX] = findFocusableCell();
        setFocusPosition([newY, newX]);
      }, 50);
    }
  };

  // Handle focus on the game board container - simplified from useCallback
  const handleBoardFocus = () => {
    setFocusActive(true);

    // Find a focusable cell and update position
    const [y, x] = findFocusableCell();
    setFocusPosition([y, x]);
  };

  // Handle board container blur
  const handleBoardBlur = (e: React.FocusEvent) => {
    // Only deactivate focus if focus is moving outside the board
    // Check if the relatedTarget (where focus is going) is within our component
    if (
      gameBoardRef.current &&
      e.relatedTarget &&
      !gameBoardRef.current.contains(e.relatedTarget as Node)
    ) {
      setFocusActive(false);
    }
  };

  // Simplified and fixed arrow key navigation logic
  const handleArrowKey = (key: string) => {
    const rows = board.length;
    const cols = board[0]?.length || 0;
    const [currY, currX] = focusPosition;

    // Calculate the new target position based on arrow key
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
      default:
        return; // Not an arrow key
    }

    // Allow focusing on any cell, including revealed ones
    setFocusPosition([newY, newX]);
  };

  // Handle keyboard navigation at the board level - simplified from useCallback
  const handleBoardKeyDown = (e: React.KeyboardEvent) => {
    if (!focusActive) return;

    // Handle arrow keys directly
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      handleArrowKey(e.key);
    }
  };

  // Keyboard navigation handler for individual cells - simplified from useCallback
  const handleKeyDown = (e: React.KeyboardEvent, x: number, y: number) => {
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
          handleCellClick(x, y);
        }
        break;
      case "Tab":
        // Let Tab event bubble up to allow natural tabbing
        // but track that we're leaving this component
        if (!e.shiftKey) {
          setFocusActive(false);
        }
        break;
      default:
        break;
    }
  };

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
            return (
              <button
                key={`${x}-${y}`}
                ref={(el) => {
                  cellRefs.current.set(key, el);
                }}
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
                onClick={() => handleCellClick(x, y)}
                onContextMenu={(e) => handleContextMenu(e, x, y)}
                onKeyDown={(e) => handleKeyDown(e, x, y)}
                onFocus={() => {
                  lastFocusedCellRef.current = key;
                  setFocusPosition([y, x]);
                }}
                // Only disable cells that are mines or when the game is over
                disabled={
                  (cell.isRevealed && cell.isMine) ||
                  gameStatus === "won" ||
                  gameStatus === "lost"
                }
                aria-label={getAriaLabel(x, y, cell)}
                aria-pressed={cell.isRevealed}
                // Allow any cell to receive focus by setting tabIndex correctly
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
