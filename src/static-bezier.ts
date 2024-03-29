import {NrRange, NrTuple, Points, StaticBezier as SB} from "./bezier-definitions";
import {atFunction, directionFunction} from "./body-constructor/bezier-function";
import {offsetPointFunction} from "./body-constructor/offset-bezier-function";

import {findTsFunction} from "./body-constructor/find-ts-function";
import {nearestTsFunction} from "./body-constructor/nearest-ts-body-function";
import {split} from "./split-bezier";
import {arcLengthFunction} from "./body-constructor/arc-length";
import {offsetDirectionFunction} from "./body-constructor/offset-direction";

function checkAndCopyPoints<Grade extends number, Dimension extends number>(points: Points<Grade, Dimension>) {
  if (!Array.isArray(points))
    throw new Error("points needs to an array");

  const copiedPoints = [] as Points<Grade, Dimension>;

  if (points.length < 2)
    throw new Error("Points needs to at least be of length two.");

  const grade = points.length;

  let dimension = 0;

  for (let g = 0; g < grade; g++) {
    const controlPoint = points[g];
    if (!Array.isArray(controlPoint))
      throw new Error("Points[" + g + "] is not an array.");

    copiedPoints[g] = [] as never;
    const copiedControlPoint = copiedPoints[g];

    if (g == 0) {
      dimension = controlPoint.length;

      if (dimension == 0)
        throw new Error("Dimension needs to be at least one.");
    }

    for (let d = 0; d < dimension; d++) {
      const coord = controlPoint[d];
      if (!Number.isFinite(coord))
        throw new Error("Points[" + g + "][" + d + "] is not finite.");

      copiedControlPoint.push(coord);
    }
  }

  return {points: copiedPoints, grade, dimension};
}

export class StaticBezier<Grade extends number, Dimension extends number> implements SB<Grade, Dimension> {
  protected readonly dimension: Dimension;
  protected readonly grade: Grade;
  protected readonly points: Points<Grade, Dimension>;

  constructor(p: Points<Grade, Dimension>) {
    const {points, grade, dimension} = checkAndCopyPoints<Grade, Dimension>(p);

    this.points = points;
    this.grade = grade as Grade;
    this.dimension = dimension as Dimension;
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

  offsetPoint(t: number, distance: number): Dimension extends 2 ? NrTuple<Dimension> : never {
    this.offsetPoint = offsetPointFunction.getStaticFunction(this.grade, this.dimension, this.points);
    return this.offsetPoint(t, distance);
  }

  offsetDirection(t: number, distance: number): Dimension extends 2 ? Grade extends 2 | 3 | 4 ? NrTuple<Dimension> : never : never {
    this.offsetDirection = offsetDirectionFunction.getStaticFunction(this.grade, this.dimension, this.points);
    return this.offsetDirection(t, distance);
  }

  findTs(dim: NrRange<Dimension>, value: number): number extends Grade ? number[] : Grade extends 2 | 3 | 4 ? number[] : never {
    this.findTs = findTsFunction.getStaticFunction(this.grade, this.dimension, this.points, true);
    return this.findTs(dim, value);
  }

  nearestTs(point: number extends Dimension ? number[] : NrTuple<Dimension>): number extends Grade ? number[] : Grade extends 2 | 3 ? number[] : never {
    this.nearestTs = nearestTsFunction.getStaticFunction(this.grade, this.dimension, this.points);
    return this.nearestTs(point);
  }

  split(t: number): [Points<Grade, Dimension>, Points<Grade, Dimension>] {
    return split(this.points, t);
  }

  arcLength(tStart: number, tEnd: number): Grade extends 2 | 3 ? number : never {
    this.arcLength = arcLengthFunction.getStaticFunction(this.grade, this.dimension, this.points);
    return this.arcLength(tStart, tEnd);
  }
}
