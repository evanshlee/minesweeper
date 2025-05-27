import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { GameStatus } from "../../core/types";
import type { GameStorage } from "../../hooks/useGameState/GameStorage";
import type { GameStateForStorage } from "../../hooks/useGameState/useGameState";
import ControlPanel from "./ControlPanel";

const defaultProps = {
  timeElapsed: 45,
  minesRemaining: 10,
  gameStatus: "playing" as GameStatus,
  onReset: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

test("renders correctly with default props", () => {
  render(<ControlPanel {...defaultProps} />);

  expect(screen.getByTestId("control-panel")).toBeInTheDocument();
  expect(screen.getByTestId("mine-counter")).toHaveTextContent("010");
  expect(screen.getByTestId("timer")).toHaveTextContent("045");
  expect(screen.getByTestId("reset-btn")).toHaveTextContent("🙂");
});

test.each([
  [0, "000"],
  [9, "009"],
  [45, "045"],
  [100, "100"],
  [999, "999"],
  [1000, "999"], // Max time display
])("formats time correctly: %d -> %s", (time, expected) => {
  render(<ControlPanel {...defaultProps} timeElapsed={time} />);
  expect(screen.getByTestId("timer")).toHaveTextContent(expected);
});

test.each([
  [0, "000"],
  [9, "009"],
  [10, "010"],
  [999, "999"],
  [1000, "999"], // Max mines display
  [-1, "-01"],
  [-10, "-10"],
])("formats mines remaining correctly: %d -> %s", (mines, expected) => {
  render(<ControlPanel {...defaultProps} minesRemaining={mines} />);
  expect(screen.getByTestId("mine-counter")).toHaveTextContent(expected);
});

test.each([
  ["playing", "🙂"],
  ["won", "😎"],
  ["lost", "😵"],
])("displays correct emoji based on game status: %s", (status, emoji) => {
  render(<ControlPanel {...defaultProps} gameStatus={status as GameStatus} />);
  expect(screen.getByTestId("reset-btn")).toHaveTextContent(emoji);
});

test("calls onReset when reset button is clicked", () => {
  render(<ControlPanel {...defaultProps} />);

  fireEvent.click(screen.getByTestId("reset-btn"));
  expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
});

test("has correct accessibility attributes", () => {
  render(<ControlPanel {...defaultProps} />);

  expect(screen.getByTestId("control-panel")).toHaveAttribute("role", "group");
  expect(screen.getByTestId("control-panel")).toHaveAttribute(
    "aria-label",
    "Game controls"
  );

  expect(screen.getByTestId("mine-counter")).toHaveAttribute("role", "status");
  expect(screen.getByTestId("mine-counter")).toHaveAttribute(
    "aria-label",
    "Mines remaining: 10"
  );

  expect(screen.getByTestId("timer")).toHaveAttribute("role", "timer");
  expect(screen.getByTestId("timer")).toHaveAttribute(
    "aria-label",
    "Time elapsed: 45 seconds"
  );
});

test.each([
  ["playing", "Game in progress. Click to restart."],
  ["won", "You won the game! Click to restart."],
  ["lost", "Game over. Click to restart."],
])("reset button has correct accessibility label for %s", (status, label) => {
  render(<ControlPanel {...defaultProps} gameStatus={status as GameStatus} />);
  expect(screen.getByTestId("reset-btn")).toHaveAttribute("aria-label", label);
});

test("renders Save Game and Load Game buttons and calls handlers", () => {
  const mockStorage: GameStorage<GameStateForStorage> = {
    load: () => ({
      board: [],
      gameStatus: "idle",
      minesRemaining: 0,
      difficulty: "beginner",
      timeElapsed: 0,
    }),
    save: () => {},
    exists: () => true,
    remove: () => {},
  };
  const onSave = vi.fn();
  const onLoad = vi.fn();
  render(
    <ControlPanel
      {...defaultProps}
      onSave={onSave}
      onLoad={onLoad}
      storage={mockStorage}
    />
  );
  const saveBtn = screen.getByTestId("save-game-btn");
  const loadBtn = screen.getByTestId("load-game-btn");
  expect(saveBtn).toBeInTheDocument();
  expect(loadBtn).toBeInTheDocument();
  fireEvent.click(saveBtn);
  expect(onSave).toHaveBeenCalledTimes(1);
  fireEvent.click(loadBtn);
  expect(onLoad).toHaveBeenCalledTimes(1);
});

test("Load Game button is disabled if no saved game in storage adapter", () => {
  const mockStorage: GameStorage<GameStateForStorage> = {
    load: () => undefined,
    save: () => {},
    exists: () => false,
    remove: () => {},
  };
  render(
    <ControlPanel
      {...defaultProps}
      onLoad={() => {}}
      onSave={() => {}}
      storage={mockStorage}
    />
  );
  const loadBtn = screen.getByTestId("load-game-btn");
  expect(loadBtn).toBeDisabled();
});

test("Load Game button is enabled if there is a saved game in storage adapter", () => {
  const mockStorage: GameStorage<GameStateForStorage> = {
    load: () => ({
      board: [],
      gameStatus: "idle",
      minesRemaining: 0,
      difficulty: "beginner",
      timeElapsed: 0,
    }),
    save: () => {},
    exists: () => true,
    remove: () => {},
  };
  render(
    <ControlPanel
      {...defaultProps}
      onLoad={() => {}}
      onSave={() => {}}
      storage={mockStorage}
    />
  );
  const loadBtn = screen.getByTestId("load-game-btn");
  expect(loadBtn).not.toBeDisabled();
});
