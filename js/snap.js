import { CONFIG } from './config.js';

export const SnapEngine = {
    snapPoint(x, y) {
        const spacing = CONFIG.PEG_SPACING;
        // Snap raw coordinates to nearest multiple of spacing
        const snappedX = Math.round(x / spacing) * spacing;
        const snappedY = Math.round(y / spacing) * spacing;
        return { x: snappedX, y: snappedY };
    },

    snapShape(shapeState, x, y) {
        const spacing = CONFIG.PEG_SPACING;
        const { width, height } = this.getRotatedSize(shapeState);
        const offsetX = this.getCenterOffset(width, spacing);
        const offsetY = this.getCenterOffset(height, spacing);

        return {
            x: this.snapValue(x, spacing, offsetX),
            y: this.snapValue(y, spacing, offsetY)
        };
    },

    getRotatedSize(shapeState) {
        const normalizedRotation = ((shapeState.rotation % 360) + 360) % 360;
        const isQuarterTurn = normalizedRotation === 90 || normalizedRotation === 270;

        return {
            width: isQuarterTurn ? shapeState.height : shapeState.width,
            height: isQuarterTurn ? shapeState.width : shapeState.height
        };
    },

    getCenterOffset(size, spacing) {
        return (size / 2) % spacing;
    },

    snapValue(value, spacing, offset) {
        return Math.round((value - offset) / spacing) * spacing + offset;
    }
};
