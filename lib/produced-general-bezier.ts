import { Point } from './Point';

import {
    bc
} from './math-functions';

const fCache: ((t: number, points: Point[]) => Point)[] = [];

function produceGeneralAtFunction(grade: number): (t: number, points: Point[]) => Point {
    if (fCache[grade] != undefined)
        return fCache[grade];

    let multiplier = "";

    let partXConst = "const partX = ";
    let partYConst = "const partY = ";

    for (let i = 0; i <= grade; i++) {
        const multiplierName = "m" + i;
        multiplier += "const  " + multiplierName + " = " + bc(grade, i) + (" * t".repeat(i)) + "" + (" * oneMinusT".repeat(grade - i)) + ";";

        partXConst += multiplierName + (i < grade ? " * points[" + i + "].x + " : "* points[" + i + "].x");
        partYConst += multiplierName + (i < grade ? " * points[" + i + "].y + " : "* points[" + i + "].y");
    }

    partXConst += ";";
    partYConst += ";";

    let prog = "\"use strict\";const oneMinusT = 1 - t;" + multiplier + partXConst + partYConst + "return {x : partX ,y : partY};";

    return fCache[grade] = <(t: number) => Point>new Function('t', 'points', prog);
}

class ProducedGeneralBezier {
    grade: number;
    points: Point[];

    constructor(points: Point[]) {
        this.points = points;
        this.grade = points.length - 1;

        produceGeneralAtFunction(this.grade);
    }

    at(t: number): Point {
        return fCache[this.grade](t, this.points);
    }
}

export {
    ProducedGeneralBezier
};