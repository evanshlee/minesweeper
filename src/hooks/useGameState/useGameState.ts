import { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine } from "../../core/GameEngine";
import {
  type BoardConfig,
  type CellData,
  type Difficulty,
  type GameStatus,
} from "../../core/types";

export const useGameState = (
  initialDifficulty: Difficulty = "beginner",
  initialCustomConfig?: BoardConfig
) => {
  const gameEngineRef = useRef<GameEngine>(
    new GameEngine(initialDifficulty, initialCustomConfig)
  );
  const gameEngine = gameEngineRef.current;

  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [customConfig, setCustomConfig] = useState<BoardConfig | undefined>(
    initialCustomConfig
  );

  const [board, setBoard] = useState<CellData[][]>(() => gameEngine.getBoard());
  const [gameStatus, setGameStatus] = useState<GameStatus>(
    gameEngine.getStatus()
  );
  const [prevGameStatus, setPrevGameStatus] = useState<GameStatus>(
    gameEngine.getStatus()
  );
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [minesRemaining, setMinesRemaining] = useState(
    gameEngine.getMinesRemaining()
  );
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameStatus !== prevGameStatus) {
      setStatusMessage(
        gameEngine.getStatusMessage(gameStatus, prevGameStatus, timeElapsed)
      );
      setPrevGameStatus(gameStatus);
    }
  }, [gameStatus, prevGameStatus, timeElapsed, gameEngine]);

  // Reset game
  const resetGame = useCallback(() => {
    gameEngine.resetGame();
    setBoard(gameEngine.getBoard());
    setGameStatus(gameEngine.getStatus());
    setTimeElapsed(0);
    setMinesRemaining(gameEngine.getMinesRemaining());
    setIsFirstClick(true);
    setStatusMessage("");

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [gameEngine]);

  // Start timer when game begins
  useEffect(() => {
    if (gameStatus === "playing" && !timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStatus]);

  // Stop timer when game ends
  useEffect(() => {
    if ((gameStatus === "won" || gameStatus === "lost") && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [gameStatus]);

  // Handle cell click
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const result = gameEngine.handleCellClick(x, y);
      if (result.boardChanged) {
        setBoard(result.board);
        setGameStatus(result.status);
        if (isFirstClick) setIsFirstClick(false);
      }
    },
    [gameEngine, isFirstClick]
  );

  // Handle flag placement
  const handleCellFlag = useCallback(
    (x: number, y: number) => {
      const result = gameEngine.handleCellFlag(x, y);
      if (result.boardChanged) {
        setBoard(result.board);
        setMinesRemaining(result.minesRemaining);
      }
    },
    [gameEngine]
  );

  const handleDifficultySelect = useCallback(
    (newDifficulty: Difficulty, newCustomConfig?: BoardConfig) => {
      setDifficulty(newDifficulty);
      setCustomConfig(newCustomConfig);
      gameEngine.setDifficulty(newDifficulty, newCustomConfig);
    },
    [gameEngine]
  );

  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, customConfig, resetGame]);

  return {
    board,
    gameStatus,
    timeElapsed,
    minesRemaining,
    statusMessage,
    difficulty,
    handleCellClick,
    handleCellFlag,
    resetGame,
    handleDifficultySelect,
  };
};
