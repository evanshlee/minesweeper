import type { FC } from "react";
import { GameStatus } from "../../core/types";
import "./ControlPanel.css";

interface ControlPanelProps {
  timeElapsed: number;
  minesRemaining: number;
  gameStatus: GameStatus;
  onReset: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  hasSavedGame?: boolean;
}

const ControlPanel: FC<ControlPanelProps> = ({
  timeElapsed,
  minesRemaining,
  gameStatus,
  onReset,
  onSave,
  onLoad,
  hasSavedGame = false,
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

  // Determine emoji and status text based on game status
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

  // Get status description for screen readers
  const getStatusDescription = (): string => {
    switch (gameStatus) {
      case "won":
        return "You won the game! Click to restart.";
      case "lost":
        return "Game over. Click to restart.";
      case "playing":
        return "Game in progress. Click to restart.";
      default:
        return "Click to start a new game.";
    }
  };

  return (
    <>
      <div className="control-panel">
        <button
          className="save-button"
          onClick={onSave}
          aria-label="Save current game state"
          data-testid="save-game-btn"
          type="button"
          disabled={!onSave}
        >
          Save Game
        </button>
        <button
          className="load-button"
          onClick={onLoad}
          aria-label="Load saved game state"
          data-testid="load-game-btn"
          type="button"
          disabled={!onLoad || !hasSavedGame}
        >
          Load Game
        </button>
      </div>

      <div
        className="control-panel"
        data-testid="control-panel"
        role="group"
        aria-label="Game controls"
      >
        <div
          className="mine-counter"
          data-testid="mine-counter"
          role="status"
          aria-label={`Mines remaining: ${minesRemaining}`}
        >
          {formatMines(minesRemaining)}
        </div>

        <button
          className="reset-button"
          onClick={onReset}
          aria-label={getStatusDescription()}
          data-testid="reset-btn"
        >
          <span aria-hidden="true">{getFaceEmoji()}</span>
        </button>

        <div
          className="timer"
          data-testid="timer"
          role="timer"
          aria-label={`Time elapsed: ${timeElapsed} seconds`}
        >
          {formatTime(timeElapsed)}
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
