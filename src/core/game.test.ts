import { describe, expect, test } from "vitest";
import {
  checkWinCondition,
  handleFirstClick,
  initializeBoard,
  placeMines,
  revealCell,
  revealMine,
  toggleFlag,
} from "./game";
import { BoardConfig } from "./types";

const testConfig: BoardConfig = {
  rows: 5,
  columns: 5,
  mines: 5,
};

// Helper to create a board with mines at specific positions
function createBoardWithMines(
  config: BoardConfig,
  minePositions: Array<[number, number]>
): ReturnType<typeof initializeBoard> {
  const board = initializeBoard(config);
  minePositions.forEach(([x, y]) => {
    board[y][x].isMine = true;
  });
  return board;
}

// Helper to create a board with custom cell state modifications
function createBoardWithState(
  config: BoardConfig,
  modifier: (cell: ReturnType<typeof initializeBoard>[number][number]) => void
): ReturnType<typeof initializeBoard> {
  const board = initializeBoard(config);
  for (let y = 0; y < config.rows; y++) {
    for (let x = 0; x < config.columns; x++) {
      modifier(board[y][x]);
    }
  }
  return board;
}

// Helper to count mines on the board
function countMines(board: ReturnType<typeof initializeBoard>): number {
  return board.reduce(
    (total, row) => total + row.filter((cell) => cell.isMine).length,
    0
  );
}

// Helper to check if surrounding cells are not mines
function areSurroundingCellsSafe(
  board: ReturnType<typeof initializeBoard>,
  x: number,
  y: number,
  config: BoardConfig
): boolean {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ny = y + dy;
      const nx = x + dx;
      if (
        ny >= 0 &&
        ny < config.rows &&
        nx >= 0 &&
        nx < config.columns &&
        board[ny][nx].isMine
      ) {
        return false;
      }
    }
  }
  return true;
}

describe("initializeBoard", () => {
  test("creates a board with the correct dimensions", () => {
    // Arrange
    const expectedRows = 5;
    const expectedCols = 5;

    // Act
    const board = initializeBoard(testConfig);

    // Assert
    expect(board.length).toBe(expectedRows);
    expect(board[0].length).toBe(expectedCols);
  });

  test("initializes all cells with default values", () => {
    // Arrange
    const expectedCellState = {
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    };

    // Act
    const board = initializeBoard(testConfig);

    // Assert
    for (let y = 0; y < testConfig.rows; y++) {
      for (let x = 0; x < testConfig.columns; x++) {
        expect(board[y][x]).toEqual({
          x,
          y,
          ...expectedCellState,
        });
      }
    }
  });
});

describe("placeMines", () => {
  test("places the correct number of mines", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const expectedMines = testConfig.mines;

    // Act
    const boardWithMines = placeMines(board, testConfig, 0, 0);

    // Assert
    expect(countMines(boardWithMines)).toBe(expectedMines);
  });

  test("ensures the first clicked cell is not a mine", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const firstClickX = 2;
    const firstClickY = 2;

    // Act
    const boardWithMines = placeMines(
      board,
      testConfig,
      firstClickX,
      firstClickY
    );

    // Assert
    expect(boardWithMines[firstClickY][firstClickX].isMine).toBe(false);
  });
});

describe("revealCell", () => {
  test("reveals the selected cell", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const cellX = 2;
    const cellY = 2;

    // Act
    const newBoard = revealCell(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isRevealed).toBe(true);
  });

  test("does not reveal flagged cells", () => {
    // Arrange
    const board = createBoardWithState(testConfig, (cell) => {
      if (cell.x === 2 && cell.y === 2) cell.isFlagged = true;
    });
    const cellX = 2;
    const cellY = 2;

    // Act
    const newBoard = revealCell(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isRevealed).toBe(false);
  });

  test.each([
    {
      desc: "3x3 board, no mines",
      config: { rows: 3, columns: 3, mines: 0 },
      centerX: 1,
      centerY: 1,
    },
    {
      desc: "5x5 board, no mines",
      config: { rows: 5, columns: 5, mines: 0 },
      centerX: 2,
      centerY: 2,
    },
  ])(
    "cascade reveals for empty cells ($desc)",
    ({ config, centerX, centerY }) => {
      // Arrange
      const smallBoard = initializeBoard(config);

      // Act
      const newBoard = revealCell(smallBoard, centerX, centerY);

      // Assert
      for (let y = 0; y < config.rows; y++) {
        for (let x = 0; x < config.columns; x++) {
          expect(newBoard[y][x].isRevealed).toBe(true);
        }
      }
    }
  );
});

describe("checkWinCondition", () => {
  test("returns true when all non-mine cells are revealed", () => {
    // Arrange
    const minePositions: [number, number][] = [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];
    const board = createBoardWithMines(testConfig, minePositions);

    // Reveal all non-mine cells
    for (let y = 0; y < testConfig.rows; y++) {
      for (let x = 0; x < testConfig.columns; x++) {
        if (!board[y][x].isMine) {
          board[y][x].isRevealed = true;
        }
      }
    }

    // Act
    const isWon = checkWinCondition(board);

    // Assert
    expect(isWon).toBe(true);
  });

  test("returns false when some non-mine cells are not revealed", () => {
    // Arrange
    const minePositions: [number, number][] = [
      [0, 0],
      [1, 1],
    ];
    const board = createBoardWithMines(testConfig, minePositions);

    // Reveal only some non-mine cells
    board[0][1].isRevealed = true;
    board[1][0].isRevealed = true;

    // Act
    const isWon = checkWinCondition(board);

    // Assert
    expect(isWon).toBe(false);
  });
});

describe("toggleFlag", () => {
  test("adds a flag to an unflagged cell", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const cellX = 2;
    const cellY = 2;

    // Act
    const newBoard = toggleFlag(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isFlagged).toBe(true);
  });

  test.each([
    {
      desc: "removes a flag from a flagged cell",
      flag: true,
      revealed: false,
      expected: false,
    },
    {
      desc: "does not toggle flag on revealed cells",
      flag: false,
      revealed: true,
      expected: false,
    },
  ])("$desc", ({ flag, revealed, expected }) => {
    // Arrange
    const board = createBoardWithState(testConfig, (cell) => {
      if (cell.x === 2 && cell.y === 2) {
        cell.isFlagged = flag;
        cell.isRevealed = revealed;
      }
    });
    const cellX = 2;
    const cellY = 2;

    // Act
    const newBoard = toggleFlag(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isFlagged).toBe(expected);
  });

  test("does not modify the original board", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const cellX = 2;
    const cellY = 2;

    // Act
    toggleFlag(board, cellX, cellY);

    // Assert
    expect(board[cellY][cellX].isFlagged).toBe(false);
  });
});

describe("revealMine", () => {
  test.each([
    {
      desc: "reveals a mine cell",
      isMine: true,
      isFlagged: false,
      adjacentMines: 0,
      expected: {
        isRevealed: true,
        isMine: true,
        isFlagged: false,
        adjacentMines: 0,
      },
    },
    {
      desc: "works on non-mine cells too",
      isMine: false,
      isFlagged: false,
      adjacentMines: 0,
      expected: {
        isRevealed: true,
        isMine: false,
        isFlagged: false,
        adjacentMines: 0,
      },
    },
    {
      desc: "does not affect other properties of the cell",
      isMine: false,
      isFlagged: true,
      adjacentMines: 3,
      expected: {
        isRevealed: true,
        isMine: false,
        isFlagged: true,
        adjacentMines: 3,
      },
    },
  ])("$desc", ({ isMine, isFlagged, adjacentMines, expected }) => {
    // Arrange
    const board = createBoardWithState(testConfig, (cell) => {
      if (cell.x === 2 && cell.y === 2) {
        cell.isMine = isMine;
        cell.isFlagged = isFlagged;
        cell.adjacentMines = adjacentMines;
      }
    });
    const cellX = 2;
    const cellY = 2;

    // Act
    const newBoard = revealMine(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isRevealed).toBe(expected.isRevealed);
    expect(newBoard[cellY][cellX].isMine).toBe(expected.isMine);
    expect(newBoard[cellY][cellX].isFlagged).toBe(expected.isFlagged);
    expect(newBoard[cellY][cellX].adjacentMines).toBe(expected.adjacentMines);
  });
});

describe("handleFirstClick", () => {
  test("places mines and reveals the first clicked cell", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const clickX = 2;
    const clickY = 2;

    // Act
    const newBoard = handleFirstClick(board, testConfig, clickX, clickY);

    // Assert
    // Cell should be revealed and not a mine
    expect(newBoard[clickY][clickX].isRevealed).toBe(true);
    expect(newBoard[clickY][clickX].isMine).toBe(false);

    // Count mines
    expect(countMines(newBoard)).toBe(testConfig.mines);

    // Check surrounding cells are not mines
    expect(areSurroundingCellsSafe(newBoard, clickX, clickY, testConfig)).toBe(
      true
    );
  });

  test("cascades reveal for empty cells on first click", () => {
    // Arrange
    const minimalMinesConfig: BoardConfig = {
      rows: 5,
      columns: 5,
      mines: 1,
    };
    const board = initializeBoard(minimalMinesConfig);
    const clickX = 2;
    const clickY = 2;

    // Act
    const newBoard = handleFirstClick(
      board,
      minimalMinesConfig,
      clickX,
      clickY
    );

    // Assert
    // Count revealed cells
    let revealedCount = 0;
    for (let y = 0; y < minimalMinesConfig.rows; y++) {
      for (let x = 0; x < minimalMinesConfig.columns; x++) {
        if (newBoard[y][x].isRevealed) {
          revealedCount++;
        }
      }
    }

    // Multiple cells should be revealed due to cascade
    expect(revealedCount).toBeGreaterThan(1);
  });
});
