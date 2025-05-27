import { useCallback, useEffect, useRef, useState } from "react";
import { GameStatus } from "../../core/types";

// Hook for timer management
export const useGameTimer = (gameStatus: GameStatus) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Timer start/stop management
  useEffect(() => {
    // Only start the timer when the game is in progress
    if (gameStatus === "playing" && !timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    // Stop the timer when the game ends
    else if (
      (gameStatus === "won" || gameStatus === "lost") &&
      timerRef.current
    ) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Clean up timer when component unmounts or dependencies change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStatus]);

  // Timer reset function
  const resetTimer = useCallback(() => {
    setTimeElapsed(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { timeElapsed, resetTimer, setTimeElapsed };
};
