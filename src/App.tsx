import { useEffect, useState } from "react";

import { useGameState } from "./hooks/useGameState";
import { BoardConfig, Difficulty, GameStatus } from "./models/types";

import ControlPanel from "./components/ControlPanel";
import DifficultySelector from "./components/DifficultySelector";
import GameBoard from "./components/GameBoard";
import GameInstructions from "./components/GameInstructions";

import "./App.css";

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [customConfig, setCustomConfig] = useState<BoardConfig | undefined>(
    undefined
  );

  const {
    board,
    gameStatus,
    timeElapsed,
    minesRemaining,
    handleCellClick,
    handleCellFlag,
    resetGame,
  } = useGameState(difficulty, customConfig);

  const [prevGameStatus, setPrevGameStatus] = useState<GameStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Handle difficulty selection including custom config
  const handleDifficultySelect = (
    newDifficulty: Difficulty,
    config?: BoardConfig
  ) => {
    setDifficulty(newDifficulty);
    setCustomConfig(config);
  };

  // Handle Restart with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        resetGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetGame]);

  // Update status message when game status changes
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
      setPrevGameStatus(gameStatus);
    }
  }, [gameStatus, prevGameStatus, timeElapsed]);

  return (
    <div
      className="minesweeper-app"
      role="application"
      aria-label="Minesweeper Game"
    >
      <h1 id="game-title">Minesweeper</h1>

      <GameInstructions />

      <div className="status-announcer" aria-live="polite">
        {statusMessage}
      </div>

      <DifficultySelector
        currentDifficulty={difficulty}
        onSelectDifficulty={handleDifficultySelect}
        aria-labelledby="game-title"
      />

      <ControlPanel
        minesRemaining={minesRemaining}
        timeElapsed={timeElapsed}
        onReset={resetGame}
        gameStatus={gameStatus}
        aria-live="polite"
      />

      <GameBoard
        board={board}
        onCellClick={handleCellClick}
        onCellFlag={handleCellFlag}
        gameStatus={gameStatus}
        aria-describedby="keyboard-instructions"
      />

      <div id="keyboard-instructions" className="sr-only">
        You can navigate the game board using the keyboard. Use arrow keys to
        move between cells, press Enter or Space to reveal a cell, and press F
        to place or remove a flag. Press R to restart the game.
      </div>
    </div>
  );
}

export default App;
