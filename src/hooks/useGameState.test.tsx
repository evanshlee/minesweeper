import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { BoardConfig, Difficulty } from "../models/types";
import * as gameUtils from "../utils/gameUtils";
import { useGameState } from "./useGameState";

// Timer mock
beforeEach(() => {
  vi.useFakeTimers();
  // Set up spies to track function calls
  vi.spyOn(gameUtils, "initializeBoard");
  vi.spyOn(gameUtils, "placeMines");
  vi.spyOn(gameUtils, "revealCell");
  vi.spyOn(gameUtils, "checkWinCondition");
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
  const { result } = renderHook(() => useGameState("beginner"));

  expect(result.current.gameStatus).toBe("idle");
  expect(result.current.timeElapsed).toBe(0);
  expect(result.current.minesRemaining).toBe(10); // Beginner mode has 10 mines
  expect(result.current.board.length).toBe(9); // Beginner board is 9x9
  expect(result.current.board[0].length).toBe(9);
});

test("resets the game state when resetGame is called", () => {
  const { result } = renderHook(() => useGameState("custom", testConfig));

  // Change some state
  act(() => {
    result.current.handleCellClick(0, 0); // First click
  });

  expect(result.current.gameStatus).toBe("playing");

  // Reset game
  act(() => {
    result.current.resetGame();
  });

  expect(result.current.gameStatus).toBe("idle");
  expect(result.current.timeElapsed).toBe(0);
  expect(result.current.minesRemaining).toBe(testConfig.mines);
});

test("handles the first click correctly", () => {
  const { result } = renderHook(() => useGameState("custom", testConfig));

  // First click
  act(() => {
    result.current.handleCellClick(0, 0);
  });

  // Verify mines were placed and cell was revealed
  expect(gameUtils.placeMines).toHaveBeenCalledWith(
    expect.anything(),
    testConfig,
    0,
    0
  );
  expect(gameUtils.revealCell).toHaveBeenCalledWith(expect.anything(), 0, 0);
  expect(result.current.gameStatus).toBe("playing");
  expect(result.current.board[0][0].isRevealed).toBe(true);
  expect(result.current.board[0][0].isMine).toBe(false); // First click is always safe
});

test("handles revealing a non-mine cell correctly", () => {
  const { result } = renderHook(() => useGameState("custom", testConfig));

  // First click
  act(() => {
    result.current.handleCellClick(0, 0);
  });

  // Check if a specific position has no mine before clicking
  if (!result.current.board[1][1].isMine) {
    // Clear mocks to isolate the next click
    vi.clearAllMocks();

    // Second click on a non-mine cell
    act(() => {
      result.current.handleCellClick(1, 1);
    });

    // Verify the cell was revealed
    expect(gameUtils.revealCell).toHaveBeenCalled();
    expect(result.current.board[1][1].isRevealed).toBe(true);
    expect(result.current.gameStatus).toBe("playing");
  }
});

test("handles flagging a cell correctly", () => {
  const { result } = renderHook(() => useGameState("custom", testConfig));

  // Flag a cell
  act(() => {
    result.current.handleCellFlag(0, 0);
  });

  // Mines remaining should decrease
  expect(result.current.minesRemaining).toBe(testConfig.mines - 1);
  expect(result.current.board[0][0].isFlagged).toBe(true);

  // Unflag the same cell
  act(() => {
    result.current.handleCellFlag(0, 0);
  });

  // Mines remaining should go back up
  expect(result.current.minesRemaining).toBe(testConfig.mines);
  expect(result.current.board[0][0].isFlagged).toBe(false);
});

test("starts timer when game begins and stops when game ends", () => {
  const { result } = renderHook(() => useGameState("custom", testConfig));

  // First click to start game
  act(() => {
    result.current.handleCellClick(0, 0);
  });

  // Timer should start
  expect(result.current.timeElapsed).toBe(0);

  // Advance timer
  act(() => {
    vi.advanceTimersByTime(3000); // 3 seconds
  });

  expect(result.current.timeElapsed).toBe(3);

  // Find a mine to end the game
  let mineX = -1,
    mineY = -1;

  // Find mine location
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
    // Click on a mine to end game
    act(() => {
      result.current.handleCellClick(mineX, mineY);
    });

    // Check game status
    expect(result.current.gameStatus).toBe("lost");

    // Timer should stop
    act(() => {
      vi.advanceTimersByTime(2000); // 2 more seconds
    });

    // Time should still be 3, not 5
    expect(result.current.timeElapsed).toBe(3);
  }
});

test("resets game when difficulty changes", () => {
  const { result, rerender } = renderHook(
    (props: { difficulty: Difficulty; customConfig?: BoardConfig }) =>
      useGameState(props.difficulty, props.customConfig),
    { initialProps: { difficulty: "beginner" } }
  );

  // First click to start game
  act(() => {
    result.current.handleCellClick(0, 0);
  });

  expect(result.current.gameStatus).toBe("playing");

  // Change difficulty
  rerender({ difficulty: "intermediate" });

  // Game should reset
  expect(result.current.gameStatus).toBe("idle");
  expect(result.current.minesRemaining).toBe(40); // Intermediate mode has 40 mines
});
