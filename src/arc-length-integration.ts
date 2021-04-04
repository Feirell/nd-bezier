import {StaticBezier} from "./static-bezier";
import {vectorLength} from "./arc-length-sub-sections";

//@ts-ignore
import integral from 'sm-integral';

export function arcLengthIntegration(sb: StaticBezier<any, any>, tStart: number, tEnd: number, e: number = 18) {
    // inspired by:
    // https://github.com/davideberly/GeometricTools/blob/master/GTE/Mathematics/ParametricCurve.h#L147-L206
    const f = (t: number) =>
        vectorLength(sb.direction(t));

    return integral.integrate(f, tStart, tEnd, e);
}
