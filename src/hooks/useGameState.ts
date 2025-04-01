import { useCallback, useEffect, useRef, useState } from "react";
import {
  BoardConfig,
  CellData,
  Difficulty,
  DifficultySettings,
  GameStatus,
} from "../models/types";
import {
  checkWinCondition,
  initializeBoard,
  placeMines,
  revealCell,
} from "../utils/gameUtils";

export const useGameState = (
  difficulty: Difficulty,
  customConfig?: BoardConfig
) => {
  const config =
    difficulty === "custom" && customConfig
      ? customConfig
      : DifficultySettings[difficulty as Exclude<Difficulty, "custom">];

  const [board, setBoard] = useState<CellData[][]>(() =>
    initializeBoard(config)
  );
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [minesRemaining, setMinesRemaining] = useState(config.mines);
  const [isFirstClick, setIsFirstClick] = useState(true);

  const timerRef = useRef<number | null>(null);

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(initializeBoard(config));
    setGameStatus("idle");
    setTimeElapsed(0);
    setMinesRemaining(config.mines);
    setIsFirstClick(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [config]);

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
      if (
        gameStatus === "won" ||
        gameStatus === "lost" ||
        board[y][x].isFlagged
      ) {
        return;
      }

      let newBoard = [...board];

      if (isFirstClick) {
        // First click is always safe
        newBoard = placeMines(board, config, x, y);
        setBoard(newBoard);
        setIsFirstClick(false);
        setGameStatus("playing");

        // Process the cell reveal on the updated board with mines
        newBoard = revealCell(newBoard, x, y);
        setBoard(newBoard);

        // Check win condition
        if (checkWinCondition(newBoard)) {
          setGameStatus("won");
        }
        return; // Return after handling first click
      }

      // For subsequent clicks
      if (newBoard[y][x].isMine) {
        // Game over
        newBoard[y][x].isRevealed = true;
        setBoard(newBoard);
        setGameStatus("lost");
        return;
      }

      // Reveal the clicked cell and potentially cascade
      newBoard = revealCell(newBoard, x, y);
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

      const newBoard = [...board];
      newBoard[y][x] = {
        ...newBoard[y][x],
        isFlagged: !newBoard[y][x].isFlagged,
      };

      setBoard(newBoard);
      setMinesRemaining((prev) =>
        newBoard[y][x].isFlagged ? prev - 1 : prev + 1
      );
    },
    [board, gameStatus]
  );

  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  return {
    board,
    gameStatus,
    timeElapsed,
    minesRemaining,
    handleCellClick,
    handleCellFlag,
    resetGame,
  };
};
