import {bc} from "./src/math-functions";
import {Cache} from "./src/cache";
import {StaticBezier} from "./src/static-bezier";

class Polynomial {
    constructor(private readonly coefficients: ReadonlyArray<number> = []) {
    }

    getCoefficients() {
        return this.coefficients.slice();
    }

    // add(other: Polynomial) {
    //     if (other.coefficients.length > this.coefficients.length)
    //         this.coefficients.length = other.coefficients.length;
    //
    //
    // }

    multiply(other: Polynomial) {
        const thisCoeff = this.coefficients;
        const otherCoeff = other.coefficients;

        let coeff: number[] = new Array(1 + thisCoeff.length - 1 + otherCoeff.length - 1).fill(0);

        for (let other = 0; other < otherCoeff.length; other++) {
            const a = otherCoeff[other];
            if (a == 0)
                continue;

            for (let our = 0; our < thisCoeff.length; our++) {
                const b = thisCoeff[our];
                if (b == 0)
                    continue;

                coeff[other + our] += a * b;
            }
        }

        return new Polynomial(coeff);
    }

    toString(exp: string) {
        const co = this.coefficients;

        let ret = '';
        for (let i = co.length - 1; i >= 0; i--) {
            const c = co[i];

            if (c == 0)
                continue;

            if (ret.length != 0 || c < 0)
                ret += c < 0 ? ' - ' : ' + ';

            if (i > 1)
                ret += exp + ' ^ ' + i;
            else if (i > 0)
                ret += exp;

            const abs = c < 0 ? -c : c;

            if (abs != 1 || i == 0)
                ret += (i != 0 ? ' * ' : '') + abs;
        }

        return ret.length == 0 ? '0' : ret;
    }
}

declare var console: { [key: string]: (...args: any[]) => void };

/**
 * This functions returns an two dimensional array with the coefficients for the control points of the bezier curve
 * grouped by t exponents.
 *
 * For example grade 3 would result in an array like:
 * ```
 * [
 *   // v_0 v_1 v_2
 *     [ 1,  0,  0] // <= t^0
 *     [-2,  2,  0] // <= t^1 (for example this row is meant to represent: t^1 * (v_0 * -2 + v_1 * 2 + v_2 * 0))
 *     [ 1, -2,  1] // <= t^2
 * ]
 * ```
 *
 * @param grade
 */
function coefficients(grade: number) {
    // Bezier is defined by sum from i to n of bc(n,i) * t ^ i * (1-t)^(n-1) * P_i
    // the coefficients are the static parts, so the resulting polynomial grouped by the t by their exponent

    grade = grade - 1;

    const oneMinusT = new Polynomial([1, -1]);
    const t = new Polynomial([0, 1]);

    /*
    results saves the coefficients for the v_i (the control points) grouped by the t by their exponent



     */
    let result: number[][] = [];

    for (let g = 0; g <= grade; g++) {
        let partial = new Polynomial([bc(grade, g)]);

        for (let oneMinusTExp = 0; oneMinusTExp < (grade - g); oneMinusTExp++) {
            partial = partial.multiply(oneMinusT);
        }

        for (let tExp = 0; tExp < g; tExp++) {
            partial = partial.multiply(t);
        }

        const coeff = partial.getCoefficients();
        for (let i = 0; i < coeff.length; i++) {
            if (result.length <= i)
                result.push(new Array(grade + 1).fill(0))

            const grouped = result[i];
            grouped[g] += coeff[i];
        }
    }

    return result;
}

const indexToLetter = (nr: number, start = 'a') => String.fromCharCode(start.charCodeAt(0) + nr);

type CoefficientUsageEntry = { multiplier: number, variables: number[] }[];
type CoefficientUsageDefinition = CoefficientUsageEntry[];

// const result = coefficients(10);
//
// console.log(result.map(v => v.join(', ')).join('\n'));

function normalPolynomialCoefficients(grade: number) {
    const ret: CoefficientUsageDefinition = [];

    for (let i = 0; i < grade; i++)
        // since 0 == a, 1 == b, etc. and we fill the array from index 0 to grade-1 we need to
        // enumerate the other way around
        ret.push([{multiplier: 1, variables: [grade - i - 1]}]);

    return ret;
}

/**
 * This quadratures a polynomial with the defined grade g
 * quad(g) = (a*t^g + b*t^(g-1) + c*t^(g-2) + ... + x*t^0)^2
 *
 * The result has the following structure:
 *
 * First array grouped by t exponents, second array are the summands within the multiplier grouped by brackets.
 *
 * So for example when the data structure contains the following:
 * [ [ { multiplier: 1, variables: [0, 0, 1, 4] }, { multiplier: 7, variables: [4] } ] ]
 *
 * The result would be:
 *
 *   t ^ 0 * (
 *     1 * a * a * b * d +
 *     7 * d
 *   )
 *
 * 0 because the index of this first entry is 0 and the letters
 * are the translation of the index to letters (variables)
 */
function quad(grade: number): CoefficientUsageDefinition {
    // Have a look at the documentation for the function as to how this data structure is to be interpreted.
    const res: CoefficientUsageDefinition = [];

    // drawing the (a*t^g + b*t^(g-1) + c*t^(g-2) + ... + x*t^0) * (a*t^g + b*t^(g-1) + c*t^(g-2) + ... + x*t^0)
    // as an matrix you could attach coordinates to those cells of the matrix. [0, 0] would be the multiplication of
    // a*t^g * a*t^g, [1, 3] would be b*t^(g-1) * d*t^(g-3)
    // If you start with 0,0 in the top left corner each diagonal row would contain the same exponent of t so all sums of
    // this diagonal would result in the result of the quadratur.
    // Starting in the right bottom corner since this is t^0
    let startX = grade - 1;
    let startY = grade - 1;

    while (true) {
        const partial: CoefficientUsageEntry = [];

        let curX = startX;
        let curY = startY;

        while (true) {
            if (curX == curY)
                // this is a mirror point, this is just a*a or b*b and only occurs once, hence the multiplier
                partial.push({multiplier: 1, variables: [curX, curY]})
            else
                // this is a point before the mirror, it happens twice and is the multiplication of the column variable
                // times the row variable
                partial.push({multiplier: 2, variables: [curX, curY]})

            // we a diagonal center point, all additions after this one are duplications of the ones we already recorded
            if (curX == curY)
                break;

            // only every second diagonal goes through a n, n point (with x and y identical) which marks the point after
            // which only duplicates are recorded. If this is such a diagonal we need to check otherwise. The point after
            // which only duplicates comes is the point were the coords of the next are the switches of the current
            // (e.g.: 1, 2 and 2, 1) The next points for 1, 2 would be 2, 1 (increase x, decrease y) but this is the mirrored
            // point
            if (curY - 1 == curX && curX + 1 == curY)
                break;


            // walking diagonally
            curX++;
            curY--;
        }

        res.push(partial);

        // finished since we reached the top left corner
        if (startX == 0 && startY == 0)
            break;

        // moving the start coordinate, first back on the x axis and then up the y axis
        if (startX != 0)
            startX--;
        else
            startY--;
    }

    return res;
}

/**
 * This function creates the derivative for a polynomial.
 */
function derive(definition: CoefficientUsageDefinition) {
    const copy: CoefficientUsageDefinition = JSON.parse(JSON.stringify(definition));

    // dropping the first element since the derivative of a static summand is zero (since it does not add to the slope)
    copy.shift();

    // adding the multiplier on each group
    for (let i = 0; i < copy.length; i++)
        for (const group of copy[i])
            group.multiplier *= (i + 1);

    return copy;
}

// quad(3).map((v, i) => 't ^ ' + i + ' ( ' + v.map(k => k.multiplier + ' * ' + k.variables.map(indexToLetter).join(' * ')).join(' + ') + ')').join('\n')

const ID_POINTS = 'points';
const ID_T = 't';

const ID_DISTANCE = 'distance';


function constructBezierCoefficient(grade: number, dimension: number, usedCoefficients: boolean[]) {
    const coeffs = coefficients(grade);

    let retStr = '';

    for (let d = 0; d < dimension; d++) {
        // iterating over the coefficients for the full bezier expression
        // c represents the t exponent currently handled
        for (let c = 0; c < grade; c++) {
            if (!usedCoefficients[c])
                continue;

            let combinedMultiplier = '';
            const coeffsForTExpC = coeffs[grade - c - 1];
            // iterating over the multiplier for the control points
            for (let m = 0; m < grade; m++) {
                const multiplier = coeffsForTExpC[m];
                if (multiplier == 0)
                    continue;

                if (combinedMultiplier.length != 0 || multiplier < 0)
                    combinedMultiplier += multiplier < 0 ? ' - ' : ' + ';

                const exp = ID_POINTS + '[' + m + '][' + d + ']';

                combinedMultiplier += exp;

                const abs = multiplier < 0 ? -multiplier : multiplier;

                if (abs != 1)
                    combinedMultiplier += ' * ' + abs;
            }

            retStr += 'const coeff' + d + '_' + c + ' = ' + combinedMultiplier + ';\n';
        }

        if (d < dimension - 1)
            retStr += '\n';
    }

    return retStr;
}

function constructBezierComponents(grade: number, dimension: number, coeffDef: CoefficientUsageDefinition, prefix = '') {
    const T_EXP_ID = prefix ? prefix + 'TExp' : 'tExp';
    const COMP_ID = prefix ? prefix + 'Comp' : 'comp';

    let retStr = '';

    for (let c = 0; c < coeffDef.length; c++) {
        const coeffsToUse = coeffDef[c];

        if (c == 1)
            retStr += 'let ' + T_EXP_ID + ' = ' + ID_T + ';\n';
        else if (c > 1)
            retStr += T_EXP_ID + ' *= ' + ID_T + ';\n';

        for (let d = 0; d < dimension; d++) {
            if (c == 0)
                retStr += 'let ' + COMP_ID + d + ' = ';
            else
                retStr += COMP_ID + d + ' += ' + T_EXP_ID;

            let combined = '';
            for (let i = 0; i < coeffsToUse.length; i++) {
                if (combined.length > 0)
                    combined += ' + ';

                if (coeffsToUse[i].multiplier != 1)
                    combined += coeffsToUse[i].multiplier;

                const vars = coeffsToUse[i].variables;

                for (let v = 0; v < vars.length; v++) {
                    if (coeffsToUse[i].multiplier != 1 || v > 0)
                        combined += ' * ';

                    combined += 'coeff' + d + '_' + vars[v];
                }
            }

            if (combined.length != 0 && c > 0) {
                if (coeffsToUse.length > 1)
                    combined += '( ' + combined + ' )';

                combined = ' * ' + combined;
            }

            retStr += combined + ';\n';
        }

        if (c < coeffDef.length - 1)
            retStr += '\n';
    }

    return retStr;
}

function getUsedCoefficients(grade: number, ...coeffDefs: CoefficientUsageDefinition[]) {
    // remember all used coefficients to drop those which are not relevant
    const usedCoefficients = new Array(grade).fill(false) as boolean[];

    for (const coeffDef of coeffDefs)
        for (const coeffs of coeffDef)
            for (const additiveGroup of coeffs)
                for (const coeffIndex of additiveGroup.variables)
                    usedCoefficients[coeffIndex] = true;

    return usedCoefficients;
}

function constructComponentReturn(dimension: number, prefix = '') {
    const COMP_ID = prefix ? prefix + 'Comp' : 'comp';

    let retStr = '';

    retStr += 'return [\n';

    for (let d = 0; d < dimension; d++) {
        retStr += '  ' + COMP_ID + d;

        if (d < dimension - 1)
            retStr += ',\n';
        else
            retStr += '\n';
    }

    retStr += '];';

    return retStr;
}

function constructBezierFunction(grade: number, dimension: number, coeffDef: CoefficientUsageDefinition) {
    let retStr = '';

    const usedCoefficients = getUsedCoefficients(grade, coeffDef);

    retStr += constructBezierCoefficient(grade, dimension, usedCoefficients);
    retStr += '\n';

    retStr += constructBezierComponents(grade, dimension, coeffDef);
    retStr += '\n';

    retStr += constructComponentReturn(dimension);

    return retStr;
}

function constructOffsetBezier(grade: number, dimension: number, direction: 'left' | 'right') {
    if (dimension != 2)
        throw new Error('Can not construct offset bezier for a dimension other than 2.');

    let retStr = '';

    const coeffDef = normalPolynomialCoefficients(grade);
    const derivedDef = derive(coeffDef);

    const usedCoefficients = getUsedCoefficients(grade, coeffDef, derivedDef);

    retStr += constructBezierCoefficient(grade, dimension, usedCoefficients);
    retStr += '\n';

    // TODO merge them so t multiplication only needs to be done once

    retStr += constructBezierComponents(grade, dimension, coeffDef, 'base');
    retStr += '\n';

    retStr += constructBezierComponents(grade, dimension, derivedDef, 'derived');
    retStr += '\n';

    retStr += 'const scale = ' + ID_DISTANCE + ' / Math.sqrt(derivedComp0 * derivedComp0 + derivedComp1 * derivedComp1);\n';

    const [xSign, ySign] = direction == 'left' ? ['-', '+'] : ['+', '-'];

    retStr += 'const comp0 = baseComp0 ' + xSign + ' scale * derivedComp1;\n';
    retStr += 'const comp1 = baseComp1 ' + ySign + ' scale * derivedComp0;\n';

    retStr += constructComponentReturn(dimension);

    return retStr;
}

const bezierCache = new Cache<[number, number], string>(([grade, dimension]) => grade + ' ' + dimension);

function constructBezierBody(grade: number, dimension: number) {
    let res = bezierCache.get([grade, dimension]);

    if (res == undefined) {
        res = constructBezierFunction(grade, dimension, normalPolynomialCoefficients(grade))
        bezierCache.set([grade, dimension], res);
    }

    return res;
}

const bezierDerivedCache = new Cache<[number, number], string>(([grade, dimension]) => grade + ' ' + dimension);

function constructBezierDerivedBody(grade: number, dimension: number) {
    let res = bezierDerivedCache.get([grade, dimension]);

    if (res == undefined) {
        res = constructBezierFunction(grade, dimension, derive(normalPolynomialCoefficients(grade)));
        bezierCache.set([grade, dimension], res);
    }

    return res;
}

const bezierOffsetCache = new Cache<[number, number, number], string>(([grade, dimension, dir]) => grade + ' ' + dimension+' '+dir);

function constructOffsetBezierBody(grade: number, dimension: number, direction: "left" | "right") {
    const dir = direction == "left"? 0: 1;

    let res = bezierOffsetCache.get([grade, dimension, dir]);

    if (res == undefined) {
        res = constructOffsetBezier(grade, dimension, direction);
        bezierOffsetCache.set([grade, dimension, dir], res);
    }

    return res;
}

const points = [
    [1, 0],
    [0, 1],
    [1, 1]
];

const grade = points.length;
const dimensions = points[0].length;

const body = constructBezierBody(grade, dimensions);
const newAt = Function(ID_T, ID_POINTS, body);

console.log('\n[> at body:\n\n' + body);

const derivativeBody = constructBezierDerivedBody(grade, dimensions);
const newDirection = Function(ID_T, ID_POINTS, derivativeBody);

console.log('\n[> derivative body:\n\n' + derivativeBody);

const offsetBody = constructOffsetBezier(grade, dimensions, "right");
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
}