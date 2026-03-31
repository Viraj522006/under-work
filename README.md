# Digital Peg Board Geometry Game

An educational browser game for children to learn geometric shapes by placing them on a digital peg board.

## Features
- **Interactive Peg Board:** Snaps shapes perfectly to a grid of pegs.
- **Drag & Drop System:** Smooth custom drag and drop logic that works directly from the shape panel to the board.
- **Collision Detection:** Prevents shapes from overlapping or being placed off-board with visual red/green feedback.
- **Shape Management:** Supports adding, rotating (90 degrees), scoring, and deleting shapes without complex logic errors.
- **Audio Feedback:** Synthesizes cheerful blips and clicks using the Web Audio API on snap and rotation events. No external files need to be loaded!
- **Responsive & Deployable:** Easily scalable on web browsers with a modular architecture that requires no build step. Can be deployed straight to GitHub Pages.

## Folder Structure
```
project/
│
├── index.html       # Main HTML UI structure
├── style.css        # Interactive UI styling with CSS Grid/Flexbox
│
├── js/
│   ├── config.js    # Game constants (grid sizing, shape SVGs, colors)
│   ├── board.js     # Dynamically renders SVG peg holes over the visible area
│   ├── shapes.js    # Manages shape state, creation, storage, and DOM updates
│   ├── dragDrop.js  # Calculates mouse diffs, creates ghost shapes, updates dragging
│   ├── snap.js      # Calculates nearest grid peg coordinates
│   ├── collision.js # Predicts overlap with other pieces or boundaries
│   └── main.js      # Connects modules and UI audio/buttons
│
└── README.md        # This file
```

## How to Run Locally
1. Download or clone this repository to your computer.
2. Open the directory containing the files.
3. Simply double-click on `index.html` to open it in your default web browser. No local server or build tools are required!

## System Details

### Snapping Algorithm 
The game ensures pieces align perfectly with the pegs by rounding their raw X and Y positions. We accomplish this using:
`Math.round(coordinate / spacing) * spacing`
When dragging, the piece follows the mouse normally, but its actual applied `transform` properties run through `snap.js` first. This forces the geometry to tick firmly into position.

### Collision Detection System
The game uses a lightweight **Axis-Aligned Bounding Box (AABB)** collision check.
Before placing or rotating a block, the engine generates an AABB bounding box for the proposed new shape state based on width, height, x, y, and rotation. It then:
1. Validates the box fits strictly within the 0 to `width`/`height` bounds of the `Board`.
2. Iterates over all other `placedShapes` to verify no intersections exist.`intersect(rect1, rect2)` calculates overlap.
Invalid placements show a red aura using CSS filters (`invalid-placement`) and prevent drop completion.
