import { useEffect, useState } from "react";
import { BoardConfig, Difficulty, DifficultySettings } from "../../core/types";
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

  const [showCustomOptions, setShowCustomOptions] = useState(
    currentDifficulty === "custom"
  );

  // When difficulty changes to custom, ensure we immediately provide the custom config
  useEffect(() => {
    if (currentDifficulty === "custom") {
      setShowCustomOptions(true);
    }
  }, [currentDifficulty]);

  const handleDifficultyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newDifficulty = e.target.value as Difficulty;

    if (newDifficulty === "custom") {
      setShowCustomOptions(true);
      // Always pass the custom config when selecting custom
      onSelectDifficulty(newDifficulty, customConfig);
    } else {
      setShowCustomOptions(false);
      onSelectDifficulty(newDifficulty);
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

  // Calculate max mines based on board size
  const maxMines = customConfig.rows * customConfig.columns - 9;

  return (
    <div
      className="difficulty-selector"
      data-testid="difficulty-selector"
      role="region"
      aria-labelledby="difficulty-heading"
    >
      <h2 id="difficulty-heading">Difficulty</h2>

      <div
        className="radio-options"
        role="radiogroup"
        aria-labelledby="difficulty-heading"
      >
        {(["beginner", "intermediate", "expert", "custom"] as Difficulty[]).map(
          (difficulty) => (
            <label key={difficulty} className="radio-label">
              <input
                type="radio"
                name="difficulty"
                value={difficulty}
                checked={currentDifficulty === difficulty}
                onChange={handleDifficultyChange}
                aria-checked={currentDifficulty === difficulty}
              />
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </label>
          )
        )}
      </div>

      {showCustomOptions && (
        <form
          onSubmit={handleCustomSubmit}
          className="custom-form"
          aria-labelledby="custom-settings-heading"
        >
          <h3 id="custom-settings-heading" className="sr-only">
            Custom Settings
          </h3>

          <div className="input-group">
            <label htmlFor="rows">Rows:</label>
            <input
              id="rows"
              type="number"
              min="5"
              max="24"
              value={customConfig.rows}
              onChange={(e) => handleCustomConfigChange(e, "rows")}
              aria-valuemin={5}
              aria-valuemax={24}
              aria-valuenow={customConfig.rows}
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
              aria-valuemin={5}
              aria-valuemax={30}
              aria-valuenow={customConfig.columns}
            />
          </div>

          <div className="input-group">
            <label htmlFor="mines">Mines:</label>
            <input
              id="mines"
              type="number"
              min="1"
              max={maxMines}
              value={customConfig.mines}
              onChange={(e) => handleCustomConfigChange(e, "mines")}
              aria-valuemin={1}
              aria-valuemax={maxMines}
              aria-valuenow={customConfig.mines}
            />
          </div>

          <button type="submit" className="apply-button">
            Apply Settings
          </button>
        </form>
      )}

      <div className="difficulty-info" aria-live="polite">
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
