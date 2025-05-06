import { BoardManager } from "./BoardManager";
import { GameConfigManager } from "./GameConfigManager";
import { GameStateManager } from "./GameStateManager";
import { MessageGenerator } from "./MessageGenerator";
import {
  type BoardConfig,
  type CellData,
  type Difficulty,
  type GameStatus,
} from "./types";

export class GameEngine {
  private boardManager: BoardManager;
  private stateManager: GameStateManager;
  private configManager: GameConfigManager;
  private messageGenerator: MessageGenerator;

  constructor(
    initialDifficulty: Difficulty = "beginner",
    initialCustomConfig?: BoardConfig
  ) {
    this.configManager = new GameConfigManager(
      initialDifficulty,
      initialCustomConfig
    );
    const config = this.configManager.getConfig();
    this.boardManager = new BoardManager(config);
    this.stateManager = new GameStateManager(config.mines);
    this.messageGenerator = new MessageGenerator();
  }

  getBoard(): CellData[][] {
    return this.boardManager.getBoard();
  }

  getStatus(): GameStatus {
    return this.stateManager.getStatus();
  }

  getMinesRemaining(): number {
    return this.stateManager.getMinesRemaining();
  }

  getDifficulty(): Difficulty {
    return this.configManager.getDifficulty();
  }

  resetGame(): void {
    const config = this.configManager.getConfig();
    this.boardManager.initializeBoard(config);
    this.stateManager.resetState(config.mines);
  }

  setDifficulty(
    newDifficulty: Difficulty,
    newCustomConfig?: BoardConfig
  ): void {
    this.configManager.setDifficulty(newDifficulty, newCustomConfig);
  }

  handleCellClick(
    x: number,
    y: number
  ): { boardChanged: boolean; board: CellData[][]; status: GameStatus } {
    // 이미 게임이 종료되었거나 깃발이 꽂힌 셀은 무시
    if (
      this.stateManager.isGameEnded() ||
      this.boardManager.isCellFlagged(x, y)
    ) {
      return {
        boardChanged: false,
        board: this.getBoard(),
        status: this.getStatus(),
      };
    }

    if (this.stateManager.isFirstClick()) {
      // 첫 클릭은 항상 안전하게 처리
      const board = this.boardManager.handleFirstClick(
        this.configManager.getConfig(),
        x,
        y
      );
      this.stateManager.setFirstClick(false);
      this.stateManager.setStatus("playing");

      // 승리 조건 확인
      this.stateManager.checkWinCondition(board);

      return { boardChanged: true, board, status: this.getStatus() };
    }

    // 지뢰를 클릭한 경우
    if (this.boardManager.isCellMine(x, y)) {
      const board = this.boardManager.revealMine(x, y);
      this.stateManager.setStatus("lost");
      return { boardChanged: true, board, status: this.getStatus() };
    }

    // 일반 셀 클릭
    const board = this.boardManager.revealCell(x, y);

    // 승리 조건 확인
    this.stateManager.checkWinCondition(board);

    return { boardChanged: true, board, status: this.getStatus() };
  }

  handleCellFlag(
    x: number,
    y: number
  ): { boardChanged: boolean; board: CellData[][]; minesRemaining: number } {
    // 이미 게임이 종료되었거나 공개된 셀은 무시
    if (
      this.stateManager.isGameEnded() ||
      this.boardManager.isCellRevealed(x, y)
    ) {
      return {
        boardChanged: false,
        board: this.getBoard(),
        minesRemaining: this.getMinesRemaining(),
      };
    }

    const wasAlreadyFlagged = this.boardManager.isCellFlagged(x, y);
    const board = this.boardManager.toggleFlag(x, y);

    // 깃발 상태가 변경되었으므로 남은 지뢰 수 업데이트
    // 이전에 깃발이 있었다면 +1, 없었다면 -1
    this.stateManager.updateMinesRemaining(wasAlreadyFlagged ? 1 : -1);

    return {
      boardChanged: true,
      board,
      minesRemaining: this.getMinesRemaining(),
    };
  }

  getStatusMessage(
    currentStatus: GameStatus,
    previousStatus: GameStatus,
    timeElapsed: number
  ): string {
    return this.messageGenerator.getStatusMessage(
      currentStatus,
      previousStatus,
      timeElapsed
    );
  }
}
