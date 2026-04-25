export const Enhancements = {
    app: null,
    boardSvg: null,
    lastTouchTime: 0,
    colorPalette: null,
    activeShape: null,
    colors: [
        '#ff1744', '#ff3d00', '#ff6d00', '#ff9100', '#ffab00', '#ffd600', '#ffea00',
        '#c6ff00', '#76ff03', '#00e676', '#00c853', '#1de9b6', '#00bfa5', '#00e5ff',
        '#00b8d4', '#40c4ff', '#0091ea', '#2979ff', '#2962ff', '#536dfe', '#3d5afe',
        '#651fff', '#7c4dff', '#b388ff', '#aa00ff', '#d500f9', '#e040fb', '#ff40ff',
        '#ff00cc', '#ff4081', '#f50057', '#ff80ab', '#ff8a80', '#ff5252', '#ff867c',
        '#ffb74d', '#ffe082', '#fff176', '#dce775', '#b2ff59', '#69f0ae', '#64ffda',
        '#84ffff', '#80d8ff', '#82b1ff', '#8c9eff', '#b39ddb', '#ce93d8', '#f48fb1',
        '#bcaaa4', '#a1887f', '#90a4ae', '#b0bec5', '#ffffff', '#263238', '#000000'
    ],

    init(app) {
        this.app = app;
        this.boardSvg = document.getElementById('peg-board');

        if (!this.boardSvg) return;

        this.createColorPalette();

        this.boardSvg.addEventListener('click', (e) => {
            if (Date.now() - this.lastTouchTime < 500) return;
            this.handleInteraction(e.target.closest('.board-shape'));
        });

        this.boardSvg.addEventListener('touchend', (e) => {
            const shapeElement = e.target.closest('.board-shape');
            if (!shapeElement) return;

            this.lastTouchTime = Date.now();
            this.handleInteraction(shapeElement);
        }, { passive: true });

        document.addEventListener('pointerdown', (e) => {
            if (!this.colorPalette || this.colorPalette.classList.contains('hidden')) return;
            if (this.colorPalette.contains(e.target) || e.target.closest('.board-shape')) return;
            this.hideColorPalette();
        });
    },

    handleInteraction(shapeElement) {
        if (!shapeElement || shapeElement.classList.contains('is-dragging')) return;

        console.log('Shape clicked');
        this.showColorPalette(shapeElement);
        this.animateShape(shapeElement);

        if (this.app && typeof this.app.playSound === 'function') {
            this.app.playSound('click');
        }
    },

    createColorPalette() {
        this.colorPalette = document.createElement('div');
        this.colorPalette.className = 'shape-color-palette hidden';
        this.colorPalette.setAttribute('aria-label', 'Shape color options');

        this.colors.forEach((color, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'shape-color-option';
            button.style.setProperty('--shape-color-option', color);
            button.style.setProperty('--option-index', index);
            button.setAttribute('aria-label', `Apply ${color}`);
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.activeShape) {
                    this.applySelectedColor(this.activeShape, color);
                }
                this.hideColorPalette();
            });
            this.colorPalette.appendChild(button);
        });

        document.body.appendChild(this.colorPalette);
    },

    showColorPalette(shapeElement) {
        if (!this.colorPalette) return;

        const shapeRect = shapeElement.getBoundingClientRect();
        const buttonSize = 16;
        const ringRadius = Math.max(96, Math.min(140, Math.max(shapeRect.width, shapeRect.height) / 2 + 88));
        const minX = ringRadius + buttonSize;
        const maxX = Math.max(minX, window.innerWidth - ringRadius - buttonSize);
        const minY = ringRadius + buttonSize;
        const maxY = Math.max(minY, window.innerHeight - ringRadius - buttonSize);
        const centerX = Math.min(Math.max(shapeRect.left + shapeRect.width / 2, minX), maxX);
        const centerY = Math.min(Math.max(shapeRect.top + shapeRect.height / 2, minY), maxY);

        this.colorPalette.classList.remove('hidden');
        this.colorPalette.classList.remove('is-open');
        this.colorPalette.style.display = 'flex';
        this.colorPalette.style.visibility = 'visible';
        this.colorPalette.style.opacity = '1';

        this.activeShape = shapeElement;
        this.colorPalette.style.left = '0';
        this.colorPalette.style.top = '0';

        Array.from(this.colorPalette.children).forEach((button, index) => {
            const angle = (Math.PI * 2 * index) / this.colors.length - Math.PI / 2;
            const x = centerX + Math.cos(angle) * ringRadius;
            const y = centerY + Math.sin(angle) * ringRadius;
            button.style.left = `${x}px`;
            button.style.top = `${y}px`;
        });

        requestAnimationFrame(() => {
            this.colorPalette.classList.add('is-open');
            console.log('Palette visible');
        });
    },

    hideColorPalette() {
        if (!this.colorPalette) return;

        this.activeShape = null;
        this.colorPalette.classList.remove('is-open');
        this.colorPalette.classList.add('hidden');
        this.colorPalette.style.display = '';
    },

    applySelectedColor(shapeElement, color) {
        const fillTargets = shapeElement.querySelectorAll('[fill]');

        fillTargets.forEach((node) => {
            node.dataset.baseFill = color;
            node.setAttribute('fill', color);
        });
    },

    animateShape(shapeElement) {
        shapeElement.classList.remove('shape-bounce');
        void shapeElement.getBoundingClientRect();
        shapeElement.classList.add('shape-bounce');
    }
};
