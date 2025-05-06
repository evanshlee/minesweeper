import { beforeEach, expect, test } from "vitest";
import { GameStateManager } from "./GameStateManager";

let stateManager: GameStateManager;

beforeEach(() => {
  stateManager = new GameStateManager(10);
});

test("should initialize with correct default values", () => {
  // Assert
  expect(stateManager.getStatus()).toBe("idle");
  expect(stateManager.getMinesRemaining()).toBe(10);
  expect(stateManager.isFirstClick()).toBe(true);
});

test("should update mines remaining", () => {
  // Act
  stateManager.updateMinesRemaining(-1);

  // Assert
  expect(stateManager.getMinesRemaining()).toBe(9);

  // Act
  stateManager.updateMinesRemaining(2);

  // Assert
  expect(stateManager.getMinesRemaining()).toBe(11);
});

test("should reset state correctly", () => {
  // Arrange
  stateManager.setStatus("playing");
  stateManager.setFirstClick(false);
  stateManager.updateMinesRemaining(-3);

  // Act
  stateManager.resetState(15);

  // Assert
  expect(stateManager.getStatus()).toBe("idle");
  expect(stateManager.getMinesRemaining()).toBe(15);
  expect(stateManager.isFirstClick()).toBe(true);
});

test("should detect game ended state", () => {
  // 기본 상태
  expect(stateManager.isGameEnded()).toBe(false);

  // 게임 중
  stateManager.setStatus("playing");
  expect(stateManager.isGameEnded()).toBe(false);

  // 승리
  stateManager.setStatus("won");
  expect(stateManager.isGameEnded()).toBe(true);

  // 패배
  stateManager.setStatus("lost");
  expect(stateManager.isGameEnded()).toBe(true);
});
