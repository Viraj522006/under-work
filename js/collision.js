import { CONFIG } from './config.js';
import { Board } from './board.js';
import { Shapes } from './shapes.js';

export const CollisionEngine = {
    EPSILON: 0.001,

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
        
        if (bounds.left < -this.EPSILON || bounds.right > Board.width + this.EPSILON) return false;
        if (bounds.top < -this.EPSILON || bounds.bottom > Board.height + this.EPSILON) return false;

        return true;
    },

    isOverlapping(shapeState, x, y, rotation) {
        const footprintA = this.getShapeFootprint(shapeState.type, x, y, rotation);
        const boundsA = this.getBoundsFromPoints(footprintA);

        for (const other of Shapes.placedShapes) {
            if (other.id === shapeState.id) continue;

            const footprintB = this.getShapeFootprint(other.type, other.x, other.y, other.rotation);
            const boundsB = this.getBoundsFromPoints(footprintB);

            if (this.boundsOverlap(boundsA, boundsB) && this.polygonsOverlap(footprintA, footprintB)) {
                return true;
            }
        }
        return false;
    },

    getShapeBounds(type, x, y, rotation) {
        return this.getBoundsFromPoints(this.getShapeFootprint(type, x, y, rotation));
    },

    getShapeFootprint(type, x, y, rotation) {
        const points = this.getLocalFootprint(type);
        const radians = rotation * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return points.map(point => ({
            x: x + point.x * cos - point.y * sin,
            y: y + point.x * sin + point.y * cos
        }));
    },

    getLocalFootprint(type) {
        const def = CONFIG.SHAPE_DEFS[type];

        if (type === 'circle') {
            const radius = def.width / 2;
            const points = [];
            for (let i = 0; i < 32; i++) {
                const angle = (i / 32) * Math.PI * 2;
                points.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius
                });
            }
            return points;
        }

        if (type === 'triangle') {
            return [
                { x: 0, y: -40 },
                { x: 40, y: 40 },
                { x: -40, y: 40 }
            ];
        }

        if (type === 'star') {
            return [
                { x: 0, y: -40 },
                { x: 11.7, y: -16.1 },
                { x: 38, y: -12.3 },
                { x: 19, y: 6.1 },
                { x: 23.5, y: 32.3 },
                { x: 0, y: 20 },
                { x: -23.5, y: 32.3 },
                { x: -19, y: 6.1 },
                { x: -38, y: -12.3 },
                { x: -11.7, y: -16.1 }
            ];
        }

        const halfWidth = def.width / 2;
        const halfHeight = def.height / 2;
        return [
            { x: -halfWidth, y: -halfHeight },
            { x: halfWidth, y: -halfHeight },
            { x: halfWidth, y: halfHeight },
            { x: -halfWidth, y: halfHeight }
        ];
    },

    getBoundsFromPoints(points) {
        const xs = points.map(point => point.x);
        const ys = points.map(point => point.y);

        return {
            left: Math.min(...xs),
            right: Math.max(...xs),
            top: Math.min(...ys),
            bottom: Math.max(...ys)
        };
    },

    boundsOverlap(r1, r2) {
        return !(r2.left >= r1.right - this.EPSILON ||
                 r2.right <= r1.left + this.EPSILON ||
                 r2.top >= r1.bottom - this.EPSILON ||
                 r2.bottom <= r1.top + this.EPSILON);
    },

    polygonsOverlap(polyA, polyB) {
        if (this.hasIntersectingEdges(polyA, polyB)) return true;
        if (polyA.some(point => this.pointInPolygon(point, polyB))) return true;
        if (polyB.some(point => this.pointInPolygon(point, polyA))) return true;

        return false;
    },

    hasIntersectingEdges(polyA, polyB) {
        for (let i = 0; i < polyA.length; i++) {
            const a1 = polyA[i];
            const a2 = polyA[(i + 1) % polyA.length];
            const midA = this.midpoint(a1, a2);

            if (this.pointInPolygon(midA, polyB)) {
                return true;
            }

            for (let j = 0; j < polyB.length; j++) {
                const b1 = polyB[j];
                const b2 = polyB[(j + 1) % polyB.length];
                const midB = this.midpoint(b1, b2);

                if (this.pointInPolygon(midB, polyA)) {
                    return true;
                }

                if (this.segmentsProperlyIntersect(a1, a2, b1, b2)) {
                    return true;
                }
            }
        }

        return false;
    },

    midpoint(a, b) {
        return {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2
        };
    },

    segmentsProperlyIntersect(a, b, c, d) {
        const o1 = this.orientation(a, b, c);
        const o2 = this.orientation(a, b, d);
        const o3 = this.orientation(c, d, a);
        const o4 = this.orientation(c, d, b);

        return o1 * o2 < -this.EPSILON && o3 * o4 < -this.EPSILON;
    },

    orientation(a, b, c) {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    },

    pointInPolygon(point, polygon) {
        if (this.pointOnPolygonBoundary(point, polygon)) return false;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const pi = polygon[i];
            const pj = polygon[j];
            const intersects = ((pi.y > point.y) !== (pj.y > point.y)) &&
                (point.x < (pj.x - pi.x) * (point.y - pi.y) / (pj.y - pi.y) + pi.x);

            if (intersects) inside = !inside;
        }

        return inside;
    },

    pointOnPolygonBoundary(point, polygon) {
        for (let i = 0; i < polygon.length; i++) {
            const a = polygon[i];
            const b = polygon[(i + 1) % polygon.length];

            if (this.pointOnSegment(point, a, b)) {
                return true;
            }
        }

        return false;
    },

    pointOnSegment(point, a, b) {
        const cross = this.orientation(a, b, point);
        if (Math.abs(cross) > this.EPSILON) return false;

        return point.x >= Math.min(a.x, b.x) - this.EPSILON &&
               point.x <= Math.max(a.x, b.x) + this.EPSILON &&
               point.y >= Math.min(a.y, b.y) - this.EPSILON &&
               point.y <= Math.max(a.y, b.y) + this.EPSILON;
    }
};
