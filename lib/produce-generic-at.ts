import {bc} from "./math-functions";

export interface AtFunction {
    (points: number[][], t: number): number[];
}

interface FCacheEntry {
    body: string,
    func: AtFunction,
    /** an array of the textual point positions and the surrounding string, used for replacement in produceSpecificAtFunction*/
    pointsPositions?: ({
        point: number,
        /** the number d of point[p][d] */
        dimension: number
    } | string)[],
}

/**
 * caching the created generic functions and its body and its pointsPositions
 */
const fCache: FCacheEntry[][] = [];

/**
 * This function generates an general at function which is useable for this specific cimbination of grade and dimension.
 *
 */
export function produceGenericAtFunction(grade: number, dimension: number): FCacheEntry {
    grade = grade - 1;

    if (fCache[grade] != undefined) {
        if (fCache[grade][dimension] != undefined)
            return fCache[grade][dimension];
    } else
        fCache[grade] = [];

    /**
     * collects all multiplier
     */
    let multiplier = "";

    /**
     * point sum is an array of strings which collect the sum of the point dimension
     *
     * pointSum[0]: "m0 * 1 + m1 * 2 + ..." etc.
     */
    const pointSum = new Array(dimension).fill("");

    /**
     * for each grade one multiplier is created
     *
     * const m0 = 1 * t * t * t * oneMinusT; etc.
     *
     * and each buffer will be extended for the current multipleier
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


    let pointSumConcat = "";
    /**
     * each buffer will be terminated by a semicolon
     * concatinating the pointSum to one string
     */
    for (let i = 0; i < dimension; i++)
        pointSumConcat += "    " + pointSum[i] + (i == dimension - 1 ? "\n" : ",\n");

    const body = "\"use strict\";\n\nconst oneMinusT = 1 - t;\n" + multiplier + "return [\n" + pointSumConcat + "];";
    const func = new Function('points', 't', body) as AtFunction;

    return fCache[grade][dimension] = {
        body, func
    };
}