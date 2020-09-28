import {AtFunction} from "./types";
import {produceGenericAtFunction} from "./produce-generic-at";

interface SpecificAtFunction {
    (t: number): number[]
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
export function getPlaces(str: string) {
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
export function produceSpecificAtFunction(points: number[][]): SpecificAtFunction {
    const grade = points.length;
    const dimension = points[0].length;

    // the generic function is the base for the specific one
    const generic = produceGenericAtFunction(grade, dimension);

    // const generic = fCache[grade][dimension];
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

    return new Function('t', newFuncBody) as SpecificAtFunction;
}