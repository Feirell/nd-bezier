import { Point } from './point';

class CubicBezier {
    a: Point;
    b: Point;
    c: Point;
    d: Point;

    constructor(points: [Point, Point, Point, Point]) {
        this.a = points[0];
        this.b = points[1];
        this.c = points[2];
        this.d = points[3];
    }

    at(t: number): Point {
        const oneMinusT = 1 - t;

        const partX = oneMinusT * oneMinusT * oneMinusT * this.a.x +
            3 * t * oneMinusT * oneMinusT * this.b.x +
            3 * t * t * oneMinusT * this.c.x +
            t * t * t * this.d.x;

        const partY = oneMinusT * oneMinusT * oneMinusT * this.a.y +
            3 * t * oneMinusT * oneMinusT * this.b.y +
            3 * t * t * oneMinusT * this.c.y +
            t * t * t * this.d.y;

        return {
            x: partX,
            y: partY
        };
    }

}

export {
    CubicBezier
};