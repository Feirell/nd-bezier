import { AT_FUNCTIONS, TSEARCH_FUNCTIONS, AT_FUNCTIONS_NAMES, UsableFunction, AtFunction, TSearchFunction, BezierProperties } from './at-tserach-functions'
export { AT_FUNCTIONS_NAMES };

export class Bezier {
    private points: number[][] | null = null;
    private dimension: number | null = null;
    private grade: number | null = null;

    private atGenerator: UsableFunction<AtFunction> | null = null;
    private atFunction: AtFunction | null = null;

    private tSearchGenerator: UsableFunction<TSearchFunction> | null = null;
    private tSearchFunction: TSearchFunction | null = null;

    private bezierProperties: BezierProperties | null = null;

    constructor(points?: number[][], atFunctionGen: string | UsableFunction<AtFunction> = 'nd-iterativ', tSearchFunctionGen: string | UsableFunction<TSearchFunction> = 'ex') {
        if (points != null)
            this.setPoints(points);

        this.setAtFunction(atFunctionGen);
        this.setTSearchFunction(tSearchFunctionGen);
    }

    public copyPoints(): number[][] | null {
        const po = this.points;

        if (po == null)
            return null;

        const copy: number[][] = <any>new Array(this.grade);

        for (let g = 0; g < po.length; g++) {
            const curr = po[g];
            const c = copy[g] = <any>new Array(this.dimension);
            for (let d = 0; d < curr[d]; d++)
                c[d] = curr[d];
        }

        return copy;
    }

    public getPoints() {
        return this.points;
    }

    public getGrade() {
        return this.grade;
    }

    public getDimension() {
        return this.dimension;
    }

    public getBezierProperties(): BezierProperties | null {
        if (this.points == null || this.grade == null || this.dimension == null)
            return null;

        if (this.bezierProperties == null)
            this.bezierProperties = Object.freeze({
                points: this.points,
                dimension: this.dimension,
                grade: this.grade
            });

        return this.bezierProperties;
    }

    public setPoints(points: number[][]) {
        const grade = points.length;

        if (grade <= 1)
            throw new Error('grade (points.length) needs to be > 1');

        const dimension = points[0].length;

        const dimensionEqual = this.dimension == dimension;
        const gradeEqual = this.grade == grade;
        let pointsEqual = dimensionEqual && gradeEqual;

        const copy = new Array(grade);
        for (let g = 0; g < grade; g++) {
            const curr = points[g];
            const c = copy[g] = new Array(dimension);
            for (let d = 0; d < dimension; d++) {
                const val = curr[d];
                if (!isFinite(val))
                    throw new TypeError('setPoints was called with an points structure which did not fit into the specification: points[' + g + '][' + d + '] = ' + val + ' which is not finite');

                if (pointsEqual)
                    pointsEqual = val == (<any>this.points)[g][d]; // have to convince typscript that this.points is not null (if points equal is true the check above succeeded)

                c[d] = val;
            }

            Object.freeze(c);
        }
        Object.freeze(copy);

        // checking whether the given functions should be reseted
        if (!pointsEqual) {
            this.bezierProperties = null;

            if (this.atGenerator != null && this.atFunction != null && this.atGenerator.shouldReset(gradeEqual, dimensionEqual, pointsEqual))
                this.atFunction = null;

            if (this.tSearchGenerator != null && this.tSearchFunction != null && this.tSearchGenerator.shouldReset(gradeEqual, dimensionEqual, pointsEqual))
                this.tSearchFunction = null;
        }

        this.dimension = dimension;
        this.grade = grade;
        this.points = copy;
    }

    public isInjective(dimension: number): boolean | undefined {
        if (this.points == null)
            return undefined;

        if (dimension > (<any>this.dimension) - 1)
            throw new Error('the given dimension ' + dimension + ' is greater than the dimension ' + this.dimension + ' of this bezier')

        let prev = this.points[0][dimension];
        for (let g = 1; g < (<any>this.grade); g++)
            if (this.points[g][dimension] <= prev)
                return false;
            else
                prev = this.points[g][dimension];

        return true;
    }

    public at(t: number): number[] {
        // (<UsableFunction<AtFunction>><any>this.atGenerator) is used to tell typscript that this.atGenerator will not be null (since the constructor sets it)

        if (this.atFunction == null) {
            this.atFunction = (<UsableFunction<AtFunction>><any>this.atGenerator).generate(this);

            if (this.atFunction == null)
                throw new Error('can not use the given at function "' + (<UsableFunction<AtFunction>><any>this.atGenerator).name + '" for this bezier [grade: ' + this.grade + ', dimension: ' + this.dimension + ']');
        }

        const props = this.getBezierProperties();
        if (props == null)
            throw new Error('no points are set');

        return this.atFunction(props, t);
    }

    public setAtFunction(generator: UsableFunction<AtFunction> | string) {
        if (typeof generator == 'string')
            if (generator in AT_FUNCTIONS)
                generator = AT_FUNCTIONS[generator];
            else
                throw new Error('the name for the at function "' + generator + '" is not defined');

        if (generator == this.atGenerator)
            return;

        this.atGenerator = generator;
        this.atFunction = null;
    }

    public tSearch(value: number, dimension: number): number {
        // (<UsableFunction<AtFunction>><any>this.atGenerator) is used to tell typscript that this.atGenerator will not be null (since the constructor sets it)

        if (this.tSearchFunction == null) {
            this.tSearchFunction = (<UsableFunction<TSearchFunction>><any>this.tSearchGenerator).generate(this);

            if (this.tSearchFunction == null)
                throw new Error('can not use the given tSearch function "' + (<UsableFunction<TSearchFunction>><any>this.tSearchGenerator).name + '" for this bezier [grade: ' + this.grade + ', dimension: ' + this.dimension + ']');
        }

        const props = this.getBezierProperties();
        if (props == null)
            throw new Error('no points are set');

        return this.tSearchFunction(props, value, dimension);
    }

    public setTSearchFunction(generator: string | UsableFunction<TSearchFunction>) {
        if (typeof generator == 'string')
            if (generator in TSEARCH_FUNCTIONS)
                generator = TSEARCH_FUNCTIONS[generator];
            else
                throw new Error('the name for the tSearch function "' + generator + '" is not defined');

        if (generator == this.tSearchGenerator)
            return;

        this.tSearchGenerator = generator;
        this.tSearchFunction = null;
    }
}