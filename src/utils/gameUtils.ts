import { BoardConfig, CellData } from "../models/types";

// Initialize an empty board
export const initializeBoard = (config: BoardConfig): CellData[][] => {
  const { rows, columns } = config;
  const board: CellData[][] = [];

  for (let y = 0; y < rows; y++) {
    board[y] = [];
    for (let x = 0; x < columns; x++) {
      board[y][x] = {
        x,
        y,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      };
    }
  }

  return board;
};

// Place mines on the board, ensuring first click is safe
export const placeMines = (
  board: CellData[][],
  { rows, columns, mines }: BoardConfig,
  firstClickX: number,
  firstClickY: number
): CellData[][] => {
  const newBoard = JSON.parse(JSON.stringify(board)) as CellData[][];
  let minesPlaced = 0;

  // Create a safe zone around first click
  const safeZone = [];
  for (
    let y = Math.max(0, firstClickY - 1);
    y <= Math.min(rows - 1, firstClickY + 1);
    y++
  ) {
    for (
      let x = Math.max(0, firstClickX - 1);
      x <= Math.min(columns - 1, firstClickX + 1);
      x++
    ) {
      safeZone.push(`${x},${y}`);
    }
  }

  while (minesPlaced < mines) {
    const x = Math.floor(Math.random() * columns);
    const y = Math.floor(Math.random() * rows);
    const key = `${x},${y}`;

    if (!newBoard[y][x].isMine && !safeZone.includes(key)) {
      newBoard[y][x].isMine = true;
      minesPlaced++;

      // Update adjacent mine counts
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < rows && nx >= 0 && nx < columns) {
            newBoard[ny][nx].adjacentMines++;
          }
        }
      }
    }
  }

  return newBoard;
};

// Reveal cell and handle cascade for empty cells
export const revealCell = (
  board: CellData[][],
  x: number,
  y: number
): CellData[][] => {
  const rows = board.length;
  const columns = board[0].length;
  let newBoard = JSON.parse(JSON.stringify(board)) as CellData[][];

  // If already revealed or flagged, do nothing
  if (newBoard[y][x].isRevealed || newBoard[y][x].isFlagged) {
    return newBoard;
  }

  // Reveal the cell
  newBoard[y][x].isRevealed = true;

  // If it's an empty cell (no adjacent mines), cascade reveal
  if (newBoard[y][x].adjacentMines === 0 && !newBoard[y][x].isMine) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        if (
          ny >= 0 &&
          ny < rows &&
          nx >= 0 &&
          nx < columns &&
          !newBoard[ny][nx].isRevealed
        ) {
          newBoard = revealCell(newBoard, nx, ny);
        }
      }
    }
  }

  return newBoard;
};

// Check if game is won
export const checkWinCondition = (board: CellData[][]): boolean => {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      // If there's a non-mine cell that's not revealed, game is not won yet
      if (!board[y][x].isMine && !board[y][x].isRevealed) {
        return false;
      }
    }
  }
  return true;
};
