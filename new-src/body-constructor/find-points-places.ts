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

import {ID_POINTS} from "../ids";

const cache = new Map<string, ReturnType<typeof getPlaces>>();

// const pointsRegEx = /points\[(\d+)\]\[(\d+)\]/g;
const pointsRegEx = new RegExp(ID_POINTS + "\\[(\\d+)\\]\\[(\\d+)\\]", 'g');

export type PointsPlaces = (string | { point: number, dimension: number })[];

/**
 * transforms the given string into an array of strings and objects
 *
 * the string will be concatenated with the objects string representation
 */
export function getPlaces(str: string): PointsPlaces {
    // looking up cache and returning that value if it was already produced
    const cacheEntry = cache.get(str);
    if (cacheEntry)
        return cacheEntry;


    // searching for all occurrences of the pattern
    const searchResults = [];

    let match;
    while ((match = pointsRegEx.exec(str)) != null)
        searchResults.push({
            length: match[0].length,
            point: parseInt(match[1]),
            dimension: parseInt(match[2]),
            start: match.index
        });

    // assembling those results into the actual return value
    const result = [];
    let prevStop = 0;
    for (const sr of searchResults) {
        if (sr.start != 0) {
            result[result.length] = str.slice(prevStop, sr.start);
        }
        prevStop = sr.start + sr.length;

        result[result.length] = {
            point: sr.point,
            dimension: sr.dimension
        }
    }

    // processing the last entry
    const strLength = str.length;
    if (prevStop != strLength)
        result[result.length] = str.slice(prevStop, strLength);

    // saving the result in the cache
    cache.set(str, result);

    return result;
}

export function makeSpecific(places: PointsPlaces, points: number[][]) {
    let newFuncBody = "";
    for (let i = 0; i < places.length; i++) {
        // every even element is a string which separates two occurrences of point[p][d]
        if (i % 2 == 0) {
            newFuncBody += places[i] as string;
        } else { // every odd one is an object which has to be replaced by the numeric value in points[p][d] (the function argument)
            const para = places[i] as { point: number, dimension: number };
            newFuncBody += '' + points[para.point][para.dimension];
        }
    }

    return newFuncBody;
}
