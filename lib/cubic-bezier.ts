import { Point } from './point';

class CubicBezier {
    points: [number[], number[], number[], number[]];
    dimensions: number = NaN;

    constructor(points: [number[], number[], number[], number[]]) {
        this.points = points;
        this.dimensions = points[0].length;
    }

    at(t: number): number[] {
        const oneMinusT = 1 - t;
        const parts = new Array(this.dimensions);

        for (let i = 0; i < this.dimensions; i++)
            parts[i] = oneMinusT * oneMinusT * oneMinusT * this.points[0][i] +
                3 * t * oneMinusT * oneMinusT * this.points[1][i] +
                3 * t * t * oneMinusT * this.points[2][i] +
                t * t * t * this.points[3][i];

        return parts;
    }

}

export {
    CubicBezier
};