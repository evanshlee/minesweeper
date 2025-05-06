import { DifficultySettings } from "./game";
import { BoardConfig, Difficulty } from "./types";

export class GameConfigManager {
  private difficulty: Difficulty;
  private customConfig?: BoardConfig;

  constructor(
    initialDifficulty: Difficulty = "beginner",
    initialCustomConfig?: BoardConfig
  ) {
    this.difficulty = initialDifficulty;
    this.customConfig = initialCustomConfig;
  }

  getConfig(): BoardConfig {
    return this.difficulty === "custom" && this.customConfig
      ? this.customConfig
      : DifficultySettings[this.difficulty as Exclude<Difficulty, "custom">];
  }

  getDifficulty(): Difficulty {
    return this.difficulty;
  }

  setDifficulty(
    newDifficulty: Difficulty,
    newCustomConfig?: BoardConfig
  ): void {
    this.difficulty = newDifficulty;
    this.customConfig = newCustomConfig;
  }
}
