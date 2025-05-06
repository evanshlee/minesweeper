import { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine } from "../../core/GameEngine";
import {
  type BoardConfig,
  type CellData,
  type Difficulty,
  type GameStatus,
} from "../../core/types";

// 게임의 UI 상태를 하나의 인터페이스로 통합
interface GameState {
  board: CellData[][];
  gameStatus: GameStatus;
  prevGameStatus: GameStatus;
  timeElapsed: number;
  minesRemaining: number;
  isFirstClick: boolean;
  statusMessage: string;
  difficulty: Difficulty;
  customConfig?: BoardConfig;
}

export const useGameState = (
  initialDifficulty: Difficulty = "beginner",
  initialCustomConfig?: BoardConfig
) => {
  const gameEngineRef = useRef<GameEngine>(
    new GameEngine(initialDifficulty, initialCustomConfig)
  );
  const gameEngine = gameEngineRef.current;

  // 여러 개의 useState를 하나의 통합된 상태로 관리
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: gameEngine.getBoard(),
    gameStatus: gameEngine.getStatus(),
    prevGameStatus: gameEngine.getStatus(),
    timeElapsed: 0,
    minesRemaining: gameEngine.getMinesRemaining(),
    isFirstClick: true,
    statusMessage: "",
    difficulty: initialDifficulty,
    customConfig: initialCustomConfig,
  }));

  const timerRef = useRef<number | null>(null);

  // 상태 메시지 업데이트 로직
  useEffect(() => {
    if (gameState.gameStatus !== gameState.prevGameStatus) {
      const newStatusMessage = gameEngine.getStatusMessage(
        gameState.gameStatus,
        gameState.prevGameStatus,
        gameState.timeElapsed
      );

      setGameState((prev) => ({
        ...prev,
        statusMessage: newStatusMessage,
        prevGameStatus: prev.gameStatus,
      }));
    }
  }, [
    gameState.gameStatus,
    gameState.prevGameStatus,
    gameEngine,
    gameState.timeElapsed,
  ]);

  // 게임 리셋 함수 - 상태 업데이트 로직 통합
  const resetGame = useCallback(() => {
    gameEngine.resetGame();

    setGameState({
      board: gameEngine.getBoard(),
      gameStatus: gameEngine.getStatus(),
      prevGameStatus: gameState.prevGameStatus,
      timeElapsed: 0,
      minesRemaining: gameEngine.getMinesRemaining(),
      isFirstClick: true,
      statusMessage: "",
      difficulty: gameState.difficulty,
      customConfig: gameState.customConfig,
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [
    gameEngine,
    gameState.difficulty,
    gameState.customConfig,
    gameState.prevGameStatus,
  ]);

  // 타이머 시작 로직
  useEffect(() => {
    if (gameState.gameStatus === "playing" && !timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.gameStatus]);

  // 게임 종료 시 타이머 중지
  useEffect(() => {
    if (
      (gameState.gameStatus === "won" || gameState.gameStatus === "lost") &&
      timerRef.current
    ) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [gameState.gameStatus]);

  // 셀 클릭 핸들러 - 상태 업데이트 통합
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const result = gameEngine.handleCellClick(x, y);
      if (result.boardChanged) {
        setGameState((prev) => ({
          ...prev,
          board: result.board,
          gameStatus: result.status,
          isFirstClick: prev.isFirstClick ? false : prev.isFirstClick,
        }));
      }
    },
    [gameEngine]
  );

  // 깃발 설치 핸들러 - 상태 업데이트 통합
  const handleCellFlag = useCallback(
    (x: number, y: number) => {
      const result = gameEngine.handleCellFlag(x, y);
      if (result.boardChanged) {
        setGameState((prev) => ({
          ...prev,
          board: result.board,
          minesRemaining: result.minesRemaining,
        }));
      }
    },
    [gameEngine]
  );

  // 난이도 선택 핸들러 - 상태 업데이트 통합
  const handleDifficultySelect = useCallback(
    (newDifficulty: Difficulty, newCustomConfig?: BoardConfig) => {
      gameEngine.setDifficulty(newDifficulty, newCustomConfig);

      setGameState((prev) => ({
        ...prev,
        difficulty: newDifficulty,
        customConfig: newCustomConfig,
      }));
    },
    [gameEngine]
  );

  // 난이도 변경 시 게임 리셋
  useEffect(() => {
    resetGame();
  }, [gameState.difficulty, gameState.customConfig, resetGame]);

  // 필요한 값들만 외부로 노출
  return {
    board: gameState.board,
    gameStatus: gameState.gameStatus,
    timeElapsed: gameState.timeElapsed,
    minesRemaining: gameState.minesRemaining,
    statusMessage: gameState.statusMessage,
    difficulty: gameState.difficulty,
    handleCellClick,
    handleCellFlag,
    resetGame,
    handleDifficultySelect,
  };
};
