import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { GameStatus } from "../../models/types";
import ControlPanel from "./ControlPanel";

const defaultProps = {
  timeElapsed: 45,
  minesRemaining: 10,
  gameStatus: "playing" as GameStatus,
  onReset: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders correctly with default props", () => {
  render(<ControlPanel {...defaultProps} />);

  expect(screen.getByTestId("control-panel")).toBeInTheDocument();
  expect(screen.getByTestId("mine-counter")).toHaveTextContent("010");
  expect(screen.getByTestId("timer")).toHaveTextContent("045");
  expect(screen.getByRole("button")).toHaveTextContent("🙂");
});

test("formats time correctly", () => {
  const cases = [
    { time: 0, expected: "000" },
    { time: 9, expected: "009" },
    { time: 45, expected: "045" },
    { time: 100, expected: "100" },
    { time: 999, expected: "999" },
    { time: 1000, expected: "999" }, // Max time display
  ];

  cases.forEach(({ time, expected }) => {
    render(<ControlPanel {...defaultProps} timeElapsed={time} />);
    expect(screen.getByTestId("timer")).toHaveTextContent(expected);
  });
});

test("formats mines remaining correctly", () => {
  const cases = [
    { mines: 0, expected: "000" },
    { mines: 9, expected: "009" },
    { mines: 10, expected: "010" },
    { mines: 999, expected: "999" },
    { mines: 1000, expected: "999" }, // Max mines display
    { mines: -1, expected: "-01" },
    { mines: -10, expected: "-10" },
  ];

  cases.forEach(({ mines, expected }) => {
    render(<ControlPanel {...defaultProps} minesRemaining={mines} />);
    expect(screen.getByTestId("mine-counter")).toHaveTextContent(expected);
  });
});

test("displays correct emoji based on game status", () => {
  const statusEmojis = [
    { status: "playing" as GameStatus, emoji: "🙂" },
    { status: "won" as GameStatus, emoji: "😎" },
    { status: "lost" as GameStatus, emoji: "😵" },
  ];

  statusEmojis.forEach(({ status, emoji }) => {
    render(<ControlPanel {...defaultProps} gameStatus={status} />);
    expect(screen.getByRole("button")).toHaveTextContent(emoji);
  });
});

test("calls onReset when reset button is clicked", () => {
  render(<ControlPanel {...defaultProps} />);

  fireEvent.click(screen.getByRole("button"));
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

test("reset button has correct accessibility label based on game status", () => {
  const statusLabels = [
    {
      status: "playing" as GameStatus,
      label: "Game in progress. Click to restart.",
    },
    {
      status: "won" as GameStatus,
      label: "You won the game! Click to restart.",
    },
    {
      status: "lost" as GameStatus,
      label: "Game over. Click to restart.",
    },
  ];

  statusLabels.forEach(({ status, label }) => {
    render(<ControlPanel {...defaultProps} gameStatus={status} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", label);
  });
});
