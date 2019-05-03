import ProduceSpecific from './at-functions/produced-specific';
import { Bezier } from './bezier';

const createSpecificAtFunction = (points: number[][]) => {
    const at = ProduceSpecific.generate({
        getBezierProperties: () => ({
            points,
            grade: points.length,
            dimension: points[0].length
        })
    } as Bezier);

    if (at == null)
        throw new Error("could not create specific function for point " + JSON.stringify(points));

    return at.bind(null, null as any);
};

export class StaticBezier {

    constructor(points: number[][]) {
        this.at = createSpecificAtFunction(points);
    }

    at(t: number): number[] { throw new Error(); }
}