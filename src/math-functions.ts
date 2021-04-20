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

export const bc = (n: number, k: number) => {
    if (k < 0 || k > n)
        return 0;

    if (k == 0 || k == n)
        return 1;

    if (n - k < k)
        k = n - k;

    let c = 1;

    for (let i = 0; i < k; i++)
        c *= (n - i) / (i + 1);

    return c;
}


