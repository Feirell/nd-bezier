import {
    produceSpecificAtFunction,
    produceSpecificDerivedFunction,
    produceSpecificOffsetAtFunction
} from "./produce-specific";
import {createDeterministicTSearch} from "./deterministic-t-search";

const createSpecificAtFunction = (points: number[][]) => {
    const at = produceSpecificAtFunction(points);

    if (at == null)
        throw new Error("could not create specific function for points " + JSON.stringify(points));

    return at;
};

const createDeterministicTSearchFunction = (points: number[][]) => {
    const tSearch = createDeterministicTSearch(points);

    if (tSearch == null)
        throw new Error("could not create deterministic function for points " + JSON.stringify(points));

    return tSearch;
}

const createSpecificDerivedFunction = (points: number[][]) => {
    const derived = produceSpecificDerivedFunction(points);

    if (derived == null)
        throw new Error("could not create derived function for points " + JSON.stringify(points));

    return derived;
}

const leftMatrix = [
    [0, -1],
    [1, 0]
];

const rightMatrix = [
    [0, 1],
    [-1, 0]
];

const createSpecificOffsetAtFunction = (points: number[][], matrix: number[][]) => {
    const offset = produceSpecificOffsetAtFunction(points, matrix);

    if (offset == null)
        throw new Error("could not create offset function for points " + JSON.stringify(points));

    return offset;
}

export class StaticBezier {

    constructor(private readonly points: number[][]) {
    }

    at(t: number): number[] {
        this.at = createSpecificAtFunction(this.points);
        return this.at(t);
    }

    direction(t: number): number[] {
        this.direction = createSpecificDerivedFunction(this.points);
        return this.direction(t);
    }

    tSearch(value: number, dimension: number): number[] {
        if (this.points.length > 4)
            this.tSearch = () => {
                throw new Error('can not t search with a grade greater than 4')
            };
        else
            this.tSearch = createDeterministicTSearchFunction(this.points);

        return this.tSearch(value, dimension);
    }

    offsetPointLeft(t: number, distance: number): number[] {
        if (this.points[0].length == 2) {
            this.offsetPointLeft = createSpecificOffsetAtFunction(this.points, leftMatrix);
        } else {
            this.offsetPointLeft = () => {
                throw new Error('can not get the offset point in a ' + this.points[0].length + '-dimensional Bezier,' +
                    ' only 2-dimensional are permitted');
            }
        }

        return this.offsetPointLeft(t, distance);
    }

    offsetPointRight(t: number, distance: number): number[] {
        if (this.points[0].length == 2) {
            this.offsetPointRight = createSpecificOffsetAtFunction(this.points, leftMatrix);
        } else {
            this.offsetPointRight = () => {
                throw new Error('can not get the offset point in a ' + this.points[0].length + '-dimensional Bezier,' +
                    ' only 2-dimensional are permitted');
            }
        }

        return this.offsetPointRight(t, distance);
    }
}
