import {produceSpecificAtFunction} from "./produce-specific-at";
import {createDeterministicTSearch} from "./deterministic-t-search";

const createSpecificAtFunction = (points: number[][]) => {
    const at = produceSpecificAtFunction(points);

    if (at == null)
        throw new Error("could not create specific function for points " + JSON.stringify(points));

    return at;
};

const createDetermenisticTSearchFunction = (points: number[][]) => {
    const tSearch = createDeterministicTSearch(points);

    if (tSearch == null)
        throw new Error("could not create deterministic function for points " + JSON.stringify(points));

    return tSearch;
}

export class StaticBezier {

    constructor(points: number[][]) {
        this.at = createSpecificAtFunction(points);
        this.tSearch = createDetermenisticTSearchFunction(points);
    }

    at(t: number): number[] {
        throw new Error();
    }

    tSearch(value: number, dimension: number) {
        throw new Error();
    }
}
