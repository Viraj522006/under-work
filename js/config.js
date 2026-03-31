export const CONFIG = {
    PEG_SPACING: 40,
    PEG_RADIUS: 5,
    COLORS: {
        circle: '#ff6b6b',    // Red
        square: '#4ecdc4',    // Cyan
        triangle: '#ffe66d',  // Yellow
        rectangle: '#1a535c', // Dark Blue
        star: '#ff9f43'       // Orange
    },
    SCORE_PER_PLACEMENT: 10,
    SHAPE_DEFS: {
        // We use viewports/groups for these, all are centered at (0,0)
        // so that they naturally rotate cleanly around their center.
        circle: {
            type: 'circle',
            width: 80,
            height: 80,
            render: (color) => `<circle cx="0" cy="0" r="40" fill="${color}" />`
        },
        square: {
            type: 'square',
            width: 80,
            height: 80,
            render: (color) => `<rect x="-40" y="-40" width="80" height="80" rx="8" fill="${color}" />`
        },
        rectangle: {
            type: 'rectangle',
            width: 120, // 3 grid blocks wide
            height: 80, // 2 grid blocks high
            render: (color) => `<rect x="-60" y="-40" width="120" height="80" rx="8" fill="${color}" />`
        },
        triangle: {
            type: 'triangle',
            width: 80,
            height: 80,
            // Equilateral-ish triangle
            render: (color) => `<polygon points="0,-40 40,40 -40,40" stroke-linejoin="round" fill="${color}" />`
        },
        star: {
            type: 'star',
            width: 80,
            height: 80,
            // 5-pointed star
            render: (color) => `<polygon points="0,-40 11.7,-16.1 38,-12.3 19,6.1 23.5,32.3 0,20 -23.5,32.3 -19,6.1 -38,-12.3 -11.7,-16.1" stroke-linejoin="round" fill="${color}" />`
        }
    }
};
