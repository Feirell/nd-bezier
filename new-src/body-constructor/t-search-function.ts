import {getUsedCoefficients, normalPolynomialCoefficientsUsage} from "../polynomial-coefficient-usage";
import {ID_POINTS, ID_T_SEARCH_DIMENSION, ID_VAL_FOR_SEARCH} from "../ids";
import {constructBezierCoefficientForDimension} from "../section-constructor/bezier-coefficients";
import {FunctionBodyHandler} from "./function-body-handler";
import {getPolynomialSolver} from "./polynomial-solver";

export function constructTSearchBody(grade: number, dimension: number, cleanSolutions = true) {
    if (grade < 2 || grade > 4)
        throw new Error('can not construct t search for a grade other than 2, 3 or 4.');

    const coeffDef = normalPolynomialCoefficientsUsage(grade);
    const usedCoefficients = getUsedCoefficients(grade, coeffDef);

    let retStr = '\n';

    retStr += 'switch (' + ID_T_SEARCH_DIMENSION + ') {';
    for (let d = 0; d < dimension; d++) {
        retStr += '\n  case ' + d + ':\n    ';

        retStr += constructBezierCoefficientForDimension(grade, d, usedCoefficients).replace(/\n(?!$)/g, '\n    ');

        retStr += '\n';
        if (cleanSolutions)
            retStr += '    return cleanSolutions(solvePolynomial(\n';
        else
            retStr += '    return solvePolynomial(\n';

        for (let g = 0; g < grade; g++) {
            retStr += '      coeff' + d + '_' + g;

            if (g < grade - 1) {
                retStr += ',\n';
            } else {
                retStr += ' - ' + ID_VAL_FOR_SEARCH;
                retStr += '\n';
            }
        }

        if (cleanSolutions)
            retStr += '    ));\n';
        else
            retStr += '    );\n';

        retStr += '\n';
    }

    retStr += '  default: throw new Error("Invalid dimension " + ' + ID_T_SEARCH_DIMENSION + ');\n';


    retStr += '}\n';

    return retStr;
}

// const tSearch = new Cache<[number, number, number], string>(([grade, dimension, cs]) => grade + ' ' + dimension + ' ' + cs);

// export function constructTSearchBodyCached(grade: number, dimension: number, cleanSolutions = true) {
//     const cs = cleanSolutions ? 0 : 1;
//     let res = tSearch.get([grade, dimension, cs]);
//
//     if (res == undefined) {
//         res = constructTSearchBody(grade, dimension, cleanSolutions)
//         tSearch.set([grade, dimension, cs], res);
//     }
//
//     return res;
// }
//
// export const constructTSearchBodyParameters = [ID_POINTS, ID_T_SEARCH_DIMENSION, ID_T_FOR_SEARCH];

export const tSearchFunction = new FunctionBodyHandler(
    "tSearch",
    (grade: number, dimension: number, cleanSolutions: boolean) => grade + ' ' + dimension + ' ' + (cleanSolutions ? 0 : 1),
    [ID_POINTS, ID_T_SEARCH_DIMENSION, ID_VAL_FOR_SEARCH],
    (grade, dimension, cleanSolutions) => constructTSearchBody(grade, dimension, cleanSolutions),
    getPolynomialSolver
)