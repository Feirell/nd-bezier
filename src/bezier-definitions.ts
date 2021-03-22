import {NrRange} from "./number-ranger";

// got this from https://stackoverflow.com/a/52490977
type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type NrTuple<Nr extends number> = Tuple<number, Nr>;

export type Points<Grade extends number, Dimension extends number> = Tuple<Tuple<number, Dimension>, Grade>

export declare class StaticBezier<Grade extends number, Dimension extends number> {
    constructor(controlPoints: Points<Grade, Dimension>);

    getPoints(): Points<Grade, Dimension>;

    at(t: number): NrTuple<Dimension>;

    direction(t: number): NrTuple<Dimension>;

    offsetPointLeft(t: number, distance: number): NrTuple<Dimension>;

    offsetPointRight(t: number, distance: number): NrTuple<Dimension>;

    tSearch(dimension: NrRange<0, Dimension>, value: number, cleanSolutions?: boolean): number extends Grade ? number[] : Grade extends 2 | 3 | 4 ? number[] : never;

    nearestTs(point: number extends Dimension ? number[] : NrTuple<Dimension>): number extends Grade ? number[] : Grade extends 2 | 3 ? number[] : never;
}

export interface StaticBezierConstructor<Grade extends number, Dimension extends number> {
    new(controlPoints: Points<Grade, Dimension>): StaticBezier<Grade, Dimension>
}

export declare class DynamicBezier<Grade extends number, Dimension extends number> extends StaticBezier<Grade, Dimension> {
    constructor(controlPoints: Points<Grade, Dimension>);

    setPoints(points: Points<Grade, Dimension>): void;
}

export interface DynamicBezierConstructor<Grade extends number, Dimension extends number> {
    new(controlPoints: Points<Grade, Dimension>): DynamicBezier<Grade, Dimension>
}