import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkWinCondition,
  DifficultySettings,
  handleFirstClick,
  initializeBoard,
  revealCell,
  revealMine,
  toggleFlag,
} from "../../core/game";
import {
  type BoardConfig,
  type CellData,
  type Difficulty,
  type GameStatus,
} from "../../core/types";
import { GameLocalStorage, GameStorage } from "./GameStorage";
import { useGameTimer } from "./useGameTimer";
import { useStatusMessage } from "./useStatusMessage";

export interface GameStateForStorage {
  board: CellData[][];
  gameStatus: GameStatus;
  minesRemaining: number;
  difficulty: Difficulty;
  customConfig?: BoardConfig;
  timeElapsed: number;
}

export const useGameState = (
  initialDifficulty: Difficulty = "beginner",
  initialCustomConfig?: BoardConfig,
  storage: GameStorage<GameStateForStorage> = new GameLocalStorage<GameStateForStorage>(
    "minesweeper-game-state"
  )
) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [customConfig, setCustomConfig] = useState<BoardConfig | undefined>(
    initialCustomConfig
  );

  const config =
    difficulty === "custom" && customConfig
      ? customConfig
      : DifficultySettings[difficulty as Exclude<Difficulty, "custom">];

  const [board, setBoard] = useState<CellData[][]>(() =>
    initializeBoard(config)
  );
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [prevGameStatus, setPrevGameStatus] = useState<GameStatus>("idle");
  const [minesRemaining, setMinesRemaining] = useState(config.mines);
  const [isFirstClick, setIsFirstClick] = useState(true);

  const { timeElapsed, resetTimer, setTimeElapsed } = useGameTimer(gameStatus);
  const { statusMessage, resetStatusMessage } = useStatusMessage(
    gameStatus,
    prevGameStatus,
    timeElapsed
  );

  useEffect(() => {
    if (gameStatus !== prevGameStatus) {
      setPrevGameStatus(gameStatus);
    }
  }, [gameStatus, prevGameStatus]);

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(initializeBoard(config));
    setGameStatus("idle");
    resetTimer();
    setMinesRemaining(config.mines);
    setIsFirstClick(true);
    resetStatusMessage();
  }, [config, resetTimer, resetStatusMessage]);

  // Handle cell click
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (
        gameStatus === "won" ||
        gameStatus === "lost" ||
        board[y][x].isFlagged
      ) {
        return;
      }

      if (isFirstClick) {
        // First click is always safe
        const newBoard = handleFirstClick(board, config, x, y);
        setBoard(newBoard);
        setIsFirstClick(false);
        setGameStatus("playing");

        // Check win condition
        if (checkWinCondition(newBoard)) {
          setGameStatus("won");
        }
        return;
      }

      // For subsequent clicks
      if (board[y][x].isMine) {
        // Game over
        const newBoard = revealMine(board, x, y);
        setBoard(newBoard);
        setGameStatus("lost");
        return;
      }

      // Reveal the clicked cell and potentially cascade
      const newBoard = revealCell(board, x, y);
      setBoard(newBoard);

      // Check win condition
      if (checkWinCondition(newBoard)) {
        setGameStatus("won");
      }
    },
    [board, config, gameStatus, isFirstClick]
  );

  // Handle flag placement
  const handleCellFlag = useCallback(
    (x: number, y: number) => {
      if (
        gameStatus === "won" ||
        gameStatus === "lost" ||
        board[y][x].isRevealed
      ) {
        return;
      }

      const newBoard = toggleFlag(board, x, y);
      setBoard(newBoard);
      setMinesRemaining((prev) =>
        newBoard[y][x].isFlagged ? prev - 1 : prev + 1
      );
    },
    [board, gameStatus]
  );

  const handleDifficultySelect = useCallback(
    (newDifficulty: Difficulty, newCustomConfig?: BoardConfig) => {
      setDifficulty(newDifficulty);
      setCustomConfig(newCustomConfig);
    },
    []
  );

  const isLoadingRef = useRef(false);

  // Load game state from storage
  const loadGameState = useCallback(() => {
    try {
      const storedData = storage.load();
      if (!storedData) return;
      isLoadingRef.current = true;
      setDifficulty(storedData.difficulty);
      setCustomConfig(storedData.customConfig);
      setBoard(storedData.board);
      setGameStatus(storedData.gameStatus);
      setMinesRemaining(storedData.minesRemaining);
      setIsFirstClick(storedData.gameStatus === "idle");
      setTimeElapsed(storedData.timeElapsed ?? 0);
      // isLoadingRef.current will be set to false after the next effect
    } catch {
      // Ignore parse errors
    }
  }, [setTimeElapsed, storage]);

  // Reset game when difficulty or customConfig changes, unless loading
  useEffect(() => {
    if (isLoadingRef.current) {
      isLoadingRef.current = false;
      return;
    }
    resetGame();
  }, [difficulty, customConfig, resetGame]);

  // Save game state to storage
  const saveGameState = useCallback(() => {
    const stateToSave: GameStateForStorage = {
      board,
      gameStatus,
      minesRemaining,
      difficulty,
      customConfig,
      timeElapsed,
    };
    try {
      storage.save(stateToSave);
    } catch {
      // Ignore quota errors
    }
  }, [
    board,
    gameStatus,
    minesRemaining,
    difficulty,
    customConfig,
    timeElapsed,
    storage,
  ]);

  const [hasSavedGame, setHasSavedGame] = useState<boolean>(() =>
    storage.exists()
  );
  useEffect(() => {
    setHasSavedGame(storage.exists());
    const handler = () => setHasSavedGame(storage.exists());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storage]);

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
    saveGameState,
    loadGameState,
    hasSavedGame,
  };
};
