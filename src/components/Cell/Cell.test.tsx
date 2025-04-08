import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { CellData } from "../../models/types";
import { Cell } from "./Cell";

const defaultProps: Omit<ComponentProps<typeof Cell>, "cell"> = {
  x: 1,
  y: 2,
  isFocused: false,
  onCellClick: vi.fn(),
  onCellFlag: vi.fn(),
  onCellKeyDown: vi.fn(),
  onCellFocus: vi.fn(),
};

const createCellData = (overrides: Partial<CellData> = {}): CellData => ({
  x: 1,
  y: 2,
  isMine: false,
  isRevealed: false,
  isFlagged: false,
  adjacentMines: 0,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders an unrevealed cell correctly", () => {
  const cell = createCellData();
  render(<Cell {...defaultProps} cell={cell} />);

  const cellElement = screen.getByRole("gridcell");
  expect(cellElement).not.toHaveClass("revealed");
  expect(cellElement).toHaveAttribute("aria-pressed", "false");
});

test("renders a revealed cell correctly", () => {
  const cell = createCellData({ isRevealed: true });
  render(<Cell {...defaultProps} cell={cell} />);

  const cellElement = screen.getByRole("gridcell");
  expect(cellElement).toHaveClass("revealed");
  expect(cellElement).toHaveAttribute("aria-pressed", "true");
});

test("renders a flagged cell correctly", () => {
  const cell = createCellData({ isFlagged: true });
  render(<Cell {...defaultProps} cell={cell} />);

  const cellElement = screen.getByRole("gridcell");
  expect(cellElement).toHaveClass("flagged");
  expect(cellElement).toHaveTextContent("🚩");
});

test("renders a revealed mine correctly", () => {
  const cell = createCellData({ isRevealed: true, isMine: true });
  render(<Cell {...defaultProps} cell={cell} />);

  const cellElement = screen.getByRole("gridcell");
  expect(cellElement).toHaveClass("revealed");
  expect(cellElement).toHaveClass("mine");
  expect(cellElement).toHaveTextContent("💣");
});

test("renders adjacent mine count when revealed", () => {
  const cell = createCellData({ isRevealed: true, adjacentMines: 3 });
  render(<Cell {...defaultProps} cell={cell} />);

  const cellElement = screen.getByRole("gridcell");
  expect(cellElement).toHaveClass("revealed");
  expect(cellElement).toHaveClass("adjacent-3");
  expect(cellElement).toHaveTextContent("3");
});

test("calls onCellClick with correct coordinates when clicked", () => {
  const cell = createCellData();
  render(<Cell {...defaultProps} cell={cell} />);

  fireEvent.click(screen.getByRole("gridcell"));
  expect(defaultProps.onCellClick).toHaveBeenCalledWith(1, 2);
});

test("calls onCellFlag with correct coordinates on right click", () => {
  const cell = createCellData();
  render(<Cell {...defaultProps} cell={cell} />);

  fireEvent.contextMenu(screen.getByRole("gridcell"));
  expect(defaultProps.onCellFlag).toHaveBeenCalledWith(1, 2);
});

test("calls onCellKeyDown when a key is pressed", () => {
  const cell = createCellData();
  render(<Cell {...defaultProps} cell={cell} />);

  const keyEvent = { key: "Enter" };
  fireEvent.keyDown(screen.getByRole("gridcell"), keyEvent);
  expect(defaultProps.onCellKeyDown).toHaveBeenCalledWith(
    expect.objectContaining(keyEvent),
    1,
    2
  );
});

test("calls onCellFocus when focused", () => {
  const cell = createCellData();
  render(<Cell {...defaultProps} cell={cell} />);

  fireEvent.focus(screen.getByRole("gridcell"));
  expect(defaultProps.onCellFocus).toHaveBeenCalledWith(1, 2);
});

test("has tabIndex of 0 when focused", () => {
  const cell = createCellData();
  render(<Cell {...defaultProps} cell={cell} isFocused={true} />);

  expect(screen.getByRole("gridcell")).toHaveAttribute("tabIndex", "0");
});

test("has tabIndex of -1 when not focused", () => {
  const cell = createCellData();
  render(<Cell {...defaultProps} cell={cell} isFocused={false} />);

  expect(screen.getByRole("gridcell")).toHaveAttribute("tabIndex", "-1");
});

test("is disabled when cell is a revealed mine", () => {
  const cell = createCellData({ isRevealed: true, isMine: true });
  render(<Cell {...defaultProps} cell={cell} />);

  const cellElement = screen.getByRole("gridcell");
  expect(cellElement).toHaveAttribute("aria-disabled", "true");
  // Ensure the element is not actually disabled so it remains focusable
  expect(cellElement).not.toBeDisabled();
});

test("applies ref to the button element", () => {
  const ref = vi.fn();
  const cell = createCellData();
  render(<Cell {...defaultProps} cell={cell} ref={ref} />);
  expect(ref).toHaveBeenCalled();
});
