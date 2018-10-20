import {
    bc
} from './math-functions';

function produceSpecificAtFunction(points) {
    const grade = points.length - 1;
    let multiplier = "";

    let partXConst = "const partX = ";
    let partYConst = "const partY = ";

    for (let i = 0; i <= grade; i++) {
        const point = points[i];

        const multiplierName = "m" + i;
        multiplier += "const  " + multiplierName + " = " + bc(grade, i) + (" * t".repeat(i)) + "" + (" * oneMinusT".repeat(grade - i)) + ";";

        partXConst += multiplierName + (i < grade ? " * " + point.x + " + " : "* " + point.x);
        partYConst += multiplierName + (i < grade ? " * " + point.y + " + " : "* " + point.y);
    }

    partXConst += ";";
    partYConst += ";";

    const prog = "\"use strict\";const oneMinusT = 1 - t;" + multiplier + partXConst + partYConst + "return {x : partX ,y : partY};";
    return new Function('t', prog);
}

function ProducedSpezificBezier(points) {
    this.at = produceSpecificAtFunction(points);
};

export {
    ProducedSpezificBezier
};