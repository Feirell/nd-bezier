import {
    deriveCoefficientsUsage,
    getUsedCoefficients,
    normalQuadraticCoefficientsUsage
} from "../polynomial-coefficient-usage";
import {constructBezierCoefficient} from "../section-constructor/bezier-coefficients";
import {ID_DISTANCE_POINT, ID_POINTS} from "../ids";
import {FunctionBodyHandler} from "./function-body-handler";
import {getPolynomialSolver} from "./polynomial-solver";

export function constructNearestTsBody(grade: number, dimension: number) {
    let retStr = '';

    const coeffDef = deriveCoefficientsUsage(normalQuadraticCoefficientsUsage(grade));

    const usedCoefficients = getUsedCoefficients(grade, coeffDef);

    retStr += constructBezierCoefficient(grade, dimension, usedCoefficients);
    retStr += '\n';

    for (let d = 0; d < dimension; d++) {
        retStr += 'const adjustedLastCoeff' + d + ' = coeff' + d + '_' + (grade - 1) + ' - ' + ID_DISTANCE_POINT + '[' + d + '];\n';
    }

    retStr += '\n';

    const resultingGrade = coeffDef.length;
    for (let g = 0; g < resultingGrade; g++) {
        const coeffsToUse = coeffDef[resultingGrade - g - 1];

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

    retStr += 'return cleanSolutions(solvePolynomial(\n';

    for (let g = 0; g < resultingGrade; g++) {
        retStr += '  mergedCoeff' + g;

        if (g < resultingGrade - 1) {
            retStr += ',\n';
        } else {
            retStr += '\n';
        }
    }

    retStr += '));\n\n';

    return retStr;
}

const resultingGrade = (grade: number) => normalQuadraticCoefficientsUsage(grade).length;

export const nearestTsFunction = new FunctionBodyHandler(
    "nearestTs",
    (grade: number, dimension: number) => grade + ' ' + dimension,
    [ID_POINTS, ID_DISTANCE_POINT],
    (grade, dimension) => constructNearestTsBody(grade, dimension),
    grade => getPolynomialSolver(resultingGrade(grade) - 1),
    (grade) => grade == 2 || grade == 3 ? undefined : () => {
        throw new Error('Can not calculate the nearest t for a grade other than 2 or 3 but ' + grade + ' was supplied.');
    }
)