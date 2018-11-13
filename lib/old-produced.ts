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
