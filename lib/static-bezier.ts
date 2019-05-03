import ProduceSpecific from './at-functions/produced-specific';
import Determenistic from './t-search-functions/deterministic';
import { Bezier } from './bezier';
import { BezierProperties } from './types';

const createSpecificAtFunction = (points: number[][]) => {
    const at = ProduceSpecific.generate({
        getBezierProperties: () => ({
            points,
            grade: points.length,
            dimension: points[0].length
        })
    } as Bezier);

    if (at == null)
        throw new Error("could not create specific function for points " + JSON.stringify(points));

    return at.bind(null, null as any);
};

const createDetermenisticTSearchFunction = (points: number[][]) => {
    const tSearch = Determenistic.generate({
        getGrade: () => points.length
    } as Bezier);

    if (tSearch == null)
        throw new Error("could not create determenistic function for points " + JSON.stringify(points));

    return tSearch.bind(null, { points } as BezierProperties);
}

export class StaticBezier {

    constructor(points: number[][]) {
        this.at = createSpecificAtFunction(points);
        this.tSearch = createDetermenisticTSearchFunction(points);
    }

    at(t: number): number[] { throw new Error(); }

    tSearch(value: number, dimension: number) { throw new Error(); }
}