export type CoefficientUsageEntry = { multiplier: number, variables: number[] }[];
export type CoefficientUsageDefinition = CoefficientUsageEntry[];

export function normalPolynomialCoefficientsUsage(grade: number) {
    const ret: CoefficientUsageDefinition = [];

    for (let i = 0; i < grade; i++)
        // since 0 == a, 1 == b, etc. and we fill the array from index 0 to grade-1 we need to
        // enumerate the other way around
        ret.push([{multiplier: 1, variables: [grade - i - 1]}]);

    return ret;
}

/**
 * This quadratures a polynomial with the defined grade g
 * quad(g) = (a*t^g + b*t^(g-1) + c*t^(g-2) + ... + x*t^0)^2
 *
 * The result has the following structure:
 *
 * First array grouped by t exponents, second array are the summands within the multiplier grouped by brackets.
 *
 * So for example when the data structure contains the following:
 * [ [ { multiplier: 1, variables: [0, 0, 1, 4] }, { multiplier: 7, variables: [4] } ] ]
 *
 * The result would be:
 *
 *   t ^ 0 * (
 *     1 * a * a * b * d +
 *     7 * d
 *   )
 *
 * 0 because the index of this first entry is 0 and the letters
 * are the translation of the index to letters (variables)
 */
export function normalQuadraticCoefficientsUsage(grade: number): CoefficientUsageDefinition {
    // Have a look at the documentation for the function as to how this data structure is to be interpreted.
    const res: CoefficientUsageDefinition = [];

    // drawing the (a*t^g + b*t^(g-1) + c*t^(g-2) + ... + x*t^0) * (a*t^g + b*t^(g-1) + c*t^(g-2) + ... + x*t^0)
    // as an matrix you could attach coordinates to those cells of the matrix. [0, 0] would be the multiplication of
    // a*t^g * a*t^g, [1, 3] would be b*t^(g-1) * d*t^(g-3)
    // If you start with 0,0 in the top left corner each diagonal row would contain the same exponent of t so all sums of
    // this diagonal would result in the result of the quadratur.
    // Starting in the right bottom corner since this is t^0
    let startX = grade - 1;
    let startY = grade - 1;

    while (true) {
        const partial: CoefficientUsageEntry = [];

        let curX = startX;
        let curY = startY;

        while (true) {
            if (curX == curY)
                // this is a mirror point, this is just a*a or b*b and only occurs once, hence the multiplier
                partial.push({multiplier: 1, variables: [curX, curY]})
            else
                // this is a point before the mirror, it happens twice and is the multiplication of the column variable
                // times the row variable
                partial.push({multiplier: 2, variables: [curX, curY]})

            // we a diagonal center point, all additions after this one are duplications of the ones we already recorded
            if (curX == curY)
                break;

            // only every second diagonal goes through a n, n point (with x and y identical) which marks the point after
            // which only duplicates are recorded. If this is such a diagonal we need to check otherwise. The point after
            // which only duplicates comes is the point were the coords of the next are the switches of the current
            // (e.g.: 1, 2 and 2, 1) The next points for 1, 2 would be 2, 1 (increase x, decrease y) but this is the mirrored
            // point
            if (curY - 1 == curX && curX + 1 == curY)
                break;


            // walking diagonally
            curX++;
            curY--;
        }

        res.push(partial);

        // finished since we reached the top left corner
        if (startX == 0 && startY == 0)
            break;

        // moving the start coordinate, first back on the x axis and then up the y axis
        if (startX != 0)
            startX--;
        else
            startY--;
    }

    return res;
}

/**
 * This function creates the derivative usage for a polynomial coefficient usage.
 */
export function deriveCoefficientsUsage(definition: CoefficientUsageDefinition) {
    const copy: CoefficientUsageDefinition = JSON.parse(JSON.stringify(definition));

    // dropping the first element since the derivative of a static summand is zero (since it does not add to the slope)
    copy.shift();

    // adding the multiplier on each group
    for (let i = 0; i < copy.length; i++)
        for (const group of copy[i])
            group.multiplier *= (i + 1);

    return copy;
}

export function getUsedCoefficients(grade: number, ...coeffDefs: CoefficientUsageDefinition[]) {
    // remember all used coefficients to drop those which are not relevant
    const usedCoefficients = new Array(grade).fill(false) as boolean[];

    for (const coeffDef of coeffDefs)
        for (const coeffs of coeffDef)
            for (const additiveGroup of coeffs)
                for (const coeffIndex of additiveGroup.variables)
                    usedCoefficients[coeffIndex] = true;

    return usedCoefficients;
}
