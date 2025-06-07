import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import type { GameStatus } from "../../core/types";
import { useGameTimer } from "./useGameTimer";

test("timer starts when game status is playing", () => {
  vi.useFakeTimers(); // Use timer mock only in this test
  // Arrange
  const { result, rerender } = renderHook(
    ({ status }) => useGameTimer(status),
    { initialProps: { status: "idle" as GameStatus } }
  );

  // Initial state
  expect(result.current.timeElapsed).toBe(0);

  // Act - Change status to playing
  rerender({ status: "playing" as const });

  // Advance time
  act(() => {
    vi.advanceTimersByTime(3000);
  });

  // Assert
  expect(result.current.timeElapsed).toBe(3);
  vi.useRealTimers(); // Cleanup
});

test("timer stops when game status is won or lost", () => {
  vi.useFakeTimers();
  // Arrange
  const { result, rerender } = renderHook(
    ({ status }) => useGameTimer(status),
    { initialProps: { status: "playing" as GameStatus } }
  );

  // Advance time
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(result.current.timeElapsed).toBe(5);

  // Act - Change status to won (수정: playing -> won)
  rerender({ status: "won" as const });

  // Try to advance more time
  act(() => {
    vi.advanceTimersByTime(3000);
  });

  // Assert - Time should not increase
  expect(result.current.timeElapsed).toBe(5);
  vi.useRealTimers();
});

test("resetTimer sets timer back to zero", () => {
  vi.useFakeTimers();
  // Arrange
  const { result } = renderHook(({ status }) => useGameTimer(status), {
    initialProps: { status: "playing" as const },
  });

  // Advance time
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(result.current.timeElapsed).toBe(5);

  // Act - Reset timer
  act(() => {
    result.current.resetTimer();
  });

  // Assert
  expect(result.current.timeElapsed).toBe(0);
  vi.useRealTimers();
});
