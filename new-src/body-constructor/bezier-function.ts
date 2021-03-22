import {
    CoefficientUsageDefinition,
    deriveCoefficientsUsage,
    getUsedCoefficients,
    normalPolynomialCoefficientsUsage
} from "../polynomial-coefficient-usage";
import {constructBezierCoefficient} from "../section-constructor/bezier-coefficients";
import {constructBezierComponents} from "../section-constructor/bezier-components";
import {constructComponentReturn} from "../section-constructor/component-return";
import {ID_POINTS, ID_T} from "../ids";
import {FunctionBodyHandler} from "./function-body-handler";

export function constructGeneralBezierBody(grade: number, dimension: number, coeffDef: CoefficientUsageDefinition) {
    let retStr = '';

    const usedCoefficients = getUsedCoefficients(grade, coeffDef);

    retStr += constructBezierCoefficient(grade, dimension, usedCoefficients);
    retStr += '\n';

    retStr += constructBezierComponents(grade, dimension, coeffDef);
    retStr += '\n';

    retStr += constructComponentReturn(dimension);

    return retStr;
}

export const atFunction = new FunctionBodyHandler(
    'at',
    (grade, dimension) => grade + ' ' + dimension,
    [ID_POINTS, ID_T],
    (grade: number, dimension: number) =>
        constructGeneralBezierBody(grade, dimension, normalPolynomialCoefficientsUsage(grade))
);

export const directionFunction = new FunctionBodyHandler(
    'direction',
    (grade, dimension) => grade + ' ' + dimension,
    [ID_POINTS, ID_T],
    (grade: number, dimension: number) =>
        constructGeneralBezierBody(grade, dimension, deriveCoefficientsUsage(normalPolynomialCoefficientsUsage(grade)))
);