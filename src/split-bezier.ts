// implementation inspired by https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/bezier-sub.html
import {Points} from "./bezier-definitions";

// implementation inspired by https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/bezier-sub.html
export function split<ControlPoints extends Points<any, any>>(points: ControlPoints, t: number) {
    const grade = points.length;
    const dimension = points[0].length;

    const leftPoints = new Array(grade);
    const rightPoints = new Array(grade);

    let intermediatePoints: Points<any, any /*The dimension stays the same but typescript can not infer the dimension*/> = points;

    for (let k = 0; k < grade; k++) {
        const subGrade = intermediatePoints.length;
        leftPoints[k] = intermediatePoints[0];
        rightPoints[grade - k - 1] = intermediatePoints[subGrade - 1];

        const resPoints = new Array(subGrade - 1);

        for (let i = 1; i < subGrade; i++) {
            const prev = intermediatePoints[i - 1];
            const curr = intermediatePoints[i];

            const point = new Array(dimension);
            for (let d = 0; d < dimension; d++)
                point[d] = prev[d] * (1 - t) + curr[d] * t;

            resPoints[i - 1] = point;
        }

        intermediatePoints = resPoints;
    }

    return [leftPoints, rightPoints] as [ControlPoints, ControlPoints];
}