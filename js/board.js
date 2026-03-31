import { CONFIG } from './config.js';

export const Board = {
    pegsLayer: null,
    width: 0,
    height: 0,
    pegs: [], // array of {x, y}

    init() {
        this.pegsLayer = document.getElementById('pegs-layer');
        const boardContainer = document.getElementById('board-container');
        
        // Listen to window resizes to extend the board if needed
        window.addEventListener('resize', () => {
            this.resize(boardContainer.clientWidth, boardContainer.clientHeight);
        });
        
        // Initial setup
        this.resize(boardContainer.clientWidth, boardContainer.clientHeight);
    },

    resize(clientWidth, clientHeight) {
        // Expand board logical dimensions if container grows
        // but never shrink below 0 just in case
        this.width = Math.max(clientWidth, 2000); // give it plenty of room, or just match clientWidth
        this.height = Math.max(clientHeight, 2000); 
        // Note: setting width/height larger allows for drag outside normal window and scrolling if we enabled it.
        // The requirements say "shrink and scale", actually just "scalable" and "responsive"
        this.width = clientWidth;
        this.height = clientHeight;

        this.drawHoles();
    },

    drawHoles() {
        this.pegsLayer.innerHTML = '';
        this.pegs = [];

        const spacing = CONFIG.PEG_SPACING;
        
        // We draw pegs exactly on grid lines: 1*spacing, 2*spacing, etc.
        // We start from 0 if we want snapping edges, or start from spacing.
        // Starting from spacing provides a nice margin.
        for (let x = spacing; x < this.width; x += spacing) {
            for (let y = spacing; y < this.height; y += spacing) {
                this.pegs.push({ x, y });
                
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', CONFIG.PEG_RADIUS);
                circle.classList.add('peg');
                this.pegsLayer.appendChild(circle);
            }
        }
    }
};
