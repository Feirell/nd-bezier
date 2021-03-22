import {
    ID_DISTANCE,
    ID_T,
    produceGenericAt,
    produceGenericDerived,
    produceGenericOffsetAt
} from "./produce-generic";
import {getPlaces} from "./find-points-places";

interface SpecificAtFunction {
    (t: number): number[]
}

function makeSpecific(body: string, points: number[][]) {
    const places = getPlaces(body);

    let newFuncBody = "";
    for (let i = 0; i < places.length; i++) {
        // every even element is a string which separates two occurrences of point[p][d]
        if (i % 2 == 0) {
            newFuncBody += places[i] as string;
        } else { // every odd one is an object which has to be replaced by the numeric value in points[p][d] (the function argument)
            const para = places[i] as { point: number, dimension: number };
            newFuncBody += '' + points[para.point][para.dimension];
        }
    }

    return newFuncBody;
}

export function produceSpecificAtFunction(points: number[][]) {
    const grade = points.length;
    const dimension = points[0].length;

    // the generic function is the base for the specific one
    const generic = produceGenericAt(grade, dimension);

    const body = generic.body;

    const specificBody = makeSpecific(body, points);

    return Function(ID_T, specificBody) as SpecificAtFunction;
}

export function produceSpecificDerivedFunction(points: number[][]) {
    const grade = points.length;
    const dimension = points[0].length;

    // the generic function is the base for the specific one
    const generic = produceGenericDerived(grade, dimension);

    const body = generic.body;

    const specificBody = makeSpecific(body, points);

    return Function(ID_T, specificBody) as SpecificAtFunction;
}

export function produceSpecificOffsetAtFunction(points: number[][], matrix: number[][]) {
    const grade = points.length;
    const dimension = points[0].length;

    // the generic function is the base for the specific one
    const generic = produceGenericOffsetAt(grade, dimension, matrix);

    const body = generic.body;

    const specificBody = makeSpecific(body, points);

    return Function(ID_T, ID_DISTANCE, specificBody) as SpecificAtFunction;
}