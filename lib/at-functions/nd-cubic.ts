import { BezierProperties, UsableFunction, AtFunction } from "../types";

const nDCubic = ({ points, dimension }: BezierProperties, t: number) => {
    const oneMinusT = 1 - t;
    const retVal = new Array(dimension);

    for (let i = 0; i < dimension; i++)
        retVal[i] = oneMinusT * oneMinusT * oneMinusT * points[0][i] +
            3 * t * oneMinusT * oneMinusT * points[1][i] +
            3 * t * t * oneMinusT * points[2][i] +
            t * t * t * points[3][i];

    return retVal;
}

export default Object.freeze({
    generate: (bezier) => {
        return bezier.getGrade() == 4 ? nDCubic : null;
    },
    shouldReset: (g, d, p) => {
        return g;
    }
}) as UsableFunction<AtFunction>