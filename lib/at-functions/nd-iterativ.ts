import { UsableFunction, AtFunction, BezierProperties } from "../types";
import { bc, pow } from "../math-functions";

const nDIterativ = ({ points, grade, dimension }: BezierProperties, t: number) => {
    const retValue = new Array(dimension).fill(0);
    const oneMinusT = 1 - t;

    grade--;
    for (let g = 0; g <= grade; g++) {
        const currentMultiplier = bc(grade, g) * pow(t, g) * pow(oneMinusT, grade - g)
        const point = points[g];

        for (let d = 0; d < dimension; d++)
            retValue[d] = retValue[d] + point[d] * currentMultiplier;
    }

    return retValue;
}

export default Object.freeze({
    generate: (bezier) => {
        return nDIterativ;
    },
    shouldReset: (g, d, p) => {
        return false;
    }
}) as UsableFunction<AtFunction>