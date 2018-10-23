import { Point } from './point';

const factorial = (function () {
    const factorialCache = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000];

    /**
     * Calculates n! 
     * @param n 
     */
    function factorial(n: number) {
        return factorialCache[n];
    }

    return factorial;
})();

/**
 * Calculates the k which is the closest n still fitting in n! so n! <= k
 * @param k 
 */
function reverseFactorial(k: number) {
    let f = 1;

    while (true)
        if (factorial(++f) >= k)
            return f - 1; // lower bound (f! which will fit in the given n, for upper bound just return f)

}

const bc = (function () {
    const bcCache = [];

    /**
     * Calculates the binomial coefficient for n over k
     * @param n 
     * @param k 
     */
    function bc(n: number, k: number): number {

        if (k > n / 2)
            k = n - k;

        if (k == 0)
            return 1;

        if (k == 1)
            return n;

        return bcCache[n][k];
    }

    // building up cache 
    for (let n = 0; n <= 15; n++) {
        bcCache[n] = [];
        for (let k = 0; k <= Math.ceil(n / 2); k++) {
            bcCache[n][k] = factorial(n) / (factorial(k) * factorial(n - k));
        }
    }

    return bc;
})();

/**
 * Calculates the sum for n (e.g. n = 5;sum(5) = 5+4+3+2+1 )
 * 
 * @param n 
 */
function sum(n: number) {
    return n * (n + 1) / 2
}

/**
 * The opposite calculation of sum(n)
 * 
 * @param k 
 */
function reverseSum(k) {
    return Math.sqrt(2 * k + 0.25) - 0.5
}

/**
 * Calculates the point on an an line defined by a and b
 * 
 * @param t 
 * @param a 
 * @param b 
 */
function pointOn(t: number, a: Point, b) {
    return {
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y)
    }
}

/**
 * Shorthand for Math.pow
 * @param n 
 * @param k 
 */
const pow = (n: number, k: number) => Math.pow(n, k);

/**
 * Calculates the level of the given i, see the example for more information.
 * @param i 
 */
function lvl(i: number) {
    return Math.floor(reverseSum(i));
};

/**
 * Calculates the level of the given intermediate index of the given bezier grade.
 * 
 * Example:
 * 
 * i = 3, grade = 3
 * ```text
 *          level
 *  0 1 2   2
 *   3 4    1       <= the level of the given index 3
 *    5     0
 * ```
 * 
 * @param bezierGrade 
 * @param i 
 */
function levelReverse(bezierGrade: number, i: number) {
    return lvl(sum(bezierGrade + 1) - i - 1);
};

/**
 * Calculates the level of the given intermediate index of the given bezier grade.
 * 
 * Example:
 * 
 * i = 3, grade = 3
 * ```text
 *          level
 *  0 1 2   0
 *   3 4    1       <= the level of the given index 3
 *    5     2
 * ```
 * 
 * @param bezierGrade 
 * @param i 
 */
function level(bezierGrade: number, i: number) {
    return lvl(sum(bezierGrade + 1)) - lvl(sum(bezierGrade + 1) - i - 1) - 1;
};

export {
    bc,
    factorial,
    reverseFactorial,
    sum,
    reverseSum,
    pointOn,
    pow,
    level,
    levelReverse
};