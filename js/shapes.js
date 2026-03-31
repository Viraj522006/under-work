import { CONFIG } from './config.js';

export const Shapes = {
    shapesLayer: null,
    shapesList: null,
    placedShapes: [],
    nextId: 1,

    init() {
        this.shapesLayer = document.getElementById('shapes-layer');
        this.shapesList = document.getElementById('shapes-list');
        this.renderSelectionPanel();
    },

    renderSelectionPanel() {
        Object.entries(CONFIG.SHAPE_DEFS).forEach(([type, def]) => {
            const item = document.createElement('div');
            item.className = 'shape-item';
            item.dataset.type = type;

            const color = CONFIG.COLORS[type];
            item.innerHTML = `
                <svg class="panel-svg" viewBox="-60 -60 120 120">
                    ${def.render(color)}
                </svg>
            `;
            
            this.shapesList.appendChild(item);
        });
    },

    createShape(type, x, y) {
        const id = `shape-${this.nextId++}`;
        const def = CONFIG.SHAPE_DEFS[type];
        const color = CONFIG.COLORS[type];

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', id);
        group.classList.add('board-shape');
        
        group.setAttribute('transform', `translate(${x}, ${y}) rotate(0)`);
        group.innerHTML = def.render(color);

        const shapeState = {
            id,
            type,
            x,
            y,
            rotation: 0,
            element: group,
            width: def.width,
            height: def.height
        };

        return shapeState;
    },

    addShape(shapeState) {
        this.placedShapes.push(shapeState);
        this.shapesLayer.appendChild(shapeState.element);
    },

    removeShape(id) {
        const index = this.placedShapes.findIndex(s => s.id === id);
        if (index !== -1) {
            const shapeState = this.placedShapes[index];
            if (shapeState.element && shapeState.element.parentNode) {
                shapeState.element.parentNode.removeChild(shapeState.element);
            }
            this.placedShapes.splice(index, 1);
        }
    },

    clearAllShapes() {
        this.placedShapes.forEach(shape => {
            if (shape.element && shape.element.parentNode) {
                shape.element.parentNode.removeChild(shape.element);
            }
        });
        this.placedShapes = [];
    },

    updateShapeTransform(shapeState) {
        shapeState.element.setAttribute('transform', `translate(${shapeState.x}, ${shapeState.y}) rotate(${shapeState.rotation})`);
    },
    
    getShapeById(id) {
        return this.placedShapes.find(s => s.id === id);
    }
};
