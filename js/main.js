import { Board } from './board.js';
import { Shapes } from './shapes.js';
import { DragDrop } from './dragDrop.js';
import { CollisionEngine } from './collision.js';
import { CONFIG } from './config.js';
import { FirebaseDB } from './firebase.js';
import { Enhancements } from './enhancements.js';

const App = {
    score: 0,
    selectedShape: null,
    audioCtx: null,
    backgroundMusicStarted: false,
    backgroundMusic: null,
    musicEnabled: false,
    deleteSoundPool: [],
    deleteSoundPoolIndex: 0,

    init() {
        Board.init();
        Shapes.init();
        DragDrop.init();

        this.initAudio();
        this.bindEvents();
        this.updateMusicToggleButton();
        Enhancements.init(this);

        DragDrop.onShapePlaced = (shape) => this.handleShapePlaced(shape);
        DragDrop.onShapeSelected = (shape) => this.handleShapeSelected(shape);

        // Initial state disable interaction buttons
        this.handleShapeSelected(null);
    },

    initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.initDeleteSound();
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    },

    initDeleteSound() {
        const deleteSoundPath = './js/assets/delete-pop.mp3';
        const poolSize = 4;

        this.deleteSoundPool = Array.from({ length: poolSize }, () => {
            const audio = new Audio(deleteSoundPath);
            audio.preload = 'auto';
            audio.volume = 1.0;
            return audio;
        });
    },

    playDeleteSound() {
        if (!this.deleteSoundPool.length) return;

        const audio = this.deleteSoundPool[this.deleteSoundPoolIndex];
        this.deleteSoundPoolIndex = (this.deleteSoundPoolIndex + 1) % this.deleteSoundPool.length;

        try {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch((err) => {
                    console.warn('Delete sound could not play.', err);
                });
            }
        } catch (err) {
            console.warn('Delete sound playback failed.', err);
        }
    },

    ensureAudioReady() {
        if (!this.audioCtx) return;

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        if (!this.backgroundMusicStarted) {
            this.startBackgroundMusic();
        }
    },

    startBackgroundMusic() {
        if (this.backgroundMusicStarted) return;

        if (!this.backgroundMusic) {
            this.backgroundMusic = new Audio('./js/assets/Carefree.mp3');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.60;
            this.backgroundMusic.preload = 'auto';
        }

        this.backgroundMusic.play().catch((err) => {
            console.warn('Background music could not start yet.', err);
        });

        this.backgroundMusicStarted = true;
        this.musicEnabled = true;
        this.updateMusicToggleButton();
    },

    toggleBackgroundMusic() {
        if (!this.backgroundMusic) {
            this.ensureAudioReady();
        }

        if (!this.backgroundMusic) return;

        if (this.backgroundMusic.paused) {
            this.backgroundMusic.play().then(() => {
                this.musicEnabled = true;
                this.backgroundMusicStarted = true;
                this.updateMusicToggleButton();
            }).catch((err) => {
                console.warn('Background music could not resume.', err);
            });
        } else {
            this.backgroundMusic.pause();
            this.musicEnabled = false;
            this.updateMusicToggleButton();
        }
    },

    updateMusicToggleButton() {
        const button = document.getElementById('btn-music-toggle');
        if (!button) return;

        button.textContent = this.musicEnabled ? '🔊 Music' : '🔇 Music';
        button.title = this.musicEnabled ? 'Mute Background Music' : 'Start Background Music';
        document.querySelector('.game-header h1')?.classList.toggle('title-music-active', this.musicEnabled);
    },

    playSound(type) {
        if (!this.audioCtx) return;

        this.ensureAudioReady();

        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        if (type === 'snap') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gainNode.gain.setValueAtTime(0.18, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'rotate') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(930, now + 0.08);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else {
            return;
        }
    },

    bindEvents() {
        document.getElementById('btn-rotate').addEventListener('click', () => this.rotateSelected());
        document.getElementById('btn-delete').addEventListener('click', () => this.deleteSelected());
        document.getElementById('btn-reset').addEventListener('click', () => this.resetBoard());

        document.getElementById('btn-save').addEventListener('click', () => this.saveCurrentDesign());
        document.getElementById('btn-load').addEventListener('click', () => this.openDesignsModal());
        document.getElementById('btn-music-toggle').addEventListener('click', () => this.toggleBackgroundMusic());
        document.getElementById('close-designs-modal').addEventListener('click', () => this.closeDesignsModal());

        document.addEventListener('keydown', (e) => {
            if (!this.selectedShape) return;
            if (e.key === 'r' || e.key === 'R') {
                this.rotateSelected();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelected();
            }
        });

        const unlockAudio = () => this.ensureAudioReady();
        document.addEventListener('pointerdown', unlockAudio, { once: true });
        document.addEventListener('keydown', unlockAudio, { once: true });
    },

    handleShapePlaced(shape) {
        this.playSound('snap');
        // Simple logic: add score if it's placed successfully 
        // We only really want to score for "new" things, but let's score for any place drop as per requirement: "+10 points per valid placement"
        this.addScore(CONFIG.SCORE_PER_PLACEMENT);
    },

    handleShapeSelected(shape) {
        if (this.selectedShape && this.selectedShape.element) {
            this.selectedShape.element.classList.remove('selected');
        }

        this.selectedShape = shape;

        const btnRotate = document.getElementById('btn-rotate');
        const btnDelete = document.getElementById('btn-delete');

        if (shape) {
            shape.element.classList.add('selected');
            btnRotate.disabled = false;
            btnDelete.disabled = false;
        } else {
            btnRotate.disabled = true;
            btnDelete.disabled = true;
        }
    },

    rotateSelected() {
        if (!this.selectedShape) return;

        const shape = this.selectedShape;
        const oldRotation = shape.rotation;

        shape.rotation = (shape.rotation + 90) % 360;

        if (CollisionEngine.isValidPlacement(shape, shape.x, shape.y, shape.rotation)) {
            Shapes.updateShapeTransform(shape);
            this.playSound('rotate');
        } else {
            shape.rotation = oldRotation;
            const el = shape.element;
            el.classList.add('invalid-placement');
            setTimeout(() => el.classList.remove('invalid-placement'), 200);
        }
    },

    async saveCurrentDesign() {
        const btnSave = document.getElementById('btn-save');
        btnSave.disabled = true;
        btnSave.textContent = 'Saving...';

        const shapesData = Shapes.placedShapes.map(s => ({
            type: s.type,
            x: s.x,
            y: s.y,
            rotation: s.rotation
        }));

        const designName = prompt("Enter a name for your design:", `Design ${new Date().toLocaleDateString()}`);
        if (!designName) {
            btnSave.disabled = false;
            btnSave.textContent = '💾 Save';
            return;
        }

        const success = await FirebaseDB.saveDesign({
            name: designName,
            score: this.score,
            shapes: shapesData
        });

        if (success) {
            alert('Design saved successfully!');
        } else {
            alert('Failed to save design. Check console for details.');
        }

        btnSave.disabled = false;
        btnSave.textContent = '💾 Save';
    },

    async openDesignsModal() {
        const modal = document.getElementById('designs-modal');
        const list = document.getElementById('designs-list');
        modal.classList.remove('hidden');
        list.innerHTML = '<p>Loading designs...</p>';

        const designs = await FirebaseDB.getUserDesigns();

        if (designs.length === 0) {
            list.innerHTML = '<p>No saved designs found.</p>';
            return;
        }

        list.innerHTML = '';
        designs.forEach(design => {
            const item = document.createElement('div');
            item.className = 'design-list-item';

            const dateStr = design.timestamp ? new Date(design.timestamp.seconds * 1000).toLocaleString() : 'Unknown date';

            item.innerHTML = `
                <div>
                    <strong>${design.name || 'Unnamed'}</strong>
                    <div class="design-meta">Shapes: ${design.shapes ? design.shapes.length : 0} | Score: ${design.score || 0}</div>
                    <div class="design-meta">${dateStr}</div>
                </div>
                <button class="load-btn">Load</button>
            `;

            item.querySelector('.load-btn').addEventListener('click', () => {
                this.loadSpecificDesign(design);
                this.closeDesignsModal();
            });

            list.appendChild(item);
        });
    },

    closeDesignsModal() {
        document.getElementById('designs-modal').classList.add('hidden');
    },

    loadSpecificDesign(design) {
        if (confirm('Loading a design will clear your current board. Continue?')) {
            Shapes.clearAllShapes();
            this.handleShapeSelected(null);
            this.score = design.score || 0;
            this.updateScoreDisplay();

            if (design.shapes && design.shapes.length > 0) {
                design.shapes.forEach(shapeData => {
                    const newShape = Shapes.createShape(shapeData.type, shapeData.x, shapeData.y);
                    newShape.rotation = shapeData.rotation || 0;
                    Shapes.updateShapeTransform(newShape);
                    Shapes.addShape(newShape);
                });
            }
        }
    },

    deleteSelected() {
        if (!this.selectedShape) return;
        this.playDeleteSound();
        Shapes.removeShape(this.selectedShape.id);
        this.handleShapeSelected(null);
    },

    resetBoard() {
        if (confirm('Are you sure you want to reset the board?')) {
            Shapes.clearAllShapes();
            this.handleShapeSelected(null);
            this.score = 0;
            this.updateScoreDisplay();
        }
    },

    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
    },

    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
