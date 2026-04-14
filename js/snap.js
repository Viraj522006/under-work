import { CONFIG } from './config.js';

export const SnapEngine = {


    snapPoint(x, y) {
    const spacing = CONFIG.PEG_SPACING;
    // Snap center to nearest peg. Since all shape widths/heights are
    // multiples of PEG_SPACING, this guarantees edges always fall on
    // grid lines — enabling perfect side-by-side adjacency.
    const snappedX = Math.round(x / spacing) * spacing;
    const snappedY = Math.round(y / spacing) * spacing;

    // Clamp to minimum of 1 spacing so shapes never go off the top-left edge
    return {
        x: Math.max(spacing, snappedX),
        y: Math.max(spacing, snappedY)
    };
}
};
