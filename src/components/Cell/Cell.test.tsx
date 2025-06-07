import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { CellData } from "../../core/types";
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

const renderCell = (
  cell: CellData,
  props: Partial<Omit<ComponentProps<typeof Cell>, "cell">> = {}
) => {
  return render(<Cell {...defaultProps} {...props} cell={cell} />);
};

// Parameterized tests for rendering cell states
const cellRenderCases = [
  {
    name: "unrevealed cell",
    cell: createCellData(),
    expected: {
      class: (el: HTMLElement) => expect(el).not.toHaveClass("revealed"),
      ariaPressed: "false",
      text: "",
    },
  },
  {
    name: "revealed cell",
    cell: createCellData({ isRevealed: true }),
    expected: {
      class: (el: HTMLElement) => expect(el).toHaveClass("revealed"),
      ariaPressed: "true",
      text: "",
    },
  },
  {
    name: "flagged cell",
    cell: createCellData({ isFlagged: true }),
    expected: {
      class: (el: HTMLElement) => expect(el).toHaveClass("flagged"),
      ariaPressed: "false",
      text: "🚩",
    },
  },
  {
    name: "revealed mine",
    cell: createCellData({ isRevealed: true, isMine: true }),
    expected: {
      class: (el: HTMLElement) => {
        expect(el).toHaveClass("revealed");
        expect(el).toHaveClass("mine");
      },
      ariaPressed: "true",
      text: "💣",
    },
  },
  {
    name: "revealed with adjacent mines",
    cell: createCellData({ isRevealed: true, adjacentMines: 3 }),
    expected: {
      class: (el: HTMLElement) => {
        expect(el).toHaveClass("revealed");
        expect(el).toHaveClass("adjacent-3");
      },
      ariaPressed: "true",
      text: "3",
    },
  },
];

test.each(cellRenderCases)("renders $name correctly", ({ cell, expected }) => {
  renderCell(cell);
  const cellElement = screen.getByRole("gridcell");
  expected.class(cellElement);
  expect(cellElement).toHaveAttribute("aria-pressed", expected.ariaPressed);
  if (expected.text) {
    expect(cellElement).toHaveTextContent(expected.text);
  }
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
