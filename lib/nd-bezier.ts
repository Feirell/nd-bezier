import {
    bc,
    pow,
    sum,
    levelReverse
} from './math-functions';

class NDBezier {
    private points: number[][] = [];
    private grade: number = NaN;
    private dimensions: number = NaN;

    constructor(points: number[][]) {
        this.setPoints(points);
    }

    setPoints(v: number[][]) {
        // one might want to implement some check that the correct form was used
        this.points = v;
        this.grade = v.length - 1;
        this.dimensions = v[0].length;
    }

    at(t: number): number[] {
        const oneMinusT = 1 - t;
        const points = this.points;

        const grade = this.grade;
        const dimensions = this.dimensions;

        const retValue = new Array(dimensions);

        for (let i = 0; i <= grade; i++) {
            const currentMultiplier = bc(grade, i) * pow(t, i) * pow(oneMinusT, grade - i)
            const point = points[i];

            for (let d = 0; d < dimensions; d++)
                retValue[d] = (retValue[d] || 0) + point[d] * currentMultiplier;
        }

        return retValue;
    }

    atWithIntermidiate(t: number): number[][] {
        const grade = this.grade;
        const length = grade + 1;

        const amountOfNodes = sum(length);
        const points = new Array(amountOfNodes);

        for (let i = 0; i < length; i++)
            points[i] = this.points[i];

        for (let i = length; i < amountOfNodes; i++) {
            const a = i - levelReverse(grade, i) - 2;
            const b = a + 1;

            const pa = points[a];
            const pb = points[b];
            const pc = points[i] = new Array(this.dimensions);

            for (let d = 0; d < this.dimensions; d++)
                pc[d] = pa[d] + t * (pb[d] - pa[d]);

        }

        return points;
    }
}

export {
    NDBezier
};