import {coefficients} from "../coefficient-creator";
import {ID_POINTS} from "../ids";

export function constructBezierCoefficientForDimension(grade: number, dimension: number | string, usedCoefficients: boolean[], coeffs = coefficients(grade)) {
    let retStr = '';

    // iterating over the coefficients for the full bezier expression
    // c represents the t exponent currently handled
    for (let c = 0; c < grade; c++) {
        if (!usedCoefficients[c])
            continue;

        let combinedMultiplier = '';
        const coeffsForTExpC = coeffs[grade - c - 1];
        // iterating over the multiplier for the control points
        for (let m = 0; m < grade; m++) {
            const multiplier = coeffsForTExpC[m];
            if (multiplier == 0)
                continue;

            if (combinedMultiplier.length != 0 || multiplier < 0)
                combinedMultiplier += multiplier < 0 ? ' - ' : ' + ';

            const exp = ID_POINTS + '[' + m + '][' + dimension + ']';

            combinedMultiplier += exp;

            const abs = multiplier < 0 ? -multiplier : multiplier;

            if (abs != 1)
                combinedMultiplier += ' * ' + abs;
        }

        retStr += 'const coeff' + dimension + '_' + c + ' = ' + combinedMultiplier + ';\n';
    }

    return retStr;
}

export function constructBezierCoefficient(grade: number, dimension: number, usedCoefficients: boolean[]) {
    const coeffs = coefficients(grade);

    let retStr = '';

    for (let d = 0; d < dimension; d++) {
        retStr += constructBezierCoefficientForDimension(grade, d, usedCoefficients, coeffs);

        if (d < dimension - 1)
            retStr += '\n';
    }

    return retStr;
}