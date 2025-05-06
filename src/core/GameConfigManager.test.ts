import { expect, test } from "vitest";
import { GameConfigManager } from "./GameConfigManager";
import type { BoardConfig } from "./types";

test("should initialize with beginner difficulty", () => {
  // Arrange
  const configManager = new GameConfigManager();

  // Assert
  expect(configManager.getDifficulty()).toBe("beginner");
  const config = configManager.getConfig();
  expect(config.rows).toBe(9);
  expect(config.columns).toBe(9);
  expect(config.mines).toBe(10);
});

test("should set custom difficulty", () => {
  // Arrange
  const configManager = new GameConfigManager();
  const customConfig: BoardConfig = {
    rows: 5,
    columns: 6,
    mines: 7,
  };

  // Act
  configManager.setDifficulty("custom", customConfig);

  // Assert
  expect(configManager.getDifficulty()).toBe("custom");
  const config = configManager.getConfig();
  expect(config).toEqual(customConfig);
});

test("should set predefined difficulties", () => {
  // Arrange
  const configManager = new GameConfigManager();

  // Act - 중급으로 설정
  configManager.setDifficulty("intermediate");

  // Assert
  expect(configManager.getDifficulty()).toBe("intermediate");
  const intermediateConfig = configManager.getConfig();
  expect(intermediateConfig.rows).toBe(16);
  expect(intermediateConfig.columns).toBe(16);
  expect(intermediateConfig.mines).toBe(40);

  // Act - 고급으로 설정
  configManager.setDifficulty("expert");

  // Assert
  expect(configManager.getDifficulty()).toBe("expert");
  const expertConfig = configManager.getConfig();
  expect(expertConfig.rows).toBe(16);
  expect(expertConfig.columns).toBe(30);
  expect(expertConfig.mines).toBe(99);
});
