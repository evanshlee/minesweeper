import { GameLocalStorage } from "./hooks/useGameState/GameStorage";
import type { GameStateForStorage } from "./hooks/useGameState/useGameState";
import { useGameState } from "./hooks/useGameState/useGameState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts/useKeyboardShortcuts";

import ControlPanel from "./components/ControlPanel/ControlPanel";
import DifficultySelector from "./components/DifficultySelector/DifficultySelector";
import GameBoard from "./components/GameBoard/GameBoard";
import GameInstructions from "./components/GameInstructions/GameInstructions";

import "./App.css";

function App() {
  const storage = new GameLocalStorage<GameStateForStorage>(
    "minesweeper-game-state"
  );
  const {
    board,
    gameStatus,
    timeElapsed,
    minesRemaining,
    statusMessage,
    handleCellClick,
    handleCellFlag,
    resetGame,
    handleDifficultySelect,
    difficulty,
    saveGameState,
    loadGameState,
    hasSavedGame,
  } = useGameState("beginner", undefined, storage);

  // Handle Restart with keyboard shortcut
  useKeyboardShortcuts({ onRestart: resetGame });

  return (
    <div
      className="minesweeper-app"
      role="application"
      aria-label="Minesweeper Game"
    >
      <h1 id="game-title">Minesweeper</h1>

      <GameInstructions />

      <DifficultySelector
        currentDifficulty={difficulty}
        onSelectDifficulty={handleDifficultySelect}
      />

      <ControlPanel
        minesRemaining={minesRemaining}
        timeElapsed={timeElapsed}
        onReset={resetGame}
        gameStatus={gameStatus}
        onSave={saveGameState}
        onLoad={loadGameState}
        hasSavedGame={hasSavedGame}
      />

      <div className="status-announcer" aria-live="polite" role="status">
        {statusMessage}
      </div>

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
