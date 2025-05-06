import { useCallback, useEffect, useState } from "react";
import type { GameStatus } from "../../core/types";

export const useStatusMessage = (
  gameStatus: GameStatus,
  prevGameStatus: GameStatus,
  timeElapsed: number
) => {
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (gameStatus !== prevGameStatus) {
      switch (gameStatus) {
        case "playing":
          if (prevGameStatus === "idle") {
            setStatusMessage("Game started. Good luck!");
          }
          break;
        case "won":
          setStatusMessage(
            `Congratulations! You won in ${timeElapsed} seconds!`
          );
          break;
        case "lost":
          setStatusMessage("Game over! You hit a mine.");
          break;
        default:
          setStatusMessage("");
      }
    }
  }, [gameStatus, prevGameStatus, timeElapsed]);

  const resetStatusMessage = useCallback(() => {
    setStatusMessage("");
  }, []);

  return { statusMessage, resetStatusMessage };
};
