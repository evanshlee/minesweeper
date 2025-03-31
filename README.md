# Minesweeper

## Project Overview

This project is a web version of the classic Minesweeper game. Players must find all safe cells while avoiding mines in this puzzle game.

## Feature Specifications

### Core Features

- Difficulty selection (Beginner: 9x9 grid, 10 mines / Intermediate: 16x16 grid, 40 mines / Expert: 30x16 grid, 99 mines)
- Custom difficulty settings (adjustable grid size and number of mines)
- Game timer functionality
- Remaining mine counter
- First click is always safe
- Right-click to flag potential mines
- Save game results and view records

### User Interface

- Game board: Grid composed of clickable cells
- Top panel: Timer, remaining mines counter, new game button
- Menu: Difficulty selection, game restart, records view
- Mobile compatibility: Touch interface support

## Technology Stack

- React
- TypeScript
- Vite
- Testing: Vitest, React Testing Library
- ESLint & Prettier

## How to Play

1. Select desired difficulty
2. Click a cell on the game board to start
3. Mouse controls:
   - Left-click: Reveal cell
   - Right-click: Place/remove flag
4. Keyboard controls:
   - Arrow keys: Navigate between cells
   - Space or Enter: Reveal selected cell
   - F: Place/remove flag
   - R: Restart game
5. Win by finding all safe cells
