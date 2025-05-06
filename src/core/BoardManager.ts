import {
  handleFirstClick,
  initializeBoard,
  revealCell,
  revealMine,
  toggleFlag,
} from "./game";
import { BoardConfig, CellData } from "./types";

export class BoardManager {
  private board: CellData[][];

  constructor(config: BoardConfig) {
    this.board = initializeBoard(config);
  }

  getBoard(): CellData[][] {
    return [...this.board];
  }

  initializeBoard(config: BoardConfig): void {
    this.board = initializeBoard(config);
  }

  handleFirstClick(config: BoardConfig, x: number, y: number): CellData[][] {
    this.board = handleFirstClick(this.board, config, x, y);
    return this.getBoard();
  }

  revealCell(x: number, y: number): CellData[][] {
    this.board = revealCell(this.board, x, y);
    return this.getBoard();
  }

  revealMine(x: number, y: number): CellData[][] {
    this.board = revealMine(this.board, x, y);
    return this.getBoard();
  }

  toggleFlag(x: number, y: number): CellData[][] {
    this.board = toggleFlag(this.board, x, y);
    return this.getBoard();
  }

  isCellFlagged(x: number, y: number): boolean {
    return this.board[y][x].isFlagged;
  }

  isCellMine(x: number, y: number): boolean {
    return this.board[y][x].isMine;
  }

  isCellRevealed(x: number, y: number): boolean {
    return this.board[y][x].isRevealed;
  }
}
