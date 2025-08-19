# Chess Game

A drag-and-drop chess game written in TypeScript using HTML5 Canvas with a 2D rendering context, featuring castling, pawn promotion, and visual effects for an immersive gameplay experience.

---

## Features

- **Castling:** Both kingside and queenside castling implemented according to official chess rules.
- **Pawn Promotion:** Pawns promote to any piece upon reaching the opposite end.
- **Visual Effects:** Previous moves are highlighted and moves made in check are highlighted in red.
- **Modular Codebase:** Code refactored into smaller, reusable components for better maintainability and scalability.
- **Turn-based Gameplay:** Standard chess rules with full move validation.

---

## Development Details

- Written in **TypeScript** for type safety and modern JavaScript features.
- Uses **HTML5 Canvas API** for rendering the chessboard and pieces.
- Code is broken into smaller, reusable modules to simplify maintenance and enhance scalability.

## Important Considerations

- The current implementation relies on mouse events (`mousedown`, `mouseup`, `mousemove`) for piece movement.
- As a result, the game **only works properly on desktop devices** using a mouse.
- Touch support (for mobile/tablet devices) is not yet implemented.
- Future improvements could include adding touch event handlers to support mobile interactions.

## Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sha-io/chess.git
   cd chess

2. **Install dependencies:**

   ```bash
   npm install

3. **Run the game:**

   ```bash
   npm run dev
   
4. **Open the game in your browser:**

   ```bash
   http://localhost:5173

