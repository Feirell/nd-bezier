import {
    bc,
    pow,
    sum,
    levelReverse
} from './math-functions';

class NDBezier {
    private _points: number[][] = [];
    private _grade: number = NaN;
    private _dimensions: number = NaN;

    constructor(points: number[][]) {
        this.points = points;
    }

    set points(v: number[][]) {
        // one might want to implement some check that the correct form was used
        this._points = v;
        this._grade = v.length - 1;
        this._dimensions = v[0].length;
    }

    get points(): number[][] {
        return this._points;
    }

    get grade(): number {
        return this._grade;
    }

    get dimensions(): number {
        return this._dimensions;
    }

    at(t: number): number[] {
        const oneMinusT = 1 - t;
        const points = this.points;

        const grade = this.grade;
        const dimensions = this.dimensions;

        const retValue = new Array(dimensions);
        for (let d = 0; d < dimensions; d++)
            retValue[d] = 0;

        for (let i = 0; i <= grade; i++) {
            const currentMultiplier = bc(grade, i) * pow(t, i) * pow(oneMinusT, grade - i)
            const point = points[i];

            for (let d = 0; d < dimensions; d++)
                retValue[d] += point[d] * currentMultiplier;
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