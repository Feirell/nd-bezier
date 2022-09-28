import {
  Complex,
  solveCubicEquation,
  solveLinearEquation,
  solveQuadraticEquation
} from "linear-quadratic-cubic-eq-solver";

/**
 *
 * @param is the value the value is currently
 * @param should what value `is` should be
 * @param margin how far away the the value is allowed to be from the `should` result
 *
 * @returns < 0 if `is` is below the range of should - margin
 *          > 0 if `is` is above the range of should + margin
 *          = 0 if `is` is withing in the range
 */
const inRange = (is: number, should: number, margin: number): number => {
    const spm = should + margin
    if (is > spm)
        return is - spm;

    const smm = should - margin
    if (is < smm)
        return is - smm;

    return 0;
}

/**
 * Removes complex numbers and converts complex numbers with an imaginary part of smaller than 1e-8 to a real number.
 * @param n
 */
export const cleanSolutions = (n: (number | Complex)[]): number[] => {
    const k: number[] = [];

    for (const h of n) {
        if (typeof h == 'number')
            k.push(h);
        else if (inRange(h.im, 0, 1e-8) == 0)
            k.push(h.re);

    }

    return k as number[];
}

export const getPolynomialSolver = (grade: number) => {
    let polynomialSolver;

    switch (grade) {
        case 2:
            polynomialSolver = solveLinearEquation;
            break;

        case 3:
            polynomialSolver = solveQuadraticEquation;
            break;

        case 4:
            polynomialSolver = solveCubicEquation;
            break;

        default:
            throw new Error('Can not construct T Search with a grade which is not 2, 3 or 4');
    }

    return [
        {internalName: 'solvePolynomial', globalValue: polynomialSolver},
        {internalName: 'cleanSolutions', globalValue: cleanSolutions}
    ];
}
