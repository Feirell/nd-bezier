import { TSearchFunction, UsableFunction } from "../types";

import { inRange } from '../util';

import * as solver from 'linear-quadratic-cubic-eq-solver';
import Complex from "linear-quadratic-cubic-eq-solver/cjs/complex";

const cleanSolutions = (n: any[]): number[] => {
    const k = [];

    for (const h of n) {
        if (h instanceof Complex) {
            if (inRange(h.im, 0, 1e-8))
                k[k.length] = h.re;
        } else
            k[k.length] = n;
    }

    return k as number[];
}

const solvingFunctions: ((p: number[], f: number) => number[])[] = [
    (p, f) => {
        const a = p[1] - p[0];
        const b = p[0] - f;

        return cleanSolutions(solver.solveLinearEquation(a, b));
    },

    (p, f) => {
        const a = p[0] - 2 * p[1] + p[2];
        const b = -2 * p[0] + 2 * p[1];
        const c = p[0] - f;

        return cleanSolutions(solver.solveQuadraticEquation(a, b, c));
    },

    (p, f) => {
        const a = -p[0] + 3 * p[1] - 3 * p[2] + p[3];
        const b = 3 * p[0] - 6 * p[1] + 3 * p[2];
        const c = -3 * p[0] + 3 * p[1];
        const d = p[0] - f;

        return cleanSolutions(solver.solveCubicEquation(a, b, c, d));
    }
]

export default Object.freeze({
    generate: (bezier) => {
        const g = bezier.getGrade();
        if (g == null || g < 2 || g > 4)
            return null;

        const func = solvingFunctions[g - 2];
        return (bp, v, d) => {
            return func(bp.points.map(v => v[d]), v);
        }
    },
    shouldReset: (g, d, p) => {
        return g;
    }
}) as UsableFunction<TSearchFunction>