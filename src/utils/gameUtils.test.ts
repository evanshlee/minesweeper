import { describe, expect, test } from "vitest";
import { BoardConfig } from "../models/types";
import {
  checkWinCondition,
  initializeBoard,
  placeMines,
  revealCell,
} from "./gameUtils";

const testConfig: BoardConfig = {
  rows: 5,
  columns: 5,
  mines: 5,
};

describe("initializeBoard", () => {
  test("creates a board with the correct dimensions", () => {
    const board = initializeBoard(testConfig);

    expect(board.length).toBe(5);
    expect(board[0].length).toBe(5);
  });

  test("initializes all cells with default values", () => {
    const board = initializeBoard(testConfig);

    for (let y = 0; y < testConfig.rows; y++) {
      for (let x = 0; x < testConfig.columns; x++) {
        expect(board[y][x]).toEqual({
          x,
          y,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        });
      }
    }
  });
});

describe("placeMines", () => {
  test("places the correct number of mines", () => {
    const board = initializeBoard(testConfig);
    const boardWithMines = placeMines(board, testConfig, 0, 0);

    let mineCount = 0;
    for (let y = 0; y < testConfig.rows; y++) {
      for (let x = 0; x < testConfig.columns; x++) {
        if (boardWithMines[y][x].isMine) {
          mineCount++;
        }
      }
    }

    expect(mineCount).toBe(testConfig.mines);
  });

  test("ensures the first clicked cell is not a mine", () => {
    const board = initializeBoard(testConfig);
    const firstClickX = 2;
    const firstClickY = 2;
    const boardWithMines = placeMines(
      board,
      testConfig,
      firstClickX,
      firstClickY
    );

    expect(boardWithMines[firstClickY][firstClickX].isMine).toBe(false);

    // Also check surrounding cells
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
    const board = initializeBoard(testConfig);
    const newBoard = revealCell(board, 2, 2);

    expect(newBoard[2][2].isRevealed).toBe(true);
  });

  test("does not reveal flagged cells", () => {
    const board = initializeBoard(testConfig);
    board[2][2].isFlagged = true;
    const newBoard = revealCell(board, 2, 2);

    expect(newBoard[2][2].isRevealed).toBe(false);
  });

  test("cascade reveals for empty cells", () => {
    const board = initializeBoard({ rows: 3, columns: 3, mines: 0 });
    // All cells have 0 adjacent mines
    const newBoard = revealCell(board, 1, 1);

    // All cells should be revealed
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        expect(newBoard[y][x].isRevealed).toBe(true);
      }
    }
  });
});

describe("checkWinCondition", () => {
  test("returns true when all non-mine cells are revealed", () => {
    const board = initializeBoard(testConfig);

    // Set mines at specific positions
    board[0][0].isMine = true;
    board[1][1].isMine = true;
    board[2][2].isMine = true;
    board[3][3].isMine = true;
    board[4][4].isMine = true;

    // Reveal all non-mine cells
    for (let y = 0; y < testConfig.rows; y++) {
      for (let x = 0; x < testConfig.columns; x++) {
        if (!board[y][x].isMine) {
          board[y][x].isRevealed = true;
        }
      }
    }

    expect(checkWinCondition(board)).toBe(true);
  });

  test("returns false when some non-mine cells are not revealed", () => {
    const board = initializeBoard(testConfig);

    // Set mines at specific positions
    board[0][0].isMine = true;
    board[1][1].isMine = true;

    // Reveal some non-mine cells, but not all
    board[0][1].isRevealed = true;
    board[1][0].isRevealed = true;

    expect(checkWinCondition(board)).toBe(false);
  });
});
