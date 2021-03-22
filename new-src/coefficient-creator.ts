import {bc} from "./math-functions";

class Polynomial {
    constructor(private readonly coefficients: ReadonlyArray<number> = []) {
    }

    getCoefficients() {
        return this.coefficients.slice();
    }

    // add(other: Polynomial) {
    //     if (other.coefficients.length > this.coefficients.length)
    //         this.coefficients.length = other.coefficients.length;
    //
    //
    // }

    multiply(other: Polynomial) {
        const thisCoeff = this.coefficients;
        const otherCoeff = other.coefficients;

        let coeff: number[] = new Array(1 + thisCoeff.length - 1 + otherCoeff.length - 1).fill(0);

        for (let other = 0; other < otherCoeff.length; other++) {
            const a = otherCoeff[other];
            if (a == 0)
                continue;

            for (let our = 0; our < thisCoeff.length; our++) {
                const b = thisCoeff[our];
                if (b == 0)
                    continue;

                coeff[other + our] += a * b;
            }
        }

        return new Polynomial(coeff);
    }

    toString(exp: string) {
        const co = this.coefficients;

        let ret = '';
        for (let i = co.length - 1; i >= 0; i--) {
            const c = co[i];

            if (c == 0)
                continue;

            if (ret.length != 0 || c < 0)
                ret += c < 0 ? ' - ' : ' + ';

            if (i > 1)
                ret += exp + ' ^ ' + i;
            else if (i > 0)
                ret += exp;

            const abs = c < 0 ? -c : c;

            if (abs != 1 || i == 0)
                ret += (i != 0 ? ' * ' : '') + abs;
        }

        return ret.length == 0 ? '0' : ret;
    }
}

/**
 * This functions returns an two dimensional array with the coefficients for the control points of the bezier curve
 * grouped by t exponents.
 *
 * For example grade 3 would result in an array like:
 * ```
 * [
 *   // v_0 v_1 v_2
 *     [ 1,  0,  0] // <= t^0
 *     [-2,  2,  0] // <= t^1 (for example this row is meant to represent: t^1 * (v_0 * -2 + v_1 * 2 + v_2 * 0))
 *     [ 1, -2,  1] // <= t^2
 * ]
 * ```
 *
 * @param grade
 */
export function coefficients(grade: number) {
    // Bezier is defined by sum from i to n of bc(n,i) * t ^ i * (1-t)^(n-1) * P_i
    // the coefficients are the static parts, so the resulting polynomial grouped by the t by their exponent

    grade = grade - 1;

    const oneMinusT = new Polynomial([1, -1]);
    const t = new Polynomial([0, 1]);

    /*
    results saves the coefficients for the v_i (the control points) grouped by the t by their exponent



     */
    let result: number[][] = [];

    for (let g = 0; g <= grade; g++) {
        let partial = new Polynomial([bc(grade, g)]);

        for (let oneMinusTExp = 0; oneMinusTExp < (grade - g); oneMinusTExp++) {
            partial = partial.multiply(oneMinusT);
        }

        for (let tExp = 0; tExp < g; tExp++) {
            partial = partial.multiply(t);
        }

        const coeff = partial.getCoefficients();
        for (let i = 0; i < coeff.length; i++) {
            if (result.length <= i)
                result.push(new Array(grade + 1).fill(0))

            const grouped = result[i];
            grouped[g] += coeff[i];
        }
    }

    return result;
}