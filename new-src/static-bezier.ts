import {NrTuple, Points, StaticBezier as SB} from "./bezier-definitions";
import {atFunction, directionFunction} from "./body-constructor/bezier-function";
import {offsetPointLeftFunction, offsetPointRightFunction} from "./body-constructor/offset-bezier-function";
import {NrRange} from "ts-number-range";
import {tSearchFunction} from "./body-constructor/t-search-function";
import {nearestTFunction} from "./body-constructor/nearest-t-body-function";

export class StaticBezier<Grade extends number, Dimension extends number> implements SB<Grade, Dimension> {
    protected readonly dimension: Dimension;
    protected readonly grade: Grade;
    private readonly points: Points<Grade, Dimension>;

    constructor(p: Points<Grade, Dimension>) {
        this.points = p;

        this.grade = p.length as any;
        this.dimension = p[0].length as any;
    }

    getPoints(): Points<Grade, Dimension> {
        return this.points;
    }

    at(t: number): NrTuple<Dimension> {
        this.at = atFunction.getStaticFunction(this.grade, this.dimension, this.points);
        return this.at(t);
    }

    direction(t: number): NrTuple<Dimension> {
        this.direction = directionFunction.getStaticFunction(this.grade, this.dimension, this.points);
        return this.direction(t);
    }

    offsetPointLeft(t: number, distance: number): NrTuple<Dimension> {
        this.offsetPointLeft = offsetPointLeftFunction.getStaticFunction(this.grade, this.dimension, this.points);
        return this.offsetPointLeft(t, distance);
    }

    offsetPointRight(t: number, distance: number): NrTuple<Dimension> {
        this.offsetPointRight = offsetPointRightFunction.getStaticFunction(this.grade, this.dimension, this.points);
        return this.offsetPointRight(t, distance);
    }

    tSearch(dim: NrRange<0, Dimension>, value: number, cleanSolutions?: boolean): Grade extends 2 | 3 | 4 ? number[] : never {
        this.tSearch = tSearchFunction.getStaticFunction(this.grade, this.dimension, this.points, true);
        return this.tSearch(dim, value, cleanSolutions);
    }

    nearestT(point: NrTuple<Dimension>): Grade extends 2 | 3 ? number[] : never {
        this.nearestT = nearestTFunction.getStaticFunction(this.grade, this.dimension, this.points);
        return this.nearestT(point);
    }
}