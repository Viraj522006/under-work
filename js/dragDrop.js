import { Shapes } from './shapes.js';
import { SnapEngine } from './snap.js';
import { CollisionEngine } from './collision.js';

export const DragDrop = {
    isDragging: false,
    draggedShapeInfo: null,
    boardSvg: null,
    onShapePlaced: null,
    onShapeSelected: null,

    init() {
        this.boardSvg = document.getElementById('peg-board');
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('shapes-list').addEventListener('mousedown', (e) => {
            const item = e.target.closest('.shape-item');
            if (!item) return;

            const type = item.dataset.type;
            this.startDragNewShape(type, e.clientX, e.clientY);
            e.preventDefault();
        });

        this.boardSvg.addEventListener('mousedown', (e) => {
            const group = e.target.closest('.board-shape');
            if (!group) {
                if (this.onShapeSelected) this.onShapeSelected(null);
                return;
            }

            const id = group.getAttribute('id');
            const shapeState = Shapes.getShapeById(id);
            if (shapeState) {
                this.startDragExistingShape(shapeState, e.clientX, e.clientY);
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
    },

    getSvgCoords(clientX, clientY) {
        const pt = this.boardSvg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const cursorPt = pt.matrixTransform(this.boardSvg.getScreenCTM().inverse());
        return { x: cursorPt.x, y: cursorPt.y };
    },

    startDragNewShape(type, clientX, clientY) {
        const coords = this.getSvgCoords(clientX, clientY);
        const shapeState = Shapes.createShape(type, coords.x, coords.y);
        
        this.boardSvg.appendChild(shapeState.element);
        
        this.isDragging = true;
        this.draggedShapeInfo = {
            isNew: true,
            shapeState,
            offsetX: 0,
            offsetY: 0,
            startX: coords.x,
            startY: coords.y
        };

        shapeState.element.classList.add('is-dragging');
        shapeState.element.classList.add('selected');
        if (this.onShapeSelected) this.onShapeSelected(shapeState);
    },

    startDragExistingShape(shapeState, clientX, clientY) {
        const coords = this.getSvgCoords(clientX, clientY);
        
        this.boardSvg.appendChild(shapeState.element);

        this.isDragging = true;
        this.draggedShapeInfo = {
            isNew: false,
            shapeState,
            offsetX: shapeState.x - coords.x,
            offsetY: shapeState.y - coords.y,
            startX: shapeState.x,
            startY: shapeState.y
        };

        shapeState.element.classList.add('is-dragging');
        shapeState.element.classList.add('selected');
        if (this.onShapeSelected) this.onShapeSelected(shapeState);
    },

    onMouseMove(e) {
        if (!this.isDragging || !this.draggedShapeInfo) return;

        const coords = this.getSvgCoords(e.clientX, e.clientY);
        const info = this.draggedShapeInfo;
        const state = info.shapeState;

        const rawX = coords.x + info.offsetX;
        const rawY = coords.y + info.offsetY;

        const snapped = SnapEngine.snapShape(state, rawX, rawY);

        state.x = snapped.x;
        state.y = snapped.y;

        Shapes.updateShapeTransform(state);

        const isValid = CollisionEngine.isValidPlacement(state, state.x, state.y, state.rotation);
        
        state.element.classList.remove('valid-placement', 'invalid-placement');
        if (isValid) {
            state.element.classList.add('valid-placement');
        } else {
            state.element.classList.add('invalid-placement');
        }
    },

    onMouseUp(e) {
        if (!this.isDragging || !this.draggedShapeInfo) return;

        const info = this.draggedShapeInfo;
        const state = info.shapeState;
        
        state.element.classList.remove('is-dragging');
        state.element.classList.remove('valid-placement', 'invalid-placement');

        const isValid = CollisionEngine.isValidPlacement(state, state.x, state.y, state.rotation);

        if (isValid) {
            if (info.isNew) {
                Shapes.addShape(state);
                if (this.onShapePlaced) this.onShapePlaced(state);
            } else {
                // If it moved from its start position, we could count it as a "placement" again,
                // but requirement just says snap to point. A valid placement might trigger a sound.
                if (state.x !== info.startX || state.y !== info.startY) {
                    if (this.onShapePlaced) this.onShapePlaced(state);
                }
            }
        } else {
            if (info.isNew) {
                if (state.element.parentNode) {
                    state.element.parentNode.removeChild(state.element);
                }
                if (this.onShapeSelected) this.onShapeSelected(null);
            } else {
                state.x = info.startX;
                state.y = info.startY;
                Shapes.updateShapeTransform(state);
            }
        }

        this.isDragging = false;
        this.draggedShapeInfo = null;
    }
};
