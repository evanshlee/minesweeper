import { act, renderHook } from "@testing-library/react";
import type { FocusEvent, KeyboardEvent } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { CellData } from "../../core/types";
import { useBoardNavigation } from "./useBoardNavigation";

// Create test board that matches the CellData interface exactly
const createTestBoard = (rows: number, cols: number): CellData[][] => {
  return Array(rows)
    .fill(null)
    .map((_, y) =>
      Array(cols)
        .fill(null)
        .map(
          (_, x): CellData => ({
            x,
            y,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
            isMine: false,
          })
        )
    );
};

beforeEach(() => {
  // Mock document.activeElement
  Object.defineProperty(document, "activeElement", {
    writable: true,
    value: null,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

test("initializes with correct default values", () => {
  // Arrange
  const boardSize = 4;
  const board = createTestBoard(boardSize, boardSize);

  // Act
  const { result } = renderHook(() => useBoardNavigation(board));

  // Assert
  expect(result.current.focusPosition).toEqual([0, 0]);
  expect(result.current.focusActive).toBe(false);
  expect(result.current.cellRefs.current).toBeDefined();
  expect(result.current.gameBoardRef.current).toBeNull();
});

test.each([
  { direction: "ArrowRight", expectedPos: [0, 1] },
  { direction: "ArrowDown", previousPos: [0, 1], expectedPos: [1, 1] },
  { direction: "ArrowLeft", previousPos: [1, 1], expectedPos: [1, 0] },
  { direction: "ArrowUp", previousPos: [1, 0], expectedPos: [0, 0] },
])(
  "updates focus to $expectedPos when $direction is pressed",
  ({ direction, previousPos, expectedPos }) => {
    // Arrange
    const board = createTestBoard(4, 4);
    const { result } = renderHook(() => useBoardNavigation(board));

    // Move to previous position if specified
    if (previousPos) {
      // Additional arrangement - setting up starting position
      if (previousPos[0] > 0) {
        act(() => {
          result.current.handleArrowKey("ArrowDown");
        });
      }
      if (previousPos[1] > 0) {
        act(() => {
          result.current.handleArrowKey("ArrowRight");
        });
      }
    }

    // Act
    act(() => {
      result.current.handleArrowKey(direction);
    });

    // Assert
    expect(result.current.focusPosition).toEqual(expectedPos);
  }
);

test.each([
  {
    description: "up from [0,0]",
    setupSteps: [],
    direction: "ArrowUp",
    expected: [0, 0],
  },
  {
    description: "left from [0,0]",
    setupSteps: [],
    direction: "ArrowLeft",
    expected: [0, 0],
  },
  {
    description: "right from [1,1]",
    setupSteps: ["ArrowRight", "ArrowDown"],
    direction: "ArrowRight",
    expected: [1, 1],
  },
  {
    description: "down from [1,1]",
    setupSteps: ["ArrowRight", "ArrowDown"],
    direction: "ArrowDown",
    expected: [1, 1],
  },
])(
  "prevents moving $description beyond board boundaries",
  ({ setupSteps, direction, expected }) => {
    // Arrange
    const board = createTestBoard(2, 2);
    const { result } = renderHook(() => useBoardNavigation(board));

    // Execute all setup steps to reach the starting position
    setupSteps?.forEach((step) => {
      act(() => {
        result.current.handleArrowKey(step);
      });
    });

    // Act
    act(() => {
      result.current.handleArrowKey(direction);
    });

    // Assert
    expect(result.current.focusPosition).toEqual(expected);
  }
);

test("focuses cell element when focus is active", () => {
  // Arrange
  const board = createTestBoard(3, 3);
  const { result } = renderHook(() => useBoardNavigation(board));
  const mockFocus = vi.fn();

  const mockButton = document.createElement("button");
  mockButton.setAttribute("data-testid", "cell-0-0");
  mockButton.focus = mockFocus;

  const key = "0,0";
  const map = new Map<string, HTMLButtonElement | null>();
  map.set(key, mockButton);

  // Set up refs and focus position
  act(() => {
    result.current.cellRefs.current = map;
    result.current.focusPosition = [0, 0];
  });

  // Act
  act(() => {
    result.current.handleBoardFocus();
  });

  // Assert
  expect(mockFocus).toHaveBeenCalled();
});

test("keeps track of last focused cell", () => {
  // Arrange
  const board = createTestBoard(3, 3);
  const { result } = renderHook(() => useBoardNavigation(board));
  const mockButton = document.createElement("button");
  const key = "1,1";
  const map = new Map<string, HTMLButtonElement | null>();
  map.set(key, mockButton);

  act(() => {
    result.current.cellRefs.current = map;
  });

  // Act - Click on a cell at [1,1]
  act(() => {
    result.current.handleCellClick(1, 1, vi.fn());
  });

  // Assert - Check if focus position is updated
  expect(result.current.focusPosition).toEqual([1, 1]);

  // Act - Move to a different cell and then back
  act(() => {
    result.current.handleArrowKey("ArrowRight"); // Move to [1, 2]
  });

  act(() => {
    result.current.handleCellClick(1, 1, vi.fn()); // Click back on [1, 1]
  });

  // Assert - Check if we're back to the original position
  expect(result.current.focusPosition).toEqual([1, 1]);
});

test("maintains mine revealed position", () => {
  // Arrange
  const board = createTestBoard(3, 3);
  board[1][1].isMine = true; // Mark cell as a mine
  const { result } = renderHook(() => useBoardNavigation(board));

  // Act - Move to mine position
  act(() => {
    result.current.handleArrowKey("ArrowRight");
    result.current.handleArrowKey("ArrowDown");
  });

  // Mock cell click callback that marks cell as revealed
  const mockCallback = vi.fn((x, y) => {
    board[y][x].isRevealed = true;
  });

  // Act - Click on the mine cell
  act(() => {
    result.current.handleCellClick(1, 1, mockCallback);
  });

  // Assert
  expect(mockCallback).toHaveBeenCalledWith(1, 1);
  expect(result.current.focusPosition).toEqual([1, 1]);

  // Act - Try to navigate away
  act(() => {
    result.current.handleArrowKey("ArrowRight");
  });

  // Assert - Focus should remain on mine
  expect(result.current.focusPosition).toEqual([1, 1]);
});

test("resets when board changes", () => {
  // Arrange
  const initialBoard = createTestBoard(3, 3);
  const { result, rerender } = renderHook(
    ({ board }) => useBoardNavigation(board),
    {
      initialProps: { board: initialBoard },
    }
  );

  // Act - First click on a cell, then change the board
  act(() => {
    result.current.handleCellClick(1, 1, vi.fn());
  });

  const newBoard = createTestBoard(4, 4);

  // Act - Rerender with new board
  rerender({ board: newBoard });

  // Assert
  expect(result.current.focusPosition).toEqual([0, 0]);
});

test("handles board focus events correctly", () => {
  // Arrange
  const board = createTestBoard(3, 3);
  const { result } = renderHook(() => useBoardNavigation(board));
  const gameBoard = document.createElement("div");
  const outsideElement = document.createElement("div");

  // Act - Focus on board
  act(() => {
    result.current.handleBoardFocus();
  });

  // Assert
  expect(result.current.focusActive).toBe(true);

  // Arrange for blur test
  result.current.gameBoardRef.current = gameBoard;
  const blurEvent = new FocusEvent("blur", {
    bubbles: true,
    relatedTarget: outsideElement,
  }) as unknown as FocusEvent;

  // Act - Blur event outside board
  act(() => {
    result.current.handleBoardBlur(blurEvent);
  });

  // Assert
  expect(result.current.focusActive).toBe(false);
});

test.each([
  { key: "ArrowRight", expectedPos: [0, 1], shouldPreventDefault: true },
  {
    key: "ArrowDown",
    expectedPos: [1, 1],
    previousPos: [0, 1],
    shouldPreventDefault: true,
  },
  {
    key: "Enter",
    expectedPos: [1, 1],
    previousPos: [1, 1],
    shouldPreventDefault: false,
  },
])(
  "handles $key key correctly in keyboard navigation",
  ({ key, expectedPos, previousPos, shouldPreventDefault }) => {
    // Arrange
    const board = createTestBoard(3, 3);
    const { result } = renderHook(() => useBoardNavigation(board));

    act(() => {
      result.current.handleBoardFocus();
    });

    // Set up previous position if needed
    if (previousPos) {
      if (previousPos[1] > 0) {
        act(() => {
          result.current.handleArrowKey("ArrowRight");
        });
      }
      if (previousPos[0] > 0) {
        act(() => {
          result.current.handleArrowKey("ArrowDown");
        });
      }
    }

    // Create event object for test
    const keyEvent = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    }) as unknown as KeyboardEvent;

    const preventDefaultSpy = vi.spyOn(keyEvent, "preventDefault");

    // Act
    act(() => {
      result.current.handleBoardKeyDown(keyEvent);
    });

    // Assert
    if (shouldPreventDefault) {
      expect(preventDefaultSpy).toHaveBeenCalled();
    } else {
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    }
    expect(result.current.focusPosition).toEqual(expectedPos);
  }
);
