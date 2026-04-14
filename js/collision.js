import { CONFIG } from './config.js';
import { Board } from './board.js';
import { Shapes } from './shapes.js';

export const CollisionEngine = {
    isValidPlacement(shapeState, proposedX, proposedY, proposedRotation) {
        if (!this.isWithinBounds(shapeState, proposedX, proposedY, proposedRotation)) {
            return false;
        }

        if (this.isOverlapping(shapeState, proposedX, proposedY, proposedRotation)) {
            return false;
        }

        return true;
    },

    isWithinBounds(shapeState, x, y, rotation) {
        const bounds = this.getShapeBounds(shapeState.type, x, y, rotation);
        
        // Bounds check against board dimensions. 
        if (bounds.left < 0 || bounds.right > Board.width) return false;
        if (bounds.top < 0 || bounds.bottom > Board.height) return false;

        return true;
    },

    isOverlapping(shapeState, x, y, rotation) {
        const boundsA = this.getShapeBounds(shapeState.type, x, y, rotation);

        for (const other of Shapes.placedShapes) {
            if (other.id === shapeState.id) continue;

            const boundsB = this.getShapeBounds(other.type, other.x, other.y, other.rotation);

            if (this.intersect(boundsA, boundsB)) {
                return true;
            }
        }
        return false;
    },

    getShapeBounds(type, x, y, rotation) {
        const def = CONFIG.SHAPE_DEFS[type];
        let w = def.width;
        let h = def.height;

        const normalizedRot = ((rotation % 360) + 360) % 360;
        if (normalizedRot === 90 || normalizedRot === 270) {
            w = def.height;
            h = def.width;
        }

        return {
            left: x - w / 2,
            right: x + w / 2,
            top: y - h / 2,
            bottom: y + h / 2
        };
    },

    intersect(r1, r2) {
        const margin = 1; // small margin of error for adjacent snapping  //Changes: margin=2-->margin=1
        return !(r2.left >= r1.right - margin || 
                 r2.right <= r1.left + margin || 
                 r2.top >= r1.bottom - margin ||
                 r2.bottom <= r1.top + margin);
    }
};
