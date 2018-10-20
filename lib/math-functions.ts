const factorial = (function () {
    const factorialCache = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000];

    function factorial(n) {
        return factorialCache[n];
    }

    return factorial;
})();

function reverseFactorial(n) {
    let f = 1;

    while (true)
        if (factorial(++f) >= n)
            return f - 1; // lower bound (f! which will fit in the given n, for upper bound just return f)

}

const bc = (function () {
    const bcCache = [];

    // binomial coefficient
    function bc(n, k) {

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

function sum(n) {
    return n * (n + 1) / 2
}

function reverseSum(k) {
    return Math.sqrt(2 * k + 0.25) - 0.5
}

function pointOn(t, a, b) {
    return {
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y)
    }
}

const pow = (n, k) => Math.pow(n, k);

function lvl(i) {
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
 * @param {number} bezierGrade 
 * @param {number} i 
 */
function levelReverse(bezierGrade, i) {
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
 * @param {number} bezierGrade 
 * @param {number} i 
 */
function level(bezierGrade, i) {
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