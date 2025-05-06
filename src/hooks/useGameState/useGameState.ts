import { useCallback, useEffect, useState } from "react";
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
import { useGameTimer } from "./useGameTimer";
import { useStatusMessage } from "./useStatusMessage";

export const useGameState = (
  initialDifficulty: Difficulty = "beginner",
  initialCustomConfig?: BoardConfig
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

  const { timeElapsed, resetTimer } = useGameTimer(gameStatus);
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
