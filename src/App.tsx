import { useState } from "react";

import { useGameState } from "./hooks/useGameState";
import { Difficulty } from "./models/types";

import ControlPanel from "./components/ControlPanel";
import DifficultySelector from "./components/DifficultySelector";
import GameBoard from "./components/GameBoard";

import "./App.css";

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const {
    board,
    gameStatus,
    timeElapsed,
    minesRemaining,
    handleCellClick,
    handleCellFlag,
    resetGame,
  } = useGameState(difficulty);

  return (
    <div className="minesweeper-app">
      <h1>Minesweeper</h1>

      <DifficultySelector
        currentDifficulty={difficulty}
        onSelectDifficulty={setDifficulty}
      />

      <ControlPanel
        minesRemaining={minesRemaining}
        timeElapsed={timeElapsed}
        onReset={resetGame}
        gameStatus={gameStatus}
      />

      <GameBoard
        board={board}
        onCellClick={handleCellClick}
        onCellFlag={handleCellFlag}
        gameStatus={gameStatus}
      />
    </div>
  );
}

export default App;
