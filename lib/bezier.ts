import { AT_FUNCTIONS, TSEARCH_FUNCTIONS, AT_FUNCTIONS_NAMES, TSEARCH_FUNCTIONS_NAMES, UsableFunction, AtFunction, TSearchFunction, BezierProperties } from './at-tsearch-functions'
export { AT_FUNCTIONS_NAMES, TSEARCH_FUNCTIONS_NAMES };

export class Bezier {
    private points: null | BezierProperties = null;

    private atGenerator!: UsableFunction<AtFunction>;
    private tSearchGenerator!: UsableFunction<TSearchFunction>;

    constructor(points?: number[][], atFunctionGen: string | UsableFunction<AtFunction> = AT_FUNCTIONS_NAMES[0], tSearchFunctionGen: string | UsableFunction<TSearchFunction> = TSEARCH_FUNCTIONS_NAMES[0]) {
        if (points != null)
            this.setPoints(points);

        this.setAtFunction(atFunctionGen);
        this.setTSearchFunction(tSearchFunctionGen);
    }

    public getBezierProperties(): null | BezierProperties {
        return this.points == null ? null : {
            dimension: this.points.dimension,
            grade: this.points.grade,
            points: this.points.points
        };
    }

    public copyPoints(): number[][] | null {
        if (this.points == null)
            return null;

        const po = this.points.points;

        const copy: number[][] = <any>new Array(this.points.grade);

        for (let g = 0; g < po.length; g++) {
            const curr = po[g];
            const c = copy[g] = <any>new Array(this.points.dimension);
            for (let d = 0; d < curr[d]; d++)
                c[d] = curr[d];
        }

        return copy;
    }

    public getPoints() {
        return this.points == null ? null : this.points.points;
    }

    public getGrade() {
        return this.points == null ? null : this.points.grade;
    }

    public getDimension() {
        return this.points == null ? null : this.points.dimension;
    }

    public setPoints(points: number[][]) {
        const grade = points.length;

        if (grade <= 1)
            throw new Error('grade (points.length) needs to be > 1');

        const dimension = points[0].length;

        const pRef = this.points != null ? this.points : this.points = <any>{};

        const dimensionEqual = pRef.dimension == dimension;
        const gradeEqual = pRef.grade == grade;

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
                    pointsEqual = val == pRef.points[g][d];

                c[d] = val;
            }

            Object.freeze(c);
        }
        Object.freeze(copy);

        // checking whether the given functions should be reseted
        if (!pointsEqual) {
            if (this.atGenerator != null && this.atGenerator.shouldReset(gradeEqual, dimensionEqual, pointsEqual))
                this.at = this.atToReproduce;

            if (this.tSearchGenerator != null && this.tSearchGenerator.shouldReset(gradeEqual, dimensionEqual, pointsEqual))
                this.tSearch = this.tSearchReproduce;
        }

        pRef.dimension = dimension;
        pRef.grade = grade;
        pRef.points = copy;
    }

    public isInjective(dimension: number): boolean | undefined {
        const p = this.points;
        if (p == null)
            return undefined;

        if (dimension >= p.dimension)
            throw new Error('the given dimension ' + dimension + ' is greater than the dimension ' + (p.dimension - 1) + ' of this bezier')

        const a = p.points[0][dimension];
        const b = p.points[p.grade - 1][dimension];

        const min = a < b ? a : b;
        const max = a > b ? a : b;

        // all points have to be between the first and last point of in that dimension
        for (let g = 1; g < p.grade - 1; g++)
            if (p.points[g][dimension] < min || p.points[g][dimension] > max)
                return false;

        return true;
    }

    public at(t: number): number[] { throw new Error('no at function set'); }

    private atToReproduce(t: number): number[] {
        console.log('-> atToReproduce');
        if (this.points == null)
            throw new Error('no points are set');

        console.log('generating atFunction');
        const atFunction = this.atGenerator.generate(this);

        if (atFunction == null)
            throw new Error('can not use the given at function "' + this.atGenerator.name + '" for this bezier [grade: ' + this.points.grade + ', dimension: ' + this.points.dimension + ']');


        const boundAt = (t: number): number[] => {
            if (this.points == null)
                throw new Error('this is madness');

            const ret = atFunction(this.points, t);
            console.log('for t', t, 'at returned', ret);
            return ret;
        }

        this.at = boundAt;
        return boundAt(t);
        // return (this.at = atFunction.bind(null, this.points))(t);
    }

    public setAtFunction(generator: UsableFunction<AtFunction> | string) {
        console.log('-> setAtFunction');
        if (typeof generator == 'string')
            if (generator in AT_FUNCTIONS)
                generator = AT_FUNCTIONS[generator];
            else
                throw new Error('the name for the at function "' + generator + '" is not defined');

        if (generator == this.atGenerator)
            return;

        this.atGenerator = generator;
        this.at = this.atToReproduce;
    }

    public tSearch(value: number, dimension: number): number { throw new Error('no tSearch function set'); }

    private tSearchReproduce(value: number, dimension: number): number {
        console.log('-> tSearchReproduce');
        if (this.points == null)
            throw new Error('no points are set');

        console.log('generating tSearchFunction');
        const tSearchFunction = this.tSearchGenerator.generate(this);

        if (tSearchFunction == null)
            throw new Error('can not use the given tSearch function "' + this.tSearchGenerator.name + '" for this bezier [grade: ' + this.points.grade + ', dimension: ' + this.points.dimension + ']');

        return (this.tSearch = tSearchFunction.bind(null, this.points))(value, dimension);
    }

    public setTSearchFunction(generator: string | UsableFunction<TSearchFunction>) {
        console.log('-> setTSearchFunction');
        if (typeof generator == 'string')
            if (generator in TSEARCH_FUNCTIONS)
                generator = TSEARCH_FUNCTIONS[generator];
            else
                throw new Error('the name for the tSearch function "' + generator + '" is not defined');

        if (generator == this.tSearchGenerator)
            return;

        this.tSearchGenerator = generator;
        this.tSearch = this.tSearchReproduce;
    }
}