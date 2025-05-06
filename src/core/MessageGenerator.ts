import { GameStatus } from "./types";

export class MessageGenerator {
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
