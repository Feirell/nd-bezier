import {
    bc
} from './math-functions';

const fCache = [];

function produceGeneralAtFunction(grade) {
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

    return fCache[grade] = new Function('t', 'points', prog);
}

function ProducedGeneralBezier(points) {
    this.points = points;
    this.grade = points.length - 1;

    produceGeneralAtFunction(this.grade);
}

ProducedGeneralBezier.prototype.at = function at(t) {
    return fCache[this.grade](t, this.points);
}

export {
    ProducedGeneralBezier
};