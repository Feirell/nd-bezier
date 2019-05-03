import { TSearchFunction, UsableFunction } from "../types";

import { binSearch } from "../util";

export default Object.freeze({
    generate: (bezier) => {
        const bezierProperties = bezier.getBezierProperties();

        if (bezierProperties == null)
            return null;

        const dimensionConfiguration = new Array(bezierProperties.dimension);
        for (let d = 0; d < bezierProperties.dimension; d++)
            dimensionConfiguration[d] = {
                func: (v: number) => bezier.at(v)[d],
                inje: bezier.isInjective(d)
            };


        return (bp, v, d) => {
            const dConf = dimensionConfiguration[d];

            if (!dConf.inje)
                return [];

            const bsResult = binSearch(dConf.func, v, 1e-5);
            return isNaN(bsResult) ? [] : [bsResult];
        }
    },
    shouldReset: (g, d, p) => {
        return p; // for the offchance that the new points are changing the injective property
    }
}) as UsableFunction<TSearchFunction>