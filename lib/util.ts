/**
 * 
 * @param is the value the value is currently
 * @param should what value `is` should be
 * @param margin how far away the the value is allowed to be from the `should` result
 * 
 * @returns -1 if `is` is under the range of should - margin
 *          +1 if `is` is obove the range of should + margin
 *          0 if `is` is withing in the range
 */
export const inRange = (is: number, should: number, margin: number): number => {
    const under = is <= (should + margin);
    const above = is >= (should - margin);
    return under && above ? 0 : (under ? -1 : 1);
}

/**
 * 
 * @param func an function taking an value 0..1 and return 0..1
 * @param should the value the function should return 0..1
 * @param margin how far away the the value is allowed to be from the `should` result
 * 
 * @returns the argument you have to put into the function to get an value which is within [should-margin .. should+margin]
 *          returns NaN if it is not able to reach the value in the given range and throwError is false
 * 
 * @throws this function will throw an error if it is not able to reach the given range and throwError is true
 */
export const binSearch = (func: (v: number) => number, should: number, margin: number, throwError = false): number => {
    // solution fraction
    let c = 1; // Denominator, with c / m is the current testing value

    let m = 2; // 1/m is the current shift in each cycle

    const shift = func(0) <= func(1);

    let d;
    while ((d = inRange(func(c / m), should, margin)) != 0) {
        c = (c << 1) + (shift ? -d : +d);

        if (m > 0 && (m << 1) < 0)
            if (throwError)
                throw new Error('could not find the gived value');
            else
                return NaN;

        m = m << 1;
    }

    return c / m;
}
