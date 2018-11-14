import {
    bc,
    pow
} from './math-functions';

import { Bezier } from './bezier';

export interface BezierProperties {
    points: number[][];
    dimension: number;
    grade: number;
}

export interface UsableFunction<T> {
    /**
     * The generic name of the function provided by the generate().
     */
    name: string,

    /**
     * Generates an function suitable for the given bezier, returns null if no function can be created to fit this bezier.
     * 
     * @param bezier The bezier for which this function should generate an function T
     */
    generate(bezier: Bezier): T | null;

    /**
     * Is called when there is a change in the attributes of the bezier to see if it sould be reseted
     * 
     * @param grade was grade changed
     * @param dimension was dimension changed
     * @param points was points changed
     */
    shouldReset(grade: boolean, dimension: boolean, points: boolean): boolean;
}

export type AtFunction = (bezierProperties: BezierProperties, t: number) => number[]
export type TSearchFunction = (bezierProperties: BezierProperties, value: number, dimension: number) => number

/*

    AT_FUNCTIONS

*/

const AT_FUNCTIONS: { [key: string]: UsableFunction<AtFunction> } = {}

/**
 * caching the created generic functions and its body and its pointsPositions
 */
const fCache: ({
    body: string,
    func: AtFunction,
    /** an array of the textual point positions and the surrounding string, used for replacement in produceSpecificAtFunction*/
    pointsPositions?: ({
        point: number,
        /** the number d of point[p][d] */
        dimension: number
    } | string)[],
})[][] = [];

/**
 * This function generates an general at function which is useable for this specific cimbination of grade and dimension.
 * 
 * @param param0 
 */
function produceGenericAtFunction({ grade, dimension }: BezierProperties): AtFunction {
    grade--;

    if (fCache[grade] != undefined) {
        if (fCache[grade][dimension] != undefined)
            return fCache[grade][dimension].func;
    } else
        fCache[grade] = [];

    /**
     * collects all multiplier
     */
    let multiplier = "";

    /**
     * point sum is an array of strings which collect the sum of the point dimension
     * 
     * pointSum[0]: "rePoint[0] = m0 * 1 + m1 * 2 + ..." etc.
     */
    let pointSum = new Array(dimension);
    for (let i = 0; i < dimension; i++)
        pointSum[i] = "rePoint[" + i + "] = ";

    /**
     * for each grade one multiplier is created
     * 
     * const m0 = 1 * t * t * t * oneMinusT; etc.
     * 
     * and each buffer will be extended for the current mutlipleier
     */
    for (let i = 0; i <= grade; i++) {
        const multiplierName = "m" + i;
        multiplier += "const " + multiplierName + " = " + bc(grade, i) + (" * t".repeat(i)) + (" * oneMinusT".repeat(grade - i)) + ";\n";

        for (let d = 0; d < dimension; d++) {
            // pointSum[d] += multiplierName + " * " + point[d]; // this would make it a specific function
            pointSum[d] += multiplierName + " * points[" + i + "][" + d + "]";


            if (i < grade)
                pointSum[d] += " + ";
        }
    }

    /**
     * each buffer will be terminated by the ;
     */
    for (let i = 0; i < dimension; i++)
        pointSum[i] += ";\n";

    /**
     * concatinating the pointSum to one string and building an initilizing array literal:
     * 
     * so in the end const
     * rePoint = [NaN, NaN, ...]
     */
    let pointSumConcat = "";
    let arrLiteral = "";
    for (let i = 0; i < dimension; i++) {
        pointSumConcat += pointSum[i];
        arrLiteral += i < dimension - 1 ? "NaN, " : "NaN";
    }
    arrLiteral = "[" + arrLiteral + "]";

    const body = "\"use strict\";const points = bezierProperties.points;\nconst oneMinusT = 1 - t;\nconst rePoint = " + arrLiteral + ";\n" + multiplier + pointSumConcat + "return rePoint;";
    const func = <AtFunction>new Function('bezierProperties', 't', body);

    fCache[grade][dimension] = {
        body, func
    }

    return func;
}

AT_FUNCTIONS['produce-generic'] = {
    name: 'produce-generic',
    generate(b) {
        const bezierProperties = b.getBezierProperties();
        if (bezierProperties == null)
            throw new Error('produce-generic need to be called with an bezier which has valid points');

        return produceGenericAtFunction(bezierProperties);
    },
    shouldReset(g, d, p) {
        return g || d;
    }
}

/*
from: 

"use strict";
const oneMinusT = 1 - t;
const rePoint = [NaN, NaN];
const m0 = 1 * oneMinusT * oneMinusT * oneMinusT;
const m1 = 3 * t * oneMinusT * oneMinusT;
const m2 = 3 * t * t * oneMinusT;
const m3 = 1 * t * t * t;
rePoint[0] = m0 * points[0][0] + m1 * points[1][0] + m2 * points[2][0] + m3 * points[3][0];
rePoint[1] = m0 * points[0][1] + m1 * points[1][1] + m2 * points[2][1] + m3 * points[3][1];
return rePoint;

to:

"use strict";
const oneMinusT = 1 - t;
const rePoint = [NaN, NaN];
const m0 = 1 * oneMinusT * oneMinusT * oneMinusT;
const m1 = 3 * t * oneMinusT * oneMinusT;
const m2 = 3 * t * t * oneMinusT;
const m3 = 1 * t * t * t;
rePoint[0] = m0 * 0 + m1 * 1 + m2 * 0 + m3 * 1;
rePoint[1] = m0 * 0 + m1 * 0 + m2 * 1 + m3 * 1;
return rePoint;
*/

const pointsRegEx = /points\[(\d+)\]\[(\d+)\]/g;


/**
 * transforms the given string into an array of strings and objects
 * 
 * the string will be concatenated with the objects string representation
 */
function getPlaces(str: string) {
    const searchResults = [];

    let f;
    while ((f = pointsRegEx.exec(str)) != null)
        searchResults[searchResults.length] = {
            length: f[0].length,
            point: parseInt(f[1]),
            dimension: parseInt(f[2]),
            start: f['index']
        };

    const result = [];
    let prevStop = 0;
    for (let f of searchResults) {
        if (f.start != 0) {
            result[result.length] = str.slice(prevStop, f.start);
        }
        prevStop = f.start + f.length;

        result[result.length] = {
            point: f.point,
            dimension: f.dimension
        }
    }

    const strLength = str.length;
    if (prevStop != strLength)
        result[result.length] = str.slice(prevStop, strLength);

    return result;
}

/**
 * This functions produces an specific at function which is created for an individual identity of points.
 * 
 * Speed differences:
 * - Building the whole body for each function: 140k ops/sec
 * - Using RegEx: 130k ops/sec
 * - Caching the positions of points[p][d] (this func): 230k ops/sec
 * 
 */
function produceSpecificAtFunction({ points, dimension, grade }: BezierProperties): AtFunction {
    grade--;

    // should the generic function for this combination of grade and dimensions not be generated do it now
    if (fCache[grade] == undefined || fCache[grade][dimension] == undefined)
        produceGenericAtFunction({ points, dimension, grade });

    const generic = fCache[grade][dimension];
    let orig = generic.body;

    // if this generic function was never used for a specific one it
    // is missing the pointsPositions which will now be created and cached
    if (generic.pointsPositions == undefined)
        generic.pointsPositions = getPlaces(orig);

    // places now contains the array described in fCache.pointsPositions
    const places = generic.pointsPositions;


    let newFuncBody = "";
    for (let i = 0; i < places.length; i++) {
        // every even elemnt is a string which seperates two occurences of point[p][d]
        if (i % 2 == 0) {
            newFuncBody += <string>places[i];
        } else { // every odd one is an object which has to be replaced by the numeric value in points[p][d] (the function argument)
            const para = <{ point: number, dimension: number }>places[i];
            newFuncBody += '' + points[para.point][para.dimension];
        }
    }

    return <AtFunction>new Function('bezierProperties', 't', newFuncBody);
}

AT_FUNCTIONS['produce-specific'] = {
    name: 'produce-specific',
    generate(b) {
        const bezierProperties = b.getBezierProperties();
        if (bezierProperties == null)
            throw new Error('produce-specific need to be called with an bezier which has valid points');

        return produceSpecificAtFunction(bezierProperties);
    },
    shouldReset(g, d, p) {
        return p;
    }
}

/*

    nd-iterativ

*/

const nDIterativ = ({ points, grade, dimension }: BezierProperties, t: number) => {
    const oneMinusT = 1 - t;

    grade--;

    const retValue = new Array(dimension);

    for (let i = 0; i <= grade; i++) {
        const currentMultiplier = bc(grade, i) * pow(t, i) * pow(oneMinusT, grade - i)
        const point = points[i];

        for (let d = 0; d < dimension; d++)
            retValue[d] = (retValue[d] || 0) + point[d] * currentMultiplier;
    }

    return retValue;
}

AT_FUNCTIONS['nd-iterativ'] = {
    name: 'nd-iterativ',
    generate(b) {
        return nDIterativ;
    },
    shouldReset(g, d, p) {
        return false;
    }
}

/*

    nd-cubic

*/

const nDCubic = ({ points, dimension }: BezierProperties, t: number) => {
    const oneMinusT = 1 - t;
    const retVal = new Array(dimension);

    for (let i = 0; i < dimension; i++)
        retVal[i] = oneMinusT * oneMinusT * oneMinusT * points[0][i] +
            3 * t * oneMinusT * oneMinusT * points[1][i] +
            3 * t * t * oneMinusT * points[2][i] +
            t * t * t * points[3][i];

    return retVal;
}

AT_FUNCTIONS['nd-cubic'] = {
    name: 'nd-cubic',
    generate(b) {
        return b.getGrade() == 4 ? nDCubic : null;
    },
    shouldReset(g, d, p) {
        return g;
    }
}

/*

    2d-iterativ

*/

const twoDIterativ = ({ points, grade }: BezierProperties, t: number) => {
    const oneMinusT = 1 - t;

    const retValue = [0, 0];

    grade--;
    for (let i = 0; i <= grade; i++) {
        const currentMultiplier = bc(grade, i) * pow(t, i) * pow(oneMinusT, grade - i)
        const point = points[i];

        retValue[0] += point[0] * currentMultiplier;
        retValue[1] += point[1] * currentMultiplier;
    }

    return retValue;
};

AT_FUNCTIONS['2d-iterativ'] = {
    name: '2d-iterativ',
    generate(b) {
        return b.getDimension() == 2 ? twoDIterativ : null;
    },
    shouldReset(g, d, p) {
        return d;
    }
}

/*

    TSEARCH_FUNCTIONS

*/

const TSEARCH_FUNCTIONS: { [key: string]: UsableFunction<TSearchFunction> } = {}

TSEARCH_FUNCTIONS['ex'] = {
    name: 'ex',
    generate(b) {
        return (v, d) => { return 0; }
    },
    shouldReset(a, b, c) {
        return false;
    }
}

for (let key in AT_FUNCTIONS)
    AT_FUNCTIONS[key].name = key;

for (let key in TSEARCH_FUNCTIONS)
    TSEARCH_FUNCTIONS[key].name = key;


const AT_FUNCTIONS_NAMES = Object.freeze(Object.keys(AT_FUNCTIONS));

export { AT_FUNCTIONS, TSEARCH_FUNCTIONS, AT_FUNCTIONS_NAMES }