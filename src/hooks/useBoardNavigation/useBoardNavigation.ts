import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type FocusEventHandler,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type RefObject,
} from "react";
import { CellData } from "../../models/types";

interface BoardNavigationReturn<T> {
  focusPosition: [number, number];
  focusActive: boolean;
  cellRefs: RefObject<Map<string, HTMLButtonElement | null>>;
  gameBoardRef: RefObject<HTMLDivElement | null>;
  lastFocusedCellRef: RefObject<string | null>;
  handleArrowKey: (key: string) => void;
  handleBoardFocus: FocusEventHandler<T>;
  handleBoardBlur: FocusEventHandler<T>;
  handleBoardKeyDown: KeyboardEventHandler<T>;
  handleCellClick: (
    x: number,
    y: number,
    onCellClick: (x: number, y: number) => void
  ) => void;
}

export function useBoardNavigation<T>(
  board: CellData[][]
): BoardNavigationReturn<T> {
  // Initialize focus position with safe values
  const [focusPosition, setFocusPosition] = useState<[number, number]>([0, 0]);
  const [focusActive, setFocusActive] = useState(false);

  // Create a mutable ref for tracking cells
  const cellRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  // Add a ref for the game board container
  const gameBoardRef = useRef<HTMLDivElement | null>(null);

  // Track the last focused cell to help maintain focus
  const lastFocusedCellRef = useRef<string | null>(null);

  // Efficiently calculate focus position using useMemo
  const nextFocusablePosition = useMemo((): [number, number] => {
    const rows = board.length;
    const cols = board[0]?.length || 0;

    if (rows === 0 || cols === 0) return [0, 0];

    // Check if current position is valid
    const [currY, currX] = focusPosition;
    if (currY < rows && currX < cols && !board[currY][currX].isRevealed) {
      return [currY, currX];
    }

    // Check if last focused position is valid
    if (lastFocusedCellRef.current) {
      const [y, x] = lastFocusedCellRef.current.split(",").map(Number);
      if (y < rows && x < cols && !board[y][x].isRevealed) {
        return [y, x];
      }
    }

    // Find the first unrevealed cell
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

  // Update focus position with memoized result
  useEffect(() => {
    // Update state only if the position has actually changed
    if (
      nextFocusablePosition[0] !== focusPosition[0] ||
      nextFocusablePosition[1] !== focusPosition[1]
    ) {
      setFocusPosition(nextFocusablePosition);
    }
  }, [nextFocusablePosition, focusPosition]);

  // Initialize ref map when board changes
  useEffect(() => {
    cellRefs.current.clear();
  }, [board]);

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

  // Cell click handler - removed unnecessary wasRevealed variable
  const handleCellClick = useCallback(
    (x: number, y: number, onCellClick: (x: number, y: number) => void) => {
      // Activate focus tracking
      setFocusActive(true);

      // Call the original click handler
      onCellClick(x, y);

      // The board state change will automatically recalculate nextFocusablePosition
    },
    [setFocusActive]
  );

  // Handle focus on the game board container
  const handleBoardFocus = useCallback(() => {
    setFocusActive(true);
    // nextFocusablePosition is automatically calculated, so no additional code is needed
  }, []);

  // Handle board container blur
  const handleBoardBlur = useCallback((e: FocusEvent<T>) => {
    // Only deactivate focus if focus is moving outside the board
    if (
      gameBoardRef.current &&
      e.relatedTarget &&
      !gameBoardRef.current.contains(e.relatedTarget as Node)
    ) {
      setFocusActive(false);
    }
  }, []);

  // Arrow key navigation logic
  const handleArrowKey = useCallback(
    (key: string) => {
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
    },
    [board, focusPosition]
  );

  // Handle keyboard navigation at the board level
  const handleBoardKeyDown = useCallback(
    (e: KeyboardEvent<T>) => {
      if (!focusActive) return;

      // Handle arrow keys directly
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        handleArrowKey(e.key);
      }
    },
    [focusActive, handleArrowKey]
  );

  return {
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
  };
}
