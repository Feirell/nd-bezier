import {NrTuple, StaticBezier} from "./bezier-definitions";

export const vectorLength = (v: number[]) => {
    let sum = 0;

    for (let i = 0; i < v.length; i++) {
        sum += v[i] * v[i];
    }

    return Math.sqrt(sum);
};

export const delta = <Tuple extends NrTuple<number>>(a: Tuple, b: Tuple): Tuple => {
    let res = new Array(a.length) as Tuple;

    for (let i = 0; i < a.length; i++)
        res[i] = b[i] - a[i];

    return res;
}

export const distance = <Tuple extends NrTuple<number>>(a: Tuple, b: Tuple): number =>
    vectorLength(delta(a, b));


export function arcLengthSubSections(sb: StaticBezier<any, any>, tStart: number, tEnd: number, sections = 10): number {
    let length = 0;

    for (let s = 0; s < sections; s++) {
        const currT = tStart + (tEnd - tStart) * s / sections;
        const nextT = tStart + (tEnd - tStart) * (s + 1) / sections;

        length += distance(sb.at(currT), sb.at(nextT));
    }

    return length;
}
