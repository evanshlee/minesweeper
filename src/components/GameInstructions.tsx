import React, { useState } from "react";
import "./GameInstructions.css";

interface GameInstructionsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({
  isOpen = false,
  onClose = () => {},
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  const handleToggle = () => {
    setIsVisible(!isVisible);
    if (isVisible) {
      onClose();
    }
  };

  return (
    <div className="game-instructions-container">
      <button
        className="help-button"
        onClick={handleToggle}
        aria-expanded={isVisible}
        aria-controls="instructions-panel"
        aria-label={isVisible ? "Hide help" : "Show help"}
      >
        {isVisible ? "❌ Hide Instructions" : "❓ How to Play"}
      </button>

      {isVisible && (
        <div
          id="instructions-panel"
          className="instructions-panel"
          role="region"
          aria-label="Game instructions"
        >
          <h2>How to Play Minesweeper</h2>

          <h3>Goal</h3>
          <p>Find all safe cells without revealing any mines.</p>

          <h3>Controls</h3>
          <h4>Mouse Controls:</h4>
          <ul>
            <li>Left-click: Reveal a cell</li>
            <li>Right-click: Place or remove a flag</li>
          </ul>

          <h4>Keyboard Controls:</h4>
          <ul>
            <li>Arrow keys: Navigate between cells</li>
            <li>Enter or Space: Reveal selected cell</li>
            <li>F: Place or remove flag on selected cell</li>
            <li>R: Restart game</li>
          </ul>

          <h3>Game Elements</h3>
          <ul>
            <li>
              <strong>Numbers:</strong> Indicate how many mines are adjacent to
              that cell
            </li>
            <li>
              <strong>Flag (🚩):</strong> Mark cells you suspect contain mines
            </li>
            <li>
              <strong>Mine (💣):</strong> Appears when you hit a mine and lose
            </li>
          </ul>

          <button
            className="close-button"
            onClick={handleToggle}
            aria-label="Close instructions"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default GameInstructions;
