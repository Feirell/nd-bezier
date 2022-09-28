import {StaticBezier} from "./bezier-definitions";
import {NumericalFunctionIntegration} from "./numerical-integration";

export interface ArcLengthHelper {
    getArcLength(tEnd: number): number;

    getTForArcLength(arcLength: number, epsilon?: number): number;
}

function createArcLengthHelper(speed: (t: number) => number, precision: number): ArcLengthHelper {
  const alh = new NumericalFunctionIntegration(speed, precision);

  const getArcLength = (tEnd: number) =>
    alh.getIntegral(tEnd);

  const getTForArcLength = (arcLength: number, epsilon = 1e-5) =>
    alh.getTForIntegral(arcLength, epsilon);

  return {getArcLength, getTForArcLength};
}

const vectorLength = (v: number[]) => {
  let length = 0;
  for (let i = 0; i < v.length; i++)
    length += v[i] * v[i];

  return Math.sqrt(length);
};

export function createArcLengthHelperForBezier(sb: StaticBezier<number, number>, precision = 1000): ArcLengthHelper {
  const speed = (t: number) => vectorLength(sb.direction(t));
  return createArcLengthHelper(speed, precision);
}

export function createArcLengthHelperForOffsetBezier(sb: StaticBezier<2, 2> | StaticBezier<3, 2> | StaticBezier<4, 2>, offset: number, precision = 1000): ArcLengthHelper {
  const speed = (t: number) => vectorLength(sb.offsetDirection(t, offset));
  return createArcLengthHelper(speed, precision);
}
