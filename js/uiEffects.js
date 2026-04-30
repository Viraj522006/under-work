const UIEffects = {
    sparkleLayer: null,
    lastScore: 0,

    init() {
        this.sparkleLayer = document.createElement('div');
        this.sparkleLayer.className = 'ui-sparkle-layer';
        document.body.appendChild(this.sparkleLayer);

        this.watchScore();
        this.watchPlacedShapes();
        this.bindShapePanelFeedback();
        this.bindPegFeedback();
        this.bindBoardCelebration();
    },

    watchScore() {
        const score = document.getElementById('score');
        const scoreContainer = score?.closest('.score-container');
        if (!score || !scoreContainer) return;

        this.lastScore = Number(score.textContent) || 0;

        new MutationObserver(() => {
            const nextScore = Number(score.textContent) || 0;
            if (nextScore <= this.lastScore) {
                this.lastScore = nextScore;
                return;
            }

            scoreContainer.classList.remove('score-pop');
            void scoreContainer.offsetWidth;
            scoreContainer.classList.add('score-pop');
            this.burstAtElement(scoreContainer, 8);

            const selectedShape = document.querySelector('.board-shape.selected');
            if (selectedShape) {
                this.burstAtElement(selectedShape, 10);
                this.bounceShape(selectedShape);
            }

            this.lastScore = nextScore;
        }).observe(score, { childList: true, characterData: true, subtree: true });
    },

    watchPlacedShapes() {
        const shapesLayer = document.getElementById('shapes-layer');
        if (!shapesLayer) return;

        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof SVGElement) || !node.classList.contains('board-shape')) return;
                    this.bounceShape(node);
                    this.burstAtElement(node, 12);
                });
            });
        }).observe(shapesLayer, { childList: true });
    },

    bindShapePanelFeedback() {
        const shapesList = document.getElementById('shapes-list');
        if (!shapesList) return;

        shapesList.addEventListener('pointerdown', (event) => {
            const item = event.target.closest('.shape-item');
            if (!item) return;

            shapesList.querySelectorAll('.shape-item.is-picked').forEach((picked) => {
                picked.classList.remove('is-picked');
            });
            item.classList.add('is-picked');
        });
    },

    bindPegFeedback() {
        const board = document.getElementById('peg-board');
        if (!board) return;

        board.addEventListener('pointerdown', (event) => {
            const peg = event.target.closest('.peg');
            if (!peg) return;

            peg.classList.add('peg-tap');
            window.setTimeout(() => peg.classList.remove('peg-tap'), 220);
        });
    },

    bindBoardCelebration() {
        const board = document.getElementById('peg-board');
        if (!board) return;

        board.addEventListener('pointerup', () => {
            const validShape = document.querySelector('.board-shape.valid-placement, .board-shape.selected');
            if (!validShape) return;
            this.burstAtElement(validShape, 6);
        });
    },

    bounceShape(shape) {
        shape.classList.remove('shape-bounce');
        void shape.getBoundingClientRect();
        shape.classList.add('shape-bounce');
    },

    burstAtElement(element, count) {
        const rect = element.getBoundingClientRect();
        if (!rect.width && !rect.height) return;

        this.createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, count);
    },

    createBurst(x, y, count) {
        const colors = ['#ffd166', '#ff9f1c', '#4ecdc4', '#7bdff2', '#ffb7c5'];

        for (let i = 0; i < count; i += 1) {
            const sparkle = document.createElement('span');
            const angle = (Math.PI * 2 * i) / count;
            const distance = 34 + Math.random() * 34;

            sparkle.className = 'ui-sparkle';
            sparkle.textContent = i % 3 === 0 ? '✦' : '★';
            sparkle.style.setProperty('--spark-x', `${x}px`);
            sparkle.style.setProperty('--spark-y', `${y}px`);
            sparkle.style.setProperty('--spark-dx', `${Math.cos(angle) * distance}px`);
            sparkle.style.setProperty('--spark-dy', `${Math.sin(angle) * distance}px`);
            sparkle.style.setProperty('--spark-rotate', `${Math.round(Math.random() * 180)}deg`);
            sparkle.style.setProperty('--spark-delay', `${i * 14}ms`);
            sparkle.style.setProperty('--spark-color', colors[i % colors.length]);
            sparkle.style.setProperty('--spark-size', `${14 + Math.round(Math.random() * 10)}px`);

            this.sparkleLayer.appendChild(sparkle);
            window.setTimeout(() => sparkle.remove(), 980);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => UIEffects.init());
