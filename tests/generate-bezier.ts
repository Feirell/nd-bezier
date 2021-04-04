import {NrTuple, Points} from "../src/bezier-definitions";
import {StaticBezier} from "../src/static-bezier";

export const generatePoints = <Grade extends number, Dimension extends number>(grade: Grade, dimension: Dimension) => {
    const points: Points<Grade, Dimension> = new Array(grade) as any;

    for (let g = 0; g < grade; g++) {
        const point = new Array(dimension) as NrTuple<Dimension>;

        for (let d = 0; d < dimension; d++) {
            if (d == 0)
                point[d] = g;
            else
                point[d] = g & (1 << (d - 1)) ? 0 : 100;
        }

        points[g] = point;
    }

    return points as Points<Grade, Dimension>;
}

export const generateBezier = <Grade extends number, Dimension extends number>(grade: Grade, dimension: Dimension) =>
    new StaticBezier<Grade, Dimension>(generatePoints(grade, dimension));
