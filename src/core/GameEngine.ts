import {
  checkWinCondition,
  DifficultySettings,
  handleFirstClick,
  initializeBoard,
  revealCell,
  revealMine,
  toggleFlag,
} from "./game";
import {
  type BoardConfig,
  type CellData,
  type Difficulty,
  type GameStatus,
} from "./types";

export class GameEngine {
  private board: CellData[][];
  private gameStatus: GameStatus;
  private difficulty: Difficulty;
  private customConfig?: BoardConfig;
  private minesRemaining: number;
  private isFirstClick: boolean;
  private config: BoardConfig;

  constructor(
    initialDifficulty: Difficulty = "beginner",
    initialCustomConfig?: BoardConfig
  ) {
    this.difficulty = initialDifficulty;
    this.customConfig = initialCustomConfig;

    this.config = this.getConfig();
    this.board = initializeBoard(this.config);
    this.gameStatus = "idle";
    this.minesRemaining = this.config.mines;
    this.isFirstClick = true;
  }

  private getConfig(): BoardConfig {
    return this.difficulty === "custom" && this.customConfig
      ? this.customConfig
      : DifficultySettings[this.difficulty as Exclude<Difficulty, "custom">];
  }

  getBoard(): CellData[][] {
    return [...this.board];
  }

  getStatus(): GameStatus {
    return this.gameStatus;
  }

  getMinesRemaining(): number {
    return this.minesRemaining;
  }

  getDifficulty(): Difficulty {
    return this.difficulty;
  }

  resetGame(): void {
    this.config = this.getConfig();
    this.board = initializeBoard(this.config);
    this.gameStatus = "idle";
    this.minesRemaining = this.config.mines;
    this.isFirstClick = true;
  }

  setDifficulty(
    newDifficulty: Difficulty,
    newCustomConfig?: BoardConfig
  ): void {
    this.difficulty = newDifficulty;
    this.customConfig = newCustomConfig;
    this.config = this.getConfig();
  }

  handleCellClick(
    x: number,
    y: number
  ): { boardChanged: boolean; board: CellData[][]; status: GameStatus } {
    // 이미 게임이 종료되었거나 깃발이 꽂힌 셀은 무시
    if (
      this.gameStatus === "won" ||
      this.gameStatus === "lost" ||
      this.board[y][x].isFlagged
    ) {
      return {
        boardChanged: false,
        board: this.board,
        status: this.gameStatus,
      };
    }

    if (this.isFirstClick) {
      // 첫 클릭은 항상 안전하게 처리
      this.board = handleFirstClick(this.board, this.config, x, y);
      this.isFirstClick = false;
      this.gameStatus = "playing";

      // 승리 조건 확인
      if (checkWinCondition(this.board)) {
        this.gameStatus = "won";
      }

      return { boardChanged: true, board: this.board, status: this.gameStatus };
    }

    // 지뢰를 클릭한 경우
    if (this.board[y][x].isMine) {
      this.board = revealMine(this.board, x, y);
      this.gameStatus = "lost";
      return { boardChanged: true, board: this.board, status: this.gameStatus };
    }

    // 일반 셀 클릭
    this.board = revealCell(this.board, x, y);

    // 승리 조건 확인
    if (checkWinCondition(this.board)) {
      this.gameStatus = "won";
    }

    return { boardChanged: true, board: this.board, status: this.gameStatus };
  }

  handleCellFlag(
    x: number,
    y: number
  ): { boardChanged: boolean; board: CellData[][]; minesRemaining: number } {
    // 이미 게임이 종료되었거나 공개된 셀은 무시
    if (
      this.gameStatus === "won" ||
      this.gameStatus === "lost" ||
      this.board[y][x].isRevealed
    ) {
      return {
        boardChanged: false,
        board: this.board,
        minesRemaining: this.minesRemaining,
      };
    }

    this.board = toggleFlag(this.board, x, y);
    this.minesRemaining = this.board[y][x].isFlagged
      ? this.minesRemaining - 1
      : this.minesRemaining + 1;

    return {
      boardChanged: true,
      board: this.board,
      minesRemaining: this.minesRemaining,
    };
  }

  getStatusMessage(
    currentStatus: GameStatus,
    previousStatus: GameStatus,
    timeElapsed: number
  ): string {
    if (currentStatus !== previousStatus) {
      switch (currentStatus) {
        case "playing":
          if (previousStatus === "idle") {
            return "Game started. Good luck!";
          }
          break;
        case "won":
          return `Congratulations! You won in ${timeElapsed} seconds!`;
        case "lost":
          return "Game over! You hit a mine.";
      }
    }
    return "";
  }
}
