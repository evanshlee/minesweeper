import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { BoardConfig, Difficulty } from "../../core/types";
import { useGameState } from "./useGameState";

// Timer mock
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

// Small board configuration for predictable test results
const testConfig: BoardConfig = {
  rows: 4,
  columns: 4,
  mines: 3,
};

test("initializes with correct default values", () => {
  // Arrange
  const difficulty = "beginner";
  const expectedMines = 10;
  const expectedBoardSize = 9;

  // Act
  const { result } = renderHook(() => useGameState(difficulty));

  // Assert
  expect(result.current.gameStatus).toBe("idle");
  expect(result.current.timeElapsed).toBe(0);
  expect(result.current.minesRemaining).toBe(expectedMines); // Beginner mode has 10 mines
  expect(result.current.board.length).toBe(expectedBoardSize); // Beginner board is 9x9
  expect(result.current.board[0].length).toBe(expectedBoardSize);
});

test("resets the game state when resetGame is called", () => {
  // Arrange
  const { result } = renderHook(() => useGameState("custom", testConfig));

  // Act - First change state by clicking
  act(() => {
    result.current.handleCellClick(0, 0);
  });

  // Assert - Verify game started
  expect(result.current.gameStatus).toBe("playing");

  // Act - Reset the game
  act(() => {
    result.current.resetGame();
  });

  // Assert - Verify reset state
  expect(result.current.gameStatus).toBe("idle");
  expect(result.current.timeElapsed).toBe(0);
  expect(result.current.minesRemaining).toBe(testConfig.mines);
});

test("handles the first click correctly", () => {
  // Arrange
  const { result } = renderHook(() => useGameState("custom", testConfig));
  const clickX = 0;
  const clickY = 0;

  // Act - Perform first click
  act(() => {
    result.current.handleCellClick(clickX, clickY);
  });

  // Assert
  expect(result.current.gameStatus).toBe("playing");
  expect(result.current.board[clickY][clickX].isRevealed).toBe(true);
  expect(result.current.board[clickY][clickX].isMine).toBe(false); // First click is always safe
  expect(result.current.timeElapsed).toBe(0); // Timer starts at 0
});

test("handles revealing a non-mine cell correctly", () => {
  // Arrange
  const { result } = renderHook(() => useGameState("custom", testConfig));

  // Act - First click to start the game
  act(() => {
    result.current.handleCellClick(0, 0);
  });

  // Arrange - Find a non-mine cell to click
  let nonMineX = -1,
    nonMineY = -1;
  for (let y = 0; y < result.current.board.length; y++) {
    for (let x = 0; x < result.current.board[0].length; x++) {
      if (
        !result.current.board[y][x].isMine &&
        !result.current.board[y][x].isRevealed
      ) {
        nonMineX = x;
        nonMineY = y;
        break;
      }
    }
    if (nonMineX !== -1) break;
  }

  // Act - Click on the non-mine cell (if found)
  if (nonMineX !== -1) {
    act(() => {
      result.current.handleCellClick(nonMineX, nonMineY);
    });

    // Assert
    expect(result.current.board[nonMineY][nonMineX].isRevealed).toBe(true);
    expect(result.current.gameStatus).toBe("playing");
  }
});

test("handles flagging a cell correctly", () => {
  // Arrange
  const { result } = renderHook(() => useGameState("custom", testConfig));
  const cellX = 0;
  const cellY = 0;

  // Act - Flag a cell
  act(() => {
    result.current.handleCellFlag(cellX, cellY);
  });

  // Assert
  expect(result.current.minesRemaining).toBe(testConfig.mines - 1);
  expect(result.current.board[cellY][cellX].isFlagged).toBe(true);

  // Act - Unflag the same cell
  act(() => {
    result.current.handleCellFlag(cellX, cellY);
  });

  // Assert
  expect(result.current.minesRemaining).toBe(testConfig.mines);
  expect(result.current.board[cellY][cellX].isFlagged).toBe(false);
});

test("starts timer when game begins and stops when game ends", () => {
  // Arrange
  const { result } = renderHook(() => useGameState("custom", testConfig));
  const initialClickX = 0;
  const initialClickY = 0;

  // Act - First click to start game
  act(() => {
    result.current.handleCellClick(initialClickX, initialClickY);
  });

  // Assert - Timer should start at 0
  expect(result.current.timeElapsed).toBe(0);

  // Act - Advance timer
  act(() => {
    vi.advanceTimersByTime(3000); // 3 seconds
  });

  // Assert - Timer should advance
  expect(result.current.timeElapsed).toBe(3);

  // Arrange - Find a mine to end the game
  let mineX = -1,
    mineY = -1;

  for (let y = 0; y < result.current.board.length; y++) {
    for (let x = 0; x < result.current.board[0].length; x++) {
      if (result.current.board[y][x].isMine) {
        mineX = x;
        mineY = y;
        break;
      }
    }
    if (mineX !== -1) break;
  }

  if (mineX !== -1) {
    // Act - Click on a mine to end game
    act(() => {
      result.current.handleCellClick(mineX, mineY);
    });

    // Assert - Game should be lost
    expect(result.current.gameStatus).toBe("lost");

    // Act - Try to advance timer further
    act(() => {
      vi.advanceTimersByTime(2000); // 2 more seconds
    });

    // Assert - Time should remain at 3 (timer stopped)
    expect(result.current.timeElapsed).toBe(3);
  }
});

test("resets game when difficulty changes", () => {
  // Arrange
  const initialDifficulty = "beginner";
  const newDifficulty = "intermediate";
  const expectedMines = 40; // Intermediate mode has 40 mines

  const { result, rerender } = renderHook(
    (props: { difficulty: Difficulty; customConfig?: BoardConfig }) =>
      useGameState(props.difficulty, props.customConfig),
    { initialProps: { difficulty: initialDifficulty } }
  );

  // Act - First click to start game
  act(() => {
    result.current.handleCellClick(0, 0);
  });

  // Assert - Game should be playing
  expect(result.current.gameStatus).toBe("playing");

  // Act - Change difficulty
  rerender({ difficulty: newDifficulty });

  // Assert - Game should reset
  expect(result.current.gameStatus).toBe("idle");
  expect(result.current.minesRemaining).toBe(expectedMines);
});
