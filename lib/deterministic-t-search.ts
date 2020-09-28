import {inRange} from './util';

import {solveCubicEquation, solveLinearEquation, solveQuadraticEquation} from 'linear-quadratic-cubic-eq-solver';

import Complex from "linear-quadratic-cubic-eq-solver/cjs/complex";

const cleanSolutions = (n: (number | Complex)[]): number[] => {
    const k: number[] = [];

    for (const h of n) {
        if (typeof h == 'number')
            k.push(h);
        else if (inRange(h.im, 0, 1e-8) == 0)
            k.push(h.re);

    }

    return k as number[];
}

type Solver = (p: number[], f: number) => number[];

const solvingFunctions: Solver[] = [
    (p, f) => {
        const a = p[1] - p[0];
        const b = p[0] - f;

        return cleanSolutions(solveLinearEquation(a, b));
    },

    (p, f) => {
        const a = p[0] - 2 * p[1] + p[2];
        const b = -2 * p[0] + 2 * p[1];
        const c = p[0] - f;

        return cleanSolutions(solveQuadraticEquation(a, b, c));
    },

    (p, f) => {
        const a = -p[0] + 3 * p[1] - 3 * p[2] + p[3];
        const b = 3 * p[0] - 6 * p[1] + 3 * p[2];
        const c = -3 * p[0] + 3 * p[1];
        const d = p[0] - f;

        return cleanSolutions(solveCubicEquation(a, b, c, d));
    }
]

export function createTDeterministicTSearch(points: number[][]) {
    const grade = points.length;
    const dimension = points[0].length;

    if (grade == null || grade < 2 || grade > 4)
        return null;

    const dimensionalSplit: number[][] = [];

    for (let d = 0; d < dimension; d++) {
        const ds: number[] = [];

        for (let p = 0; p < points.length; p++)
            ds.push(points[p][d]);

        dimensionalSplit.push(ds);
    }

    const func = solvingFunctions[grade - 2];

    return (v: number, d: number) => {
        return func(dimensionalSplit[d], v);
    }
}