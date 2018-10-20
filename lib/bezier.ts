import {
    bc,
    pow,
    sum,
    pointOn,
    levelReverse
} from './math-functions';
import { Point } from './Point';

class Bezier {
    grade: number;
    points: Point[];

    constructor(points: Point[]) {
        this.grade = points.length - 1;
        this.points = points;
    }

    at(t: number): Point {
        const oneMinusT = 1 - t;
        const points = this.points;
        const grade = this.grade = points.length - 1;

        let partX = 0;
        let partY = 0;

        for (let i = 0; i <= grade; i++) {
            const currentMultiplier = bc(grade, i) * pow(t, i) * pow(oneMinusT, grade - i)
            const point = points[i];

            partX += currentMultiplier * point.x;
            partY += currentMultiplier * point.y;
        }

        return {
            x: partX,
            y: partY
        };
    }

    atWithIntermidiate(t: number): Point[] {
        const points = this.points.slice(0);

        const length = points.length;
        const grade = length - 1;

        const amountOfNodes = sum(length);
        for (let i = length; i < amountOfNodes; i++) {
            const a = i - levelReverse(grade, i) - 2;
            const b = a + 1;

            points[i] = pointOn(t, points[a], points[b]);
        }

        return points;
    }
}

export {
    Bezier
};