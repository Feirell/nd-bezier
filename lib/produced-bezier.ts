import {
    bc
} from './math-functions';

type GenericAtFunction = (points: number[][], t: number) => number[]
type SpecificAtFunction = (t: number) => number[]

const fCache: ({
    body: string,
    func: GenericAtFunction,
    // an array of the textual point positions and the surrounding string, used for replacement in produceSpecificAtFunction
    pointsPositions?: ({
        point: number,
        // the number d of point[p][d]
        dimension: number
    } | string)[],
})[][] = [];

// function produceGeneralAtFunction(grade: number): (t: number, points: number[][]) => number[] {
//     if (fCache[grade] != undefined)
//         return fCache[grade];

//     let multiplier = "";

//     let partXConst = "const partX = ";
//     let partYConst = "const partY = ";

//     for (let i = 0; i <= grade; i++) {
//         const multiplierName = "m" + i;
//         multiplier += "const  " + multiplierName + " = " + bc(grade, i) + (" * t".repeat(i)) + "" + (" * oneMinusT".repeat(grade - i)) + ";";

//         partXConst += multiplierName + (i < grade ? " * points[" + i + "].x + " : "* points[" + i + "].x");
//         partYConst += multiplierName + (i < grade ? " * points[" + i + "].y + " : "* points[" + i + "].y");
//     }

//     partXConst += ";";
//     partYConst += ";";

//     let prog = "\"use strict\";const oneMinusT = 1 - t;" + multiplier + partXConst + partYConst + "return {x : partX ,y : partY};";

//     return fCache[grade] = <(t: number) => number[]>new Function('t', 'points', prog);
// }

function produceGenericAtFunction(grade: number, dimensions: number): GenericAtFunction {
    if (fCache[grade] != undefined) {
        if (fCache[grade][dimensions] != undefined)
            return fCache[grade][dimensions].func;
    } else
        fCache[grade] = [];

    // those value would be necessary if this would be a specific generator
    // const grade = points.length - 1;
    // const dimensions = points[0].length;

    /**
     * collects all multiplier
     */
    let multiplier = "";

    /**
     * point sum is an array of strings which collect the sum of the point dimension
     * 
     * pointSum[0]: "rePoint[0] = m0 * 1 + m1 * 2 + ..." etc.
     */
    let pointSum = new Array(dimensions);
    for (let i = 0; i < dimensions; i++)
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

        for (let d = 0; d < dimensions; d++) {
            // pointSum[d] += multiplierName + " * " + point[d]; // this would make it a specific function
            pointSum[d] += multiplierName + " * points[" + i + "][" + d + "]";


            if (i < grade)
                pointSum[d] += " + ";
        }
    }

    /**
     * each buffer will be terminated by the ;
     */
    for (let i = 0; i < dimensions; i++)
        pointSum[i] += ";\n";

    /**
     * concatinating the pointSum to one string and building an initilizing array literal:
     * 
     * so in the end const
     * rePoint = [NaN, NaN, ...]
     */
    let pointSumConcat = "";
    let arrLiteral = "";
    for (let i = 0; i < dimensions; i++) {
        pointSumConcat += pointSum[i];
        arrLiteral += i < dimensions - 1 ? "NaN, " : "NaN";
    }
    arrLiteral = "[" + arrLiteral + "]";

    const body = "\"use strict\";\nconst oneMinusT = 1 - t;\nconst rePoint = " + arrLiteral + ";\n" + multiplier + pointSumConcat + "return rePoint;";
    const func = <GenericAtFunction>new Function('points', 't', body);

    fCache[grade][dimensions] = {
        body, func
    }

    return func;
}


/**
 * This is the old produceSpecificAtFunction which is
 * not in use anymore and was replaced with the new
 * produceSpecificAtFunction which just replaced the
 * `points[p][d]` useaged with the actual numbers
 */
// function produceSpecificAtFunction(points: number[][]): (t: number) => number[] {
//     const grade = points.length - 1;

//     /**
//      * collects all multiplier
//      */
//     let multiplier = "";

//     const dimensions = points[0].length;

//     /**
//      * point sum is an array of strings which collect the sum of the point dimension
//      * 
//      * pointSum[0]: "rePoint[0] = m0 * 1 + m1 * 2 + ..." etc.
//      */
//     let pointSum = new Array(dimensions);
//     for (let i = 0; i < dimensions; i++)
//         pointSum[i] = "rePoint[" + i + "] = ";

//     /**
//      * for each grade one multiplier is created
//      * 
//      * const m0 = 1 * t * t * t * oneMinusT; etc.
//      * 
//      * and each buffer will be extended for the current mutlipleier
//      */
//     for (let i = 0; i <= grade; i++) {
//         const point = points[i];

//         const multiplierName = "m" + i;
//         multiplier += "const " + multiplierName + " = " + bc(grade, i) + (" * t".repeat(i)) + (" * oneMinusT".repeat(grade - i)) + ";\n";

//         for (let d = 0; d < dimensions; d++) {
//             pointSum[d] += multiplierName + " * " + point[d];

//             if (i < grade)
//                 pointSum[d] += " + ";
//         }
//     }

//     /**
//      * each buffer will be terminated by the ;
//      */
//     for (let i = 0; i < dimensions; i++)
//         pointSum[i] += ";\n";

//     /**
//      * concatinating the pointSum to one string and building an initilizing array literal:
//      * 
//      * so in the end const
//      * rePoint = [NaN, NaN, ...]
//      */
//     let pointSumConcat = "";
//     let arrLiteral = "";
//     for (let i = 0; i < dimensions; i++) {
//         pointSumConcat += pointSum[i];
//         arrLiteral += i < dimensions - 1 ? "NaN, " : "NaN";
//     }
//     arrLiteral = "[" + arrLiteral + "]";

//     const fBody = "\"use strict\";\nconst oneMinusT = 1 - t;\nconst rePoint = " + arrLiteral + ";\n" + multiplier + pointSumConcat + "return rePoint;";

//     return <(t: number) => number[]>new Function('t', fBody);
// }

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
 * old version with regex see the one at the bottom for speed comparisment
 */
// function produceSpecificAtFunction(points: number[][]): SpecificAtFunction {
//     const grade = points.length - 1;
//     const dimensions = points[0].length;

//     // should the generic function for this combination of grade and dimensions not be generated do it now
//     if (fCache[grade] == undefined || fCache[grade][dimensions] == undefined)
//         produceGenericAtFunction(grade, dimensions);

//     // replace all occurences of points[p][d] with the actual values
//     const newFuncBody = fCache[grade][dimensions].body.replace(pointsRegEx, (m, point, dimension) => {
//         return "" + points[point][dimension];
//     });

//     return <SpecificAtFunction>new Function('t', newFuncBody);
// }

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
 * Speed differences:
 * - Building the whole body for each function: 140k ops/sec
 * - Using RegEx: 130k ops/sec
 * - Caching the positions of points[p][d] (this func): 230k ops/sec
 * 
 */
function produceSpecificAtFunction(points: number[][]): SpecificAtFunction {
    const grade = points.length - 1;
    const dimensions = points[0].length;

    // should the generic function for this combination of grade and dimensions not be generated do it now
    if (fCache[grade] == undefined || fCache[grade][dimensions] == undefined)
        produceGenericAtFunction(grade, dimensions);

    const generic = fCache[grade][dimensions];
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

    return <SpecificAtFunction>new Function('t', newFuncBody);
}

const GENERIC = 'generic';
const SPECIFIC = 'specific';

class ProducedBezier {
    readonly points: number[][] = [];
    readonly functionType: string;

    constructor(points: number[][], type = SPECIFIC) {
        this.points = points;
        this.functionType = type != GENERIC ? SPECIFIC : GENERIC;
    }

    at(t: number): number[] {
        // replacing the at methode and returning its return value
        delete this.at;

        // the reason for the two types is their creation speed
        // for an already created generic one it is about 4'563k creations/sec
        // for an generic one it is around 230k creations/sec
        switch (this.functionType) {
            case SPECIFIC:
                this.at = produceSpecificAtFunction(this.points);
                break;
            case GENERIC:
                const points = this.points;
                const fnc = produceGenericAtFunction(this.points.length - 1, this.points[0].length);

                this.at = t => fnc(points, t);
                break;
            default:
                throw new Error('type needs to be either "specific" or "general" but was ' + this.functionType);
        }

        return this.at(t);
    };
}

export {
    ProducedBezier
};