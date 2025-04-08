import type { FC } from "react";
import { GameStatus } from "../../models/types";
import "./ControlPanel.css";

interface ControlPanelProps {
  timeElapsed: number;
  minesRemaining: number;
  gameStatus: GameStatus;
  onReset: () => void;
}

const ControlPanel: FC<ControlPanelProps> = ({
  timeElapsed,
  minesRemaining,
  gameStatus,
  onReset,
}) => {
  // Format time as 3-digit display (000-999)
  const formatTime = (time: number): string => {
    return time > 999 ? "999" : time.toString().padStart(3, "0");
  };

  // Format mines as 3-digit display with potentially negative values
  const formatMines = (mines: number): string => {
    if (mines < 0) {
      return "-" + Math.abs(mines).toString().padStart(2, "0");
    }
    return mines > 999 ? "999" : mines.toString().padStart(3, "0");
  };

  // Determine emoji based on game status
  const getFaceEmoji = (): string => {
    switch (gameStatus) {
      case "won":
        return "😎"; // Cool face for win
      case "lost":
        return "😵"; // Dead face for loss
      case "playing":
        return "🙂"; // Smile for playing
      default:
        return "🙂"; // Default smile
    }
  };

  return (
    <div className="control-panel" data-testid="control-panel">
      <div className="mine-counter" data-testid="mine-counter">
        {formatMines(minesRemaining)}
      </div>

      <button
        className="reset-button"
        onClick={onReset}
        aria-label="Reset game"
      >
        {getFaceEmoji()}
      </button>

      <div className="timer" data-testid="timer">
        {formatTime(timeElapsed)}
      </div>
    </div>
  );
};

export default ControlPanel;
