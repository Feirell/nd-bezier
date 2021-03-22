import {getDynamicBezier} from "./dynamic-bezier";
import {Points} from "./bezier-definitions";
import {StaticBezier as NewStaticBezier} from "./static-bezier";

import {StaticBezier} from "../src/static-bezier";
import {solveCubicEquation} from "linear-quadratic-cubic-eq-solver";
import {cleanSolutions} from "./body-constructor/polynomial-solver";

declare var console: { [key: string]: (...args: any[]) => void };

const points: Points<4, 2> = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0]
];

const Bez4_2 = getDynamicBezier(4, 2);

const inst = new Bez4_2(points);

const staticBezier = new StaticBezier(points);
const newStatBezier = new NewStaticBezier(points);

staticBezier.tSearch(0, 0);
newStatBezier.tSearch(0, 0);

console.log('' + staticBezier.tSearch);
console.log('' + newStatBezier.tSearch);

const solvePolynomial = solveCubicEquation;

const coeffs = [
    [-2, 3, 0, 0],
    [0, -3, 3, 0]
]

const improvedStatic = {
    at: (staticBezier.at(0), staticBezier.at),
    tSearch(tSearchDimension: number, tSearch: number) {
        return cleanSolutions(solvePolynomial(
            coeffs[tSearchDimension][0],
            coeffs[tSearchDimension][1],
            coeffs[tSearchDimension][2],
            coeffs[tSearchDimension][3] - tSearch
        ));
        "use strict";
        // let solutions;
        // if (0 == tSearchDimension) {
        // const coeff0_0 = -0 + 0 * 3 - 1 * 3 + 1;
        // const coeff0_1 = 0 * 3 - 0 * 6 + 1 * 3;
        // const coeff0_2 = -0 * 3 + 0 * 3;
        // const coeff0_3 = 0;

        //     return cleanSolutions(solvePolynomial(
        //         -2,
        //         3,
        //         0,
        //         0 - tSearch
        //     ));
        // } else if (1 == tSearchDimension) {
        // const coeff1_0 = -0 + 1 * 3 - 1 * 3 + 0;
        // const coeff1_1 = 0 * 3 - 1 * 6 + 1 * 3;
        // const coeff1_2 = -0 * 3 + 1 * 3;
        // const coeff1_3 = 0;

        //     return cleanSolutions(solvePolynomial(
        //         0,
        //         -3,
        //         3,
        //         0 - tSearch
        //     ));
        // }

        // solutions = cleanSolutions(solutions);

        // return solutions;
    }
};

const steps = 4;
for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    console.group('t = ' + t);

    console.log('at:');

    const point = inst.at(t);

    console.log(inst.at(t));
    console.log(newStatBezier.at(t));
    console.log(staticBezier.at(t));

    console.log('derivative:');

    console.log(inst.direction(t));
    console.log(newStatBezier.direction(t));
    console.log(staticBezier.direction(t));

    console.log('offset right:');

    console.log(inst.offsetPointRight(t, 10));
    console.log(newStatBezier.offsetPointRight(t, 10));
    console.log(staticBezier.offsetPointRight(t, 10));

    for (let d = 0; d < points[0].length; d++) {
        console.log('tSearch ' + d + ':')

        console.log(inst.tSearch(d as any, point[d]));
        console.log(newStatBezier.tSearch(d as any, point[d]));
        console.log(staticBezier.tSearch(d, point[d]));
        console.log(improvedStatic.tSearch(d, point[d]));
    }

    console.groupEnd();
}

//
//

//
// const grade = points.length;
// const dimensions = points[0].length;
//
// const distance = constructNearestT(grade, dimensions);
//
// console.log(distance);

/*
const body = constructBezierBody(grade, dimensions);
const newAt = Function(ID_T, ID_POINTS, body);

console.log('\n[> at body:\n\n' + body);

const derivativeBody = constructBezierDerivedBody(grade, dimensions);
const newDirection = Function(ID_T, ID_POINTS, derivativeBody);

console.log('\n[> derivative body:\n\n' + derivativeBody);

const offsetBody = constructOffsetBezierBody(grade, dimensions, "right");
const newOffset = Function(ID_T, ID_POINTS, ID_DISTANCE, offsetBody);

console.log('\n[> offset body:\n\n' + offsetBody);

const staticBezier = new StaticBezier(points);

const steps = 4;
for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    console.group(ID_T + ' = ' + t);

    console.log('at:');

    console.log(newAt(t, points));
    console.log(staticBezier.at(t));

    console.log('derivative:');

    console.log(newDirection(t, points));
    console.log(staticBezier.direction(t));

    console.log('offset right:');
    debugger;
    console.log(newOffset(t, points, 10));
    console.log(staticBezier.offsetPointRight(t, 10));
    console.groupEnd();
}*/