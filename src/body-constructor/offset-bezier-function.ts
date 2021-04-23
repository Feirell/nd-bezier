import {constructComponentReturn} from "../section-constructor/component-return";
import {ID_DISTANCE, ID_POINTS, ID_T} from "../ids";
import {constructBezierComponents} from "../section-constructor/bezier-components";
import {constructBezierCoefficient} from "../section-constructor/bezier-coefficients";
import {
    deriveCoefficientsUsage,
    getUsedCoefficients,
    normalPolynomialCoefficientsUsage
} from "../polynomial-coefficient-usage";
import {FunctionBodyHandler} from "./function-body-handler";

export function constructOffsetBezier(grade: number, dimension: number, direction: 'left' | 'right') {
    if (dimension != 2)
        throw new Error('Can not construct offset bezier for a dimension other than 2.');

    let retStr = '';

    const coeffDef = normalPolynomialCoefficientsUsage(grade);
    const derivedDef = deriveCoefficientsUsage(coeffDef);

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

// const offsetBezier = new Cache<[number, number, number], string>(([grade, dimension, dir]) => grade + ' ' + dimension + ' ' + dir);
//
// export function constructOffsetBezierCached(grade: number, dimension: number, direction: 'left' | 'right') {
//     const dir = direction == 'left' ? 0 : 1;
//     let res = offsetBezier.get([grade, dimension, dir]);
//
//     if (res == undefined) {
//         res = constructOffsetBezier(grade, dimension, direction)
//         offsetBezier.set([grade, dimension, dir], res);
//     }
//
//     return res;
// }
//
// const constructOffsetBezierParameters = [ID_POINTS, ID_T, ID_DISTANCE];

export const offsetPointFunction = new FunctionBodyHandler(
    "offsetPoint",
    (grade, dimension) => grade + ' ' + dimension,
    [ID_POINTS, ID_T, ID_DISTANCE],
    (grade, dimension) => constructOffsetBezier(grade, dimension, 'left')
);
