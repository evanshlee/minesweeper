import React, { useState } from "react";
import { BoardConfig, Difficulty, DifficultySettings } from "../models/types";
import "./DifficultySelector.css";

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty, config?: BoardConfig) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  onSelectDifficulty,
}) => {
  const [customConfig, setCustomConfig] = useState<BoardConfig>({
    rows: 10,
    columns: 10,
    mines: 15,
  });

  const [showCustomOptions, setShowCustomOptions] = useState(false);

  const handleDifficultyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newDifficulty = e.target.value as Difficulty;
    onSelectDifficulty(newDifficulty);

    if (newDifficulty === "custom") {
      setShowCustomOptions(true);
    } else {
      setShowCustomOptions(false);
    }
  };

  const handleCustomConfigChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof BoardConfig
  ): void => {
    const value = parseInt(e.target.value, 10);
    const newConfig = { ...customConfig, [field]: value };

    // Add validation logic
    if (field === "mines") {
      const maxMines = customConfig.rows * customConfig.columns - 9; // Leaving safe space for first click
      newConfig.mines = Math.min(value, maxMines);
    }

    setCustomConfig(newConfig);
    if (currentDifficulty === "custom") {
      onSelectDifficulty("custom", newConfig);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSelectDifficulty("custom", customConfig);
  };

  return (
    <div className="difficulty-selector" data-testid="difficulty-selector">
      <h3>Difficulty</h3>

      <div className="radio-options">
        {(["beginner", "intermediate", "expert", "custom"] as Difficulty[]).map(
          (difficulty) => (
            <label key={difficulty} className="radio-label">
              <input
                type="radio"
                name="difficulty"
                value={difficulty}
                checked={currentDifficulty === difficulty}
                onChange={handleDifficultyChange}
              />
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </label>
          )
        )}
      </div>

      {showCustomOptions && (
        <form onSubmit={handleCustomSubmit} className="custom-form">
          <div className="input-group">
            <label htmlFor="rows">Rows:</label>
            <input
              id="rows"
              type="number"
              min="5"
              max="24"
              value={customConfig.rows}
              onChange={(e) => handleCustomConfigChange(e, "rows")}
            />
          </div>

          <div className="input-group">
            <label htmlFor="columns">Columns:</label>
            <input
              id="columns"
              type="number"
              min="5"
              max="30"
              value={customConfig.columns}
              onChange={(e) => handleCustomConfigChange(e, "columns")}
            />
          </div>

          <div className="input-group">
            <label htmlFor="mines">Mines:</label>
            <input
              id="mines"
              type="number"
              min="1"
              max={customConfig.rows * customConfig.columns - 9}
              value={customConfig.mines}
              onChange={(e) => handleCustomConfigChange(e, "mines")}
            />
          </div>

          <button type="submit" className="apply-button">
            Apply Settings
          </button>
        </form>
      )}

      <div className="difficulty-info">
        {currentDifficulty !== "custom" ? (
          <div>
            <p>
              Board:{" "}
              {
                DifficultySettings[
                  currentDifficulty as Exclude<Difficulty, "custom">
                ].rows
              }
              ×
              {
                DifficultySettings[
                  currentDifficulty as Exclude<Difficulty, "custom">
                ].columns
              }
            </p>
            <p>
              Mines:{" "}
              {
                DifficultySettings[
                  currentDifficulty as Exclude<Difficulty, "custom">
                ].mines
              }
            </p>
          </div>
        ) : (
          <div>
            <p>
              Board: {customConfig.rows}×{customConfig.columns}
            </p>
            <p>Mines: {customConfig.mines}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DifficultySelector;
