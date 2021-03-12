import {bc} from "./math-functions";
import {Cache} from "./cache";

export const ID_T = 't';
export const ID_ONE_MINUS_T = 'oneMinusT';
export const ID_DISTANCE = 'distance';
export const ID_POINTS = 'points';

function exp(identifier: string, exp: number) {
    if (exp == 0)
        return '1';

    let res = "";
    const expAbs = exp < 0 ? -exp : exp;
    for (let e = 0; e < expAbs; e++) {
        res += identifier;
        if (e < exp - 1)
            res += ' * '
    }

    if (exp < 0)
        res = "1 / (" + identifier + ")";

    return res;
}

/**
 * creates a * t ^ b * (1 - t) ^ c string
 *
 * @param a
 * @param b
 * @param c
 * @constructor
 */
function bezierMultiplier(a: number, b: number, c: number) {
    let ret = '';

    if (a != 0) {
        ret += a;

        if (b != 0)
            ret += ' * ' + exp(ID_T, b);

        if (c != 0)
            ret += ' * ' + exp(ID_ONE_MINUS_T, c);
    }

    return ret.length == 0 ? '0' : ret;
}

/**
 * K derived:   a * b * t ^ (b - 1) * (1 - t) ^ c
 *            - a * c * t ^ b * (1 - t) ^ (c - 1)
 *
 * @param a
 * @param b
 * @param c
 * @constructor
 */
function bezierMultiplierDerived(a: number, b: number, c: number) {
    let ret = '';
    if (a * b != 0) {
        ret += (a * b);

        if (b - 1 != 0)
            ret += ' * ' + exp(ID_T, b - 1);

        if (c != 0)
            ret += ' * ' + exp(ID_ONE_MINUS_T, c);
    }

    if (a * c != 0) {
        ret += (ret.length == 0 ? '' : ' ');
        ret += '- ' + (a * c);

        if (b != 0)
            ret += ' * ' + exp(ID_T, b);

        if (c - 1 != 0)
            ret += ' * ' + exp(ID_ONE_MINUS_T, c - 1);
    }

    return ret.length == 0 ? '0' : ret;
}

interface MultiplierProvider {
    (a: number, b: number, c: number): string;
}

function produceMultiplierAndComponents(grade: number, dimension: number, name: string, multiplierFunction: MultiplierProvider) {
    let res = '';

    for (let g = 0; g <= grade; g++) {
        res += "const " + "m" + name + g + " = " + multiplierFunction(bc(grade, g), g, grade - g) + ";\n";
    }

    res += '\n';

    for (let d = 0; d < dimension; d++) {
        res += "const " + "c" + name + d + " = ";

        for (let g = 0; g <= grade; g++) {
            res += "m" + name + g + " * " + ID_POINTS + "[" + g + "][" + d + "]";

            if (g < grade) {
                res += " + ";
            } else {
                res += ";\n";
            }
        }
    }

    return res;
}


export interface AtFunction {
    (points: number[][], t: number): number[];
}

export interface BezierResult {
    body: string,
    func: AtFunction
}

const cache = new Cache<[MultiplierProvider, number, number], BezierResult>();

/**
 * This function generates an general at function which is usable for this specific combination of grade and dimension.
 */
export function assembleBezierFunction(kFunction: MultiplierProvider, grade: number, dimension: number): BezierResult {
    grade = grade - 1;

    const cacheItem = cache.get([kFunction, grade, dimension]);
    if (cacheItem)
        return {...cacheItem};

    const base = produceMultiplierAndComponents(grade, dimension, 'b' /* for base */, bezierMultiplier)

    let pointSumConcat = "";

    for (let i = 0; i < dimension; i++) {
        pointSumConcat += "    cb" + i;

        if (i < dimension - 1)
            pointSumConcat += ",\n";
        else
            pointSumConcat += "\n";
    }

    const body = "\"use strict\";\n" +
        "\n" +
        "const " + ID_ONE_MINUS_T + " = 1 - " + ID_T + ";\n" +
        base + "\n" +
        "return [\n" +
        pointSumConcat + "];";

    const func = new Function(ID_POINTS, ID_T, body) as AtFunction;

    cache.set([kFunction, grade, dimension], {body, func});
    return {body, func};
}


export interface AtDistanceFunction {
    (points: number[][], t: number, distance: number): number[];
}

export interface DistantBezierResult {
    body: string;
    func: AtDistanceFunction;
}

const distantCache = new Cache<[number, number, number[][]], DistantBezierResult>();

/**
 * Matrix defines how the directional vector (from the first derivative) is applies to the point vector from the bezier
 * curve.
 *
 * For example :
 * ```
 * [
 *   [0, -1],
 *   [1, 0]
 * ]
 * ```
 *
 * Would result in the normal vector be applied in a 90° to the curve on the left side.
 *
 * @param grade
 * @param dimension
 * @param matrix
 */
function assembleOffsetAtFunction(grade: number, dimension: number, matrix: number[][]): DistantBezierResult {
    grade = grade - 1;

    const cacheItem = distantCache.get([grade, dimension, matrix]);
    if (cacheItem)
        return {...cacheItem};

    const base = produceMultiplierAndComponents(grade, dimension, 'b' /* for base */, bezierMultiplier);
    const derived = produceMultiplierAndComponents(grade, dimension, 'd' /* for base */, bezierMultiplierDerived);

    let derivedLength = ""

    for (let d = 0; d < dimension; d++) {
        derivedLength += "cd" + d + " * " + "cd" + d

        if (d < dimension - 1)
            derivedLength += " + ";
    }

    derivedLength = "const scale = " + ID_DISTANCE + " / Math.sqrt(" + derivedLength + ");\n";

    let normalizedDelta = "";

    for (let d = 0; d < dimension; d++)
        normalizedDelta += 'const cdn' + d + ' = cd' + d + ' * scale;\n';

    let pointSumConcat = "";

    for (let d = 0; d < dimension; d++) {
        pointSumConcat += "    cb" + d;

        const row = matrix[d];
        for (let dt = 0; dt < dimension; dt++) {
            const effectiveMultiplier = row[dt];
            if (effectiveMultiplier == 0)
                continue;

            pointSumConcat += ' + ' + effectiveMultiplier + ' * cdn' + dt;
        }

        if (d < dimension - 1)
            pointSumConcat += ",\n";
        else
            pointSumConcat += "\n";
    }


    const body = "\"use strict\";\n" +
        "\n" +
        "const " + ID_ONE_MINUS_T + " = 1 - " + ID_T + ";\n" +
        "\n" +
        base +
        "\n" +
        derived +
        "\n" +
        derivedLength +
        "\n" +
        normalizedDelta +
        "\n" +
        "return [\n" +
        pointSumConcat + "];";

    const func = new Function(ID_POINTS, ID_T, ID_DISTANCE, body) as AtDistanceFunction;

    distantCache.set([grade, dimension, matrix], {body, func});
    return {body, func};
}

export function produceGenericAt(grade: number, dimension: number): BezierResult {
    return assembleBezierFunction(bezierMultiplier, grade, dimension);
}

export function produceGenericDerived(grade: number, dimension: number): BezierResult {
    return assembleBezierFunction(bezierMultiplierDerived, grade, dimension);
}

export function produceGenericOffsetAt(grade: number, dimension: number, matrix: number[][]): DistantBezierResult {
    return assembleOffsetAtFunction(grade, dimension, matrix);
}