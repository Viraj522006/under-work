import { CONFIG } from './config.js';

export const SnapEngine = {
    snapPoint(x, y) {
        const spacing = CONFIG.PEG_SPACING;
        // Snap raw coordinates to nearest multiple of spacing
        const snappedX = Math.round(x / spacing) * spacing;
        const snappedY = Math.round(y / spacing) * spacing;
        return { x: snappedX, y: snappedY };
    }
};
