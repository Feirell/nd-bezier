// import {NrRange} from "./number-ranger";

// got this from https://stackoverflow.com/a/52490977
// type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
// type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type NrRange<To extends number> =
    To extends 0 ? never :
        To extends 1 ? 0 :
            To extends 2 ? 0 | 1 :
                To extends 3 ? 0 | 1 | 2 :
                    To extends 4 ? 0 | 1 | 2 | 3 :
                        To extends 5 ? 0 | 1 | 2 | 3 | 4 :
                            To extends 6 ? 0 | 1 | 2 | 3 | 4 | 5 :
                                To extends 7 ? 0 | 1 | 2 | 3 | 4 | 5 | 6 :
                                    To extends 8 ? 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 :
                                        To extends 9 ? 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 :
                                            To extends 10 ? 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 :
                                                number;

export type Tuple<T, L extends number> =
    L extends 0 ? [] :
        L extends 1 ? [T] :
            L extends 2 ? [T, T] :
                L extends 3 ? [T, T, T] :
                    L extends 4 ? [T, T, T, T] :
                        L extends 5 ? [T, T, T, T, T] :
                            L extends 6 ? [T, T, T, T, T, T] :
                                L extends 7 ? [T, T, T, T, T, T, T] :
                                    L extends 8 ? [T, T, T, T, T, T, T, T] :
                                        L extends 9 ? [T, T, T, T, T, T, T, T, T] :
                                            L extends 10 ? [T, T, T, T, T, T, T, T, T, T] :
                                                T[];

export type NrTuple<Nr extends number> = Tuple<number, Nr>;

export type Points<Grade extends number, Dimension extends number> = Tuple<Tuple<number, Dimension>, Grade>

export declare class StaticBezier<Grade extends number, Dimension extends number> {
    constructor(controlPoints: Points<Grade, Dimension>);

    getPoints(): Points<Grade, Dimension>;

    at(t: number): NrTuple<Dimension>;

    direction(t: number): NrTuple<Dimension>;

    offsetPoint(t: number, distance: number): NrTuple<Dimension>;

    findTs(dimension: NrRange<Dimension>, value: number): number extends Grade ? number[] : Grade extends 2 | 3 | 4 ? number[] : never;

    nearestTs(point: number extends Dimension ? number[] : NrTuple<Dimension>): number extends Grade ? number[] : Grade extends 2 | 3 ? number[] : never;

    split(t: number): [Points<Grade, Dimension>, Points<Grade, Dimension>];

    arcLength(tStart: number, tEnd: number): Grade extends 2 | 3 ? number : never;
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
