import {
    deriveCoefficientsUsage,
    getUsedCoefficients,
    normalQuadraticCoefficientsUsage
} from "../polynomial-coefficient-usage";
import {constructBezierCoefficient} from "../section-constructor/bezier-coefficients";
import {ID_DISTANCE_POINT, ID_POINTS} from "../ids";
import {FunctionBodyHandler} from "./function-body-handler";
import {getPolynomialSolver} from "./polynomial-solver";

export function constructNearestTBody(grade: number, dimension: number) {
    let retStr = '';

    const coeffDef = deriveCoefficientsUsage(normalQuadraticCoefficientsUsage(grade));

    const usedCoefficients = getUsedCoefficients(grade, coeffDef);

    retStr += constructBezierCoefficient(grade, dimension, usedCoefficients);
    retStr += '\n';

    for (let d = 0; d < dimension; d++) {
        retStr += 'const adjustedLastCoeff' + d + ' = ' + ID_DISTANCE_POINT + '[' + d + '] - coeff' + d + '_' + (grade - 1) + ';\n';
    }

    retStr += '\n';

    const resultingGrade = coeffDef.length;
    for (let g = 0; g < resultingGrade; g++) {
        const coeffsToUse = coeffDef[g];

        const definition = 'const mergedCoeff' + g + ' = ';
        const definitionSpacer = ' '.repeat(definition.length - 3);

        retStr += definition;

        for (let d = 0; d < dimension; d++) {
            if (d > 0)
                retStr += definitionSpacer + ' + ';

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

                    const coeffGrade = vars[v];

                    if (coeffGrade == grade - 1)
                        combined += 'adjustedLastCoeff' + d;
                    else
                        combined += 'coeff' + d + '_' + coeffGrade;
                }
            }

            if (d == dimension - 1)
                retStr += combined + ';\n\n';
            else
                retStr += combined + '\n';
        }
    }

    retStr += '\n';

    retStr += 'let solutions = solvePolynomial(\n';

    for (let g = 0; g < resultingGrade; g++) {
        retStr += '  mergedCoeff' + g;

        if (g < resultingGrade - 1) {
            retStr += ',\n';
        } else {
            retStr += '\n';
        }
    }

    retStr += ');\n\n';

    retStr += 'solutions = cleanSolutions(solutions);\n\n';

    retStr += 'return solutions;';

    return retStr;
}

// const nearestTSearch = new Cache<[number, number], string>(([grade, dimension]) => grade + ' ' + dimension);
//
// export function constructNearestTBodyCached(grade: number, dimension: number) {
//     let res = nearestTSearch.get([grade, dimension]);
//
//     if (res == undefined) {
//         res = constructNearestTBody(grade, dimension)
//         nearestTSearch.set([grade, dimension], res);
//     }
//
//     return res;
// }
//
// const constructNearestTBodyParameters = [ID_POINTS, ID_DISTANCE_POINT];

export const nearestTFunction = new FunctionBodyHandler(
    "nearestT",
    (grade: number, dimension: number) => grade + ' ' + dimension,
    [ID_POINTS, ID_DISTANCE_POINT],
    (grade, dimension) => constructNearestTBody(grade, dimension),
    getPolynomialSolver
)