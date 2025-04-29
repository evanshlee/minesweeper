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
import { CellData } from "../../core/types";
import {
  calculateArrowKeyMovement,
  getBoardDimensions,
  keyToPosition,
  positionToKey,
} from "../../utils/navigationUtils";

interface BoardNavigationReturn<T> {
  focusPosition: [number, number];
  focusActive: boolean;
  cellRefs: RefObject<Map<string, HTMLButtonElement | null>>;
  gameBoardRef: RefObject<HTMLDivElement | null>;
  handleArrowKey: (key: string) => void;
  handleBoardFocus: () => void;
  handleBoardBlur: FocusEventHandler<T>;
  handleBoardKeyDown: KeyboardEventHandler<T>;
  handleCellClick: (
    x: number,
    y: number,
    onCellClick: (x: number, y: number) => void
  ) => void;
  handleCellFocus: (x: number, y: number) => void;
}

export function useBoardNavigation<T>(
  board: CellData[][]
): BoardNavigationReturn<T> {
  const [focusPosition, setFocusPosition] = useState<[number, number]>([0, 0]);
  const [focusActive, setFocusActive] = useState(false);

  const cellRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const gameBoardRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedCellRef = useRef<string | null>(null);
  const arrowKeyNavRef = useRef(false);
  const mineRevealedRef = useRef<string | null>(null);

  const dimensions = useMemo(() => getBoardDimensions(board), [board]);

  const nextFocusablePosition = useMemo((): [number, number] => {
    const { rows, cols } = dimensions;
    if (rows === 0 || cols === 0) return [0, 0];

    if (arrowKeyNavRef.current) {
      const [currY, currX] = focusPosition;
      if (currY >= 0 && currY < rows && currX >= 0 && currX < cols) {
        arrowKeyNavRef.current = false;
        return [currY, currX];
      }
    }

    // When a mine is revealed, we should prioritize staying on that position
    if (mineRevealedRef.current) {
      const [mineY, mineX] = keyToPosition(mineRevealedRef.current);
      if (mineY < rows && mineX < cols) {
        return [mineY, mineX];
      }
    }

    if (lastFocusedCellRef.current) {
      const [y, x] = keyToPosition(lastFocusedCellRef.current);
      if (y < rows && x < cols && !board[y][x].isRevealed) {
        return [y, x];
      }
    }

    const [currY, currX] = focusPosition;
    if (currY < rows && currX < cols && !board[currY][currX].isRevealed) {
      return [currY, currX];
    }

    // Find first unrevealed cell if current position is not suitable
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!board[y][x].isRevealed) {
          return [y, x];
        }
      }
    }

    return [0, 0];
  }, [board, dimensions, focusPosition]);

  useEffect(() => {
    if (
      nextFocusablePosition[0] !== focusPosition[0] ||
      nextFocusablePosition[1] !== focusPosition[1]
    ) {
      setFocusPosition(nextFocusablePosition);
    }
  }, [nextFocusablePosition, focusPosition]);

  // This effect is responsible for focusing the cell when focusActive changes or position changes
  useEffect(() => {
    if (!focusActive) return;

    const [y, x] = focusPosition;
    const key = positionToKey(y, x);
    const element = cellRefs.current.get(key);

    if (element && document.activeElement !== element) {
      // Actually call focus() on the element
      element.focus();
      lastFocusedCellRef.current = key;
    }
  }, [focusPosition, focusActive]);

  useEffect(() => {
    cellRefs.current.clear();
    setFocusPosition([0, 0]);

    // Don't reset mineRevealedRef yet as board might be updating after a mine click
    if (
      !mineRevealedRef.current ||
      !board.some((row) => row.some((cell) => cell.isRevealed && cell.isMine))
    ) {
      mineRevealedRef.current = null;
      lastFocusedCellRef.current = null;
    }
  }, [board]);

  const handleCellClick = useCallback(
    (x: number, y: number, onCellClick: (x: number, y: number) => void) => {
      setFocusActive(true);

      const key = positionToKey(y, x);
      lastFocusedCellRef.current = key;

      // If this is a mine cell, set the mineRevealedRef
      if (y < board.length && x < board[0].length && board[y][x].isMine) {
        mineRevealedRef.current = key;
      }

      // Explicitly set focus position to the clicked cell
      setFocusPosition([y, x]);

      onCellClick(x, y);
    },
    [board]
  );

  const handleBoardFocus = useCallback(() => {
    const [y, x] = focusPosition;
    const key = positionToKey(y, x);
    const element = cellRefs.current.get(key);

    if (element) {
      element.focus();
      lastFocusedCellRef.current = key;
    }

    setFocusActive(true);
  }, [focusPosition]);

  const handleCellFocus = useCallback(
    (x: number, y: number) => {
      const key = positionToKey(y, x);
      lastFocusedCellRef.current = key;
    },
    [lastFocusedCellRef]
  );

  const handleBoardBlur = useCallback((e: FocusEvent<T>) => {
    if (
      gameBoardRef.current &&
      e.relatedTarget &&
      !gameBoardRef.current.contains(e.relatedTarget as Node)
    ) {
      setFocusActive(false);
    }
  }, []);

  const handleArrowKey = useCallback(
    (key: string) => {
      // Don't navigate away from a mine that was just revealed
      if (mineRevealedRef.current) {
        const [mineY, mineX] = keyToPosition(mineRevealedRef.current);
        const [currY, currX] = focusPosition;

        if (mineY === currY && mineX === currX) {
          return; // Don't allow moving away from a revealed mine
        }
      }

      const newPosition = calculateArrowKeyMovement(
        key,
        focusPosition,
        dimensions
      );
      arrowKeyNavRef.current = true;
      setFocusPosition(newPosition);
    },
    [dimensions, focusPosition]
  );

  const handleBoardKeyDown = useCallback(
    (e: KeyboardEvent<T>) => {
      if (!focusActive) return;

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
    handleArrowKey,
    handleBoardFocus,
    handleBoardBlur,
    handleBoardKeyDown,
    handleCellClick,
    handleCellFocus,
  };
}
