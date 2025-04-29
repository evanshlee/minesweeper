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
  const board = createTestBoard(4, 4);
  const { result } = renderHook(() => useBoardNavigation(board));

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
    const board = createTestBoard(4, 4);
    const { result } = renderHook(() => useBoardNavigation(board));

    // Move to previous position if specified
    if (previousPos) {
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

    act(() => {
      result.current.handleArrowKey(direction);
    });

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
    const board = createTestBoard(2, 2);
    const { result } = renderHook(() => useBoardNavigation(board));

    // Execute all setup steps to reach the starting position
    setupSteps?.forEach((step) => {
      act(() => {
        result.current.handleArrowKey(step);
      });
    });

    // Try to move out of bounds
    act(() => {
      result.current.handleArrowKey(direction);
    });

    expect(result.current.focusPosition).toEqual(expected);
  }
);

test("focuses cell element when focus is active", () => {
  const board = createTestBoard(3, 3);
  const { result } = renderHook(() => useBoardNavigation(board));

  const mockFocus = vi.fn();

  const mockButton = document.createElement("button");
  mockButton.setAttribute("data-testid", "cell-0-0"); // Add identifier for clarity

  mockButton.focus = mockFocus;

  // Use the exact key format expected by the hook - this must match how positionToKey works
  const key = "0,0"; // Make sure this exactly matches the key format in the hook
  const map = new Map<string, HTMLButtonElement | null>();
  map.set(key, mockButton);

  // Update the refs with our mock objects
  act(() => {
    result.current.cellRefs.current = map;
  });

  // Ensure focus position is set to [0,0]
  act(() => {
    result.current.focusPosition = [0, 0];
  });

  // Activate focus
  act(() => {
    result.current.handleBoardFocus();
  });

  // Verify focus was called
  expect(mockFocus).toHaveBeenCalled();
});

test("keeps track of last focused cell", () => {
  const board = createTestBoard(3, 3);
  const { result } = renderHook(() => useBoardNavigation(board));

  const mockButton = document.createElement("button");

  // Set the proper key format
  const key = "1,1";
  const map = new Map<string, HTMLButtonElement | null>();
  map.set(key, mockButton);

  // Update the refs
  act(() => {
    result.current.cellRefs.current = map;
  });

  // 직접 focusPosition을 설정하지 않고, handleCellClick 함수를 사용하여
  // 내부적으로 lastFocusedCellRef와 focusPosition이 업데이트되도록 함
  act(() => {
    result.current.handleCellClick(1, 1, vi.fn());
  });

  // 포커스 위치가 [1, 1]로 설정되었는지 확인
  expect(result.current.focusPosition).toEqual([1, 1]);

  // 다른 셀로 이동했다가 다시 돌아오는 테스트 추가
  act(() => {
    result.current.handleArrowKey("ArrowRight"); // [1, 2]로 이동
  });

  // 이전 포커스 셀로 다시 클릭
  act(() => {
    result.current.handleCellClick(1, 1, vi.fn());
  });

  // 다시 [1, 1]로 돌아왔는지 확인
  expect(result.current.focusPosition).toEqual([1, 1]);
});

test("maintains mine revealed position", () => {
  // Create a board with a mine at position [1,1]
  const board = createTestBoard(3, 3);
  board[1][1].isMine = true; // Explicitly mark cell as a mine

  const { result } = renderHook(() => useBoardNavigation(board));

  // Move to position [1,1] explicitly
  act(() => {
    result.current.handleArrowKey("ArrowRight");
    result.current.handleArrowKey("ArrowDown");
  });

  // Create a mock callback function that simulates game logic
  const mockCallback = vi.fn((x, y) => {
    // This function should be called when a cell is clicked
    // Mark the position [1,1] as revealed in our simulation
    board[y][x].isRevealed = true;
  });

  // Click the cell at [1,1] which is a mine
  act(() => {
    result.current.handleCellClick(1, 1, mockCallback);
  });

  // Verify the callback was called
  expect(mockCallback).toHaveBeenCalledWith(1, 1);

  // Verify the starting position before trying to navigate away
  expect(result.current.focusPosition).toEqual([1, 1]);

  // When we try to navigate, focus should stay at [1,1] because it's a mine
  act(() => {
    result.current.handleArrowKey("ArrowRight");
  });

  // Focus should stay at the "mine" position
  expect(result.current.focusPosition).toEqual([1, 1]);
});

test("resets when board changes", () => {
  const initialBoard = createTestBoard(3, 3);
  const { result, rerender } = renderHook(
    ({ board }) => useBoardNavigation(board),
    {
      initialProps: { board: initialBoard },
    }
  );

  // Click a cell
  act(() => {
    result.current.handleCellClick(1, 1, vi.fn());
  });

  // Create a new board and rerender
  const newBoard = createTestBoard(4, 4);
  rerender({ board: newBoard });

  expect(result.current.focusPosition).toEqual([0, 0]);
});

test("handles board focus events correctly", () => {
  const board = createTestBoard(3, 3);
  const { result } = renderHook(() => useBoardNavigation(board));

  act(() => {
    result.current.handleBoardFocus();
  });

  expect(result.current.focusActive).toBe(true);

  // 게임보드 ref를 div로 설정
  const gameBoard = document.createElement("div");
  result.current.gameBoardRef.current = gameBoard;

  // 보드 외부 요소 생성
  const outsideElement = document.createElement("div");

  // DOM API를 사용한 FocusEvent 객체 생성
  const blurEvent = new FocusEvent("blur", {
    bubbles: true,
    relatedTarget: outsideElement,
  }) as unknown as FocusEvent;

  act(() => {
    result.current.handleBoardBlur(blurEvent);
  });

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

    const keyEvent = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    }) as unknown as KeyboardEvent;

    const preventDefaultSpy = vi.spyOn(keyEvent, "preventDefault");

    act(() => {
      result.current.handleBoardKeyDown(keyEvent);
    });

    if (shouldPreventDefault) {
      expect(preventDefaultSpy).toHaveBeenCalled();
    } else {
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    }

    expect(result.current.focusPosition).toEqual(expectedPos);
  }
);
