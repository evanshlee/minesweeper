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
    let mineCount = 0;
    for (let y = 0; y < testConfig.rows; y++) {
      for (let x = 0; x < testConfig.columns; x++) {
        if (boardWithMines[y][x].isMine) {
          mineCount++;
        }
      }
    }
    expect(mineCount).toBe(expectedMines);
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

    // Additional assertions for surrounding cells
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const y = firstClickY + dy;
        const x = firstClickX + dx;
        if (y >= 0 && y < testConfig.rows && x >= 0 && x < testConfig.columns) {
          expect(boardWithMines[y][x].isMine).toBe(false);
        }
      }
    }
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
    const board = initializeBoard(testConfig);
    const cellX = 2;
    const cellY = 2;
    board[cellY][cellX].isFlagged = true;

    // Act
    const newBoard = revealCell(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isRevealed).toBe(false);
  });

  test("cascade reveals for empty cells", () => {
    // Arrange
    const smallBoard = initializeBoard({ rows: 3, columns: 3, mines: 0 });
    const centerX = 1;
    const centerY = 1;

    // Act
    const newBoard = revealCell(smallBoard, centerX, centerY);

    // Assert
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        expect(newBoard[y][x].isRevealed).toBe(true);
      }
    }
  });
});

describe("checkWinCondition", () => {
  test("returns true when all non-mine cells are revealed", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const minePositions = [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ];

    // Set mines at specific positions
    minePositions.forEach(([x, y]) => {
      board[y][x].isMine = true;
    });

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
    const board = initializeBoard(testConfig);

    // Set mines at specific positions
    board[0][0].isMine = true;
    board[1][1].isMine = true;

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

  test("removes a flag from a flagged cell", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const cellX = 2;
    const cellY = 2;
    board[cellY][cellX].isFlagged = true;

    // Act
    const newBoard = toggleFlag(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isFlagged).toBe(false);
  });

  test("does not toggle flag on revealed cells", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const cellX = 2;
    const cellY = 2;
    board[cellY][cellX].isRevealed = true;

    // Act
    const newBoard = toggleFlag(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isFlagged).toBe(false);
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
  test("reveals a mine cell", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const cellX = 2;
    const cellY = 2;
    board[cellY][cellX].isMine = true;

    // Act
    const newBoard = revealMine(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isRevealed).toBe(true);
    expect(newBoard[cellY][cellX].isMine).toBe(true);
  });

  test("works on non-mine cells too", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const cellX = 2;
    const cellY = 2;

    // Act
    const newBoard = revealMine(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isRevealed).toBe(true);
  });

  test("does not affect other properties of the cell", () => {
    // Arrange
    const board = initializeBoard(testConfig);
    const cellX = 2;
    const cellY = 2;
    const adjacentMines = 3;

    board[cellY][cellX].isFlagged = true;
    board[cellY][cellX].adjacentMines = adjacentMines;

    // Act
    const newBoard = revealMine(board, cellX, cellY);

    // Assert
    expect(newBoard[cellY][cellX].isRevealed).toBe(true);
    expect(newBoard[cellY][cellX].isFlagged).toBe(true);
    expect(newBoard[cellY][cellX].adjacentMines).toBe(adjacentMines);
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
    let mineCount = 0;
    for (let y = 0; y < testConfig.rows; y++) {
      for (let x = 0; x < testConfig.columns; x++) {
        if (newBoard[y][x].isMine) {
          mineCount++;
        }
      }
    }
    expect(mineCount).toBe(testConfig.mines);

    // Check surrounding cells are not mines
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const y = clickY + dy;
        const x = clickX + dx;
        if (y >= 0 && y < testConfig.rows && x >= 0 && x < testConfig.columns) {
          expect(newBoard[y][x].isMine).toBe(false);
        }
      }
    }
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
