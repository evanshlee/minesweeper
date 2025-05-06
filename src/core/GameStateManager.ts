import { checkWinCondition } from "./game";
import { CellData, GameStatus } from "./types";

export class GameStateManager {
  private gameStatus: GameStatus;
  private minesRemaining: number;
  private firstClickPending: boolean;

  constructor(initialMines: number) {
    this.gameStatus = "idle";
    this.minesRemaining = initialMines;
    this.firstClickPending = true;
  }

  getStatus(): GameStatus {
    return this.gameStatus;
  }

  setStatus(status: GameStatus): void {
    this.gameStatus = status;
  }

  getMinesRemaining(): number {
    return this.minesRemaining;
  }

  setMinesRemaining(count: number): void {
    this.minesRemaining = count;
  }

  updateMinesRemaining(delta: number): void {
    this.minesRemaining += delta;
  }

  isGameEnded(): boolean {
    return this.gameStatus === "won" || this.gameStatus === "lost";
  }

  isFirstClick(): boolean {
    return this.firstClickPending;
  }

  setFirstClick(value: boolean): void {
    this.firstClickPending = value;
  }

  resetState(minesCount: number): void {
    this.gameStatus = "idle";
    this.minesRemaining = minesCount;
    this.firstClickPending = true;
  }

  checkWinCondition(board: CellData[][]): boolean {
    const isWon = checkWinCondition(board);
    if (isWon) {
      this.gameStatus = "won";
    }
    return isWon;
  }
}
