export const factorial = (function () {
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

export const bc = (function () {
    const bcCache: number[][] = [];

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

