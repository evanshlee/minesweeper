import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { BoardConfig } from "../../core/types";
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

  const { result } = renderHook(() => useGameState(initialDifficulty));

  // Act - First click to start game
  act(() => {
    result.current.handleCellClick(0, 0);
  });

  // Assert - Game should be playing
  expect(result.current.gameStatus).toBe("playing");

  // Act - Change difficulty using handleDifficultySelect
  act(() => {
    result.current.handleDifficultySelect(newDifficulty);
  });

  // Assert - Game should reset
  expect(result.current.gameStatus).toBe("idle");
  expect(result.current.minesRemaining).toBe(expectedMines);
});

test("updates status message when game status changes", () => {
  // Arrange
  const { result } = renderHook(() => useGameState("beginner"));

  // Assert - Initial state
  expect(result.current.statusMessage).toBe("");
  expect(result.current.gameStatus).toBe("idle");

  // Act - Start game with first click
  act(() => {
    result.current.handleCellClick(4, 4);
  });

  // Assert - Check status after game starts
  expect(result.current.statusMessage).toBe("Game started. Good luck!");
  expect(result.current.gameStatus).toBe("playing");

  // Act - Reset game
  act(() => {
    result.current.resetGame();
  });

  // Assert - Check status after reset
  expect(result.current.statusMessage).toBe("");
  expect(result.current.gameStatus).toBe("idle");
});

test("handles difficulty selection with custom config", () => {
  // Arrange
  const { result } = renderHook(() => useGameState());

  // Assert - Default difficulty is beginner
  expect(result.current.difficulty).toBe("beginner");

  const customConfig: BoardConfig = {
    rows: 10,
    columns: 10,
    mines: 15,
  };

  // Act - Change to custom difficulty
  act(() => {
    result.current.handleDifficultySelect("custom", customConfig);
  });

  // Assert - Check difficulty changed and game reset
  expect(result.current.difficulty).toBe("custom");
  expect(result.current.minesRemaining).toBe(customConfig.mines);
  expect(result.current.board.length).toBe(customConfig.rows);
  expect(result.current.board[0].length).toBe(customConfig.columns);
  expect(result.current.gameStatus).toBe("idle");

  // Act - Start game
  act(() => {
    result.current.handleCellClick(0, 0);
  });
  expect(result.current.gameStatus).toBe("playing");

  // Act - Change to predefined difficulty
  act(() => {
    result.current.handleDifficultySelect("expert");
  });

  // Assert - Check difficulty changed and game reset
  expect(result.current.difficulty).toBe("expert");
  expect(result.current.minesRemaining).toBe(99); // Expert has 99 mines
  expect(result.current.gameStatus).toBe("idle");
});

test("saves and loads game state to/from localStorage", () => {
  // Arrange
  const { result } = renderHook(() => useGameState("custom", testConfig));

  // Act - Start a game and make some moves
  act(() => {
    result.current.handleCellClick(0, 0);
    result.current.handleCellFlag(1, 1);
  });

  // Save current state to localStorage
  act(() => {
    result.current.saveGameState();
  });

  // Simulate page reload by creating a new hook instance
  const { result: newResult } = renderHook(() =>
    useGameState("custom", testConfig)
  );

  // Load state from localStorage
  act(() => {
    newResult.current.loadGameState();
  });

  // Assert - The loaded state matches the saved state
  expect(newResult.current.board).toEqual(result.current.board);
  expect(newResult.current.minesRemaining).toBe(result.current.minesRemaining);
  expect(newResult.current.gameStatus).toBe(result.current.gameStatus);
});

test("loaded game state persists after loadGameState is called", () => {
  // Arrange: Save a custom state to localStorage
  const customState = {
    board: [
      [
        { isMine: false, isRevealed: true, isFlagged: false, adjacentMines: 0 },
        { isMine: true, isRevealed: false, isFlagged: false, adjacentMines: 1 },
      ],
      [
        { isMine: false, isRevealed: false, isFlagged: true, adjacentMines: 1 },
        {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 1,
        },
      ],
    ],
    gameStatus: "playing",
    minesRemaining: 2,
    difficulty: "custom",
    customConfig: { rows: 2, columns: 2, mines: 1 },
    timeElapsed: 42,
  };
  window.localStorage.setItem(
    "minesweeper-game-state",
    JSON.stringify(customState)
  );

  // Act: Mount a new game and load state
  const { result } = renderHook(() => useGameState("beginner"));
  act(() => {
    result.current.loadGameState();
  });

  // Assert: State matches loaded state and is not reset
  expect(result.current.board).toEqual(customState.board);
  expect(result.current.gameStatus).toBe("playing");
  expect(result.current.minesRemaining).toBe(2);
  expect(result.current.difficulty).toBe("custom");
  expect(result.current.timeElapsed).toBe(42);

  // Wait a tick to ensure no reset happens
  act(() => {
    // simulate passage of time
  });
  expect(result.current.board).toEqual(customState.board);
  expect(result.current.gameStatus).toBe("playing");
  expect(result.current.minesRemaining).toBe(2);
  expect(result.current.difficulty).toBe("custom");
  expect(result.current.timeElapsed).toBe(42);

  // Clean up
  window.localStorage.removeItem("minesweeper-game-state");
});
