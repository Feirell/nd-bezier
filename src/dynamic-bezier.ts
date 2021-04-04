import {DynamicBezier, DynamicBezierConstructor, Points, StaticBezier} from "./bezier-definitions";
import {atFunction, directionFunction} from "./body-constructor/bezier-function";
import {findTsFunction} from "./body-constructor/find-ts-function";
import {nearestTsFunction} from "./body-constructor/nearest-ts-body-function";
import {offsetPointLeftFunction, offsetPointRightFunction} from "./body-constructor/offset-bezier-function";
import {split as splitFnc} from "./split-bezier";

function getPoints<Grade extends number, Dimension extends number>(this: StaticBezier<Grade, Dimension>): Points<Grade, Dimension> {
    return (this as any).points;
}

/*
function setPoints<Grade extends number, Dimension extends number>(this: StaticBezier<Grade, Dimension>, points: Points<Grade, Dimension>) {
    if (!Array.isArray(points))
        throw new Error('points needs to be of type array');

    const copiedPoints: Points<Grade, Dimension> = [] as any;

    for (let g = 0; g < this.grade; g++) {
        const controlPoint = points[g];
        if (!Array.isArray(controlPoint))
            throw new Error('points[' + g + '] is not an array');

        copiedPoints[g] = [] as any;
        const copiedControlPoint = copiedPoints[g];

        for (let d = 0; d < this.dimension; d++) {
            const coord = controlPoint[d];
            if (!Number.isFinite(coord))
                throw new Error('points[' + g + '][' + d + '] is not finite');

            copiedControlPoint.push(coord);
        }
    }

    this.points = copiedPoints;
}
*/

function setPoints<Grade extends number, Dimension extends number>(this: StaticBezier<Grade, Dimension>, points: Points<Grade, Dimension>) {
    (this as any).points = points;
}

const classCache = new Map<string, DynamicBezierConstructor<number, number>>();


type DynamicBezierConstructorDef<Grade extends number, Dimension extends number> = DynamicBezierConstructor<Grade, Dimension>;
type DynamicBezierDef<Grade extends number, Dimension extends number> = DynamicBezier<Grade, Dimension>;

function split<Grade extends number, Dimension extends number>(this: DynamicBezier<Grade, Dimension>, t: number) {
    return splitFnc((this as any).points as Points<Grade, Dimension>, t);
}

// TODO rewrite dynamic bezier to not use t grouped coefficients but the old version which had t multipliers and coords just once
export function getDynamicBezier<Grade extends number, Dimension extends number>(grade: Grade, dimension: Dimension, cleanSolution = true) {
    const key = grade + ' ' + dimension + ' ' + (cleanSolution ? 0 : 1);
    const res = classCache.get(key) as undefined | DynamicBezierConstructor<Grade, Dimension>;

    if (res !== undefined)
        return res;

    function DynamicBezier(this: DynamicBezierDef<Grade, Dimension>, points: Points<Grade, Dimension>) {
        (this as any).grade = grade;
        (this as any).dimension = dimension;

        (this as any).setPoints(points);
    }

    const proto = DynamicBezier.prototype as DynamicBezier<Grade, Dimension>
    Object.assign(proto, {
        setPoints: setPoints,
        getPoints: getPoints,

        at: atFunction.getDynamicFunction(grade, dimension),

        direction: directionFunction.getDynamicFunction(grade, dimension),
        offsetPointLeft: offsetPointLeftFunction.getDynamicFunction(grade, dimension),
        offsetPointRight: offsetPointRightFunction.getDynamicFunction(grade, dimension),
        findTs: findTsFunction.getDynamicFunction(grade, dimension, cleanSolution),
        nearestTs: nearestTsFunction.getDynamicFunction(grade, dimension),

        split: split
    });

    classCache.set(key, DynamicBezier as any);

    return DynamicBezier as any as DynamicBezierConstructorDef<Grade, Dimension>;
}
