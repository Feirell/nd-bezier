export function findValueWithSecant(f: (t: number) => number, value: number, x0: number, x1: number, epsilon: number) {
    let x2;

    do {
        let d = f(x1) - f(x0);

        if (d == 0)
            d = f(x1) - f(x0 + (x1 - x0) * 0.01);

        x2 = x1 - (f(x1) - value) * (x1 - x0) / d;

        x0 = x1;
        x1 = x2;
    } while (Math.abs(f(x2) - value) > epsilon)

    return x2;
}
