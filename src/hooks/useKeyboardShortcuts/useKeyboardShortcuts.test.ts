import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

test("calls onRestart when R key is pressed", () => {
  // Arrange
  const onRestart = vi.fn();
  renderHook(() => useKeyboardShortcuts({ onRestart }));

  // Act
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "R" }));

  // Assert
  expect(onRestart).toHaveBeenCalledTimes(1);

  // Act - lowercase 'r'
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }));

  // Assert - called second time
  expect(onRestart).toHaveBeenCalledTimes(2);
});

test("does not call onRestart when other keys are pressed", () => {
  // Arrange
  const onRestart = vi.fn();
  renderHook(() => useKeyboardShortcuts({ onRestart }));

  // Act
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));

  // Assert
  expect(onRestart).not.toHaveBeenCalled();
});

test("cleans up event listener on unmount", () => {
  // Arrange
  const onRestart = vi.fn();
  const { unmount } = renderHook(() => useKeyboardShortcuts({ onRestart }));

  // Act
  unmount();
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "R" }));

  // Assert
  expect(onRestart).not.toHaveBeenCalled();
});
