import { beforeEach, expect, test } from "vitest";
import { BoardManager } from "./BoardManager";
import type { BoardConfig } from "./types";

// 테스트를 위한 작은 보드 구성
const testConfig: BoardConfig = {
  rows: 4,
  columns: 4,
  mines: 3,
};

let boardManager: BoardManager;

beforeEach(() => {
  boardManager = new BoardManager(testConfig);
});

test("should initialize board correctly", () => {
  // Assert
  const board = boardManager.getBoard();
  expect(board.length).toBe(testConfig.rows);
  expect(board[0].length).toBe(testConfig.columns);

  // 초기 상태에서 모든 셀은 가려져 있어야 함
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      expect(board[y][x].isRevealed).toBe(false);
      expect(board[y][x].isFlagged).toBe(false);
      expect(board[y][x].isMine).toBe(false);
    }
  }
});

test("should handle first click", () => {
  // Act
  const board = boardManager.handleFirstClick(testConfig, 1, 1);

  // Assert
  expect(board[1][1].isRevealed).toBe(true);
  expect(board[1][1].isMine).toBe(false);

  // 지뢰가 배치되었는지 확인
  let mineCount = 0;
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      if (board[y][x].isMine) mineCount++;
    }
  }
  expect(mineCount).toBe(testConfig.mines);
});

test("should toggle flags", () => {
  // Act - 깃발 추가
  let board = boardManager.toggleFlag(2, 2);

  // Assert
  expect(board[2][2].isFlagged).toBe(true);

  // Act - 깃발 제거
  board = boardManager.toggleFlag(2, 2);

  // Assert
  expect(board[2][2].isFlagged).toBe(false);
});

test("should check cell state correctly", () => {
  // Arrange
  boardManager.toggleFlag(1, 1);
  boardManager.handleFirstClick(testConfig, 2, 2);

  // Assert - 깃발
  expect(boardManager.isCellFlagged(1, 1)).toBe(true);
  expect(boardManager.isCellFlagged(2, 2)).toBe(false);

  // Assert - 공개
  expect(boardManager.isCellRevealed(1, 1)).toBe(false);
  expect(boardManager.isCellRevealed(2, 2)).toBe(true);
});
