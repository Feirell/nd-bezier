
export interface BezierProperties {
    points: number[][];
    dimension: number;
    grade: number;
}

export interface UsableFunction<T> {

    /**
     * Generates an function suitable for the given bezier, returns null if no function can be created to fit this bezier.
     * 
     * @param bezier The bezier for which this function should generate an function T
     */
    generate(bezier: any): T | null;

    /**
     * Is called when there is a change in the attributes of the bezier to see if it sould be reseted
     * 
     * @param grade was grade changed
     * @param dimension was dimension changed
     * @param points was points changed
     */
    shouldReset(grade: boolean, dimension: boolean, points: boolean): boolean;
}

export interface TSearchFunction {
    (bezierProperties: BezierProperties, value: number, dimension: number): number[]  // all solution
}
export interface AtFunction {
    (bezierProperties: BezierProperties, t: number): number[]
}