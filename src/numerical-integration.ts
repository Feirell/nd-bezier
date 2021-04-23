import {findValueWithSecant} from "./secant-root-finding";

export class NumericalFunctionIntegration {
    private readonly backing: Float32Array;

    private readonly fnc: (t: number) => number;
    private readonly precision: number = 2 ** 12

    constructor(
        fnc: (t: number) => number,
        precision: number = 2 ** 9
    ) {
        this.fnc = fnc;
        this.precision = precision;

        const backing = new Float32Array(precision);

        let sum = 0;

        // It would be more correct to use a triangle spanning the graph in the segment
        // but it turns out that the midpoint is a better approximation.

        // let prev = fnc(0);
        // for (let i = 0; i < precision; i++) {
        //     const next = fnc((i + 1) / precision)
        //     const seg = (next + prev) / 2;
        //     sum += seg;
        //     backing[i] = sum;
        //
        //     prev = next;
        // }

        for (let i = 0; i < precision; i++) {
            const seg = fnc((i + .5) / precision);
            sum += seg;
            backing[i] = sum;
        }

        this.backing = backing;
    }

    getIntegral(t: number) {
        const backing = this.backing;
        const precision = this.precision;

        if (t <= 0)
            return 0;
        else if (t >= 1)
            return backing[precision - 1] / precision;

        const scaled = t * precision;
        const delta = scaled % 1;

        const i = scaled - delta - 1;

        let sum = 0;
        if (i >= 0)
            sum += backing[i];

        const iDelta = i + 1;
        if (iDelta < precision && delta != 0)
            sum += (backing[iDelta] - sum) * delta;

        return sum / precision;
    }

    getTForIntegral(value: number, epsilon: number = 1e-5) {
        if (value <= 0)
            return 0;
        else if (value >= this.backing[this.precision - 1])
            return 1;

        const fnc = (t: number) => this.getIntegral(t);
        return findValueWithSecant(fnc, value, 0, 1, epsilon);
    }
}
