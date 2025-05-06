import { expect, test } from "vitest";
import { MessageGenerator } from "./MessageGenerator";

test("should generate correct messages for different status transitions", () => {
  // Arrange
  const messageGenerator = new MessageGenerator();

  // Assert - 게임 시작 시
  expect(messageGenerator.getStatusMessage("playing", "idle", 0)).toBe(
    "Game started. Good luck!"
  );

  // Assert - 게임 승리 시
  expect(messageGenerator.getStatusMessage("won", "playing", 42)).toBe(
    "Congratulations! You won in 42 seconds!"
  );

  // Assert - 게임 패배 시
  expect(messageGenerator.getStatusMessage("lost", "playing", 30)).toBe(
    "Game over! You hit a mine."
  );

  // Assert - 상태가 변경되지 않았을 때
  expect(messageGenerator.getStatusMessage("playing", "playing", 10)).toBe("");
});

test("should handle other status transitions", () => {
  // Arrange
  const messageGenerator = new MessageGenerator();

  // 일반적이지 않은 상태 전환
  expect(messageGenerator.getStatusMessage("playing", "won", 5)).toBe("");
  expect(messageGenerator.getStatusMessage("playing", "lost", 5)).toBe("");
  expect(messageGenerator.getStatusMessage("idle", "playing", 0)).toBe("");
});
