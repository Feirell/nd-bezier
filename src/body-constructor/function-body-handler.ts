import {Points, StaticBezier} from "../bezier-definitions";
import {getPlaces, makeSpecific, PointsPlaces} from "./find-points-places";
import {ID_POINTS, IDS} from "../ids";

type Names = Exclude<keyof StaticBezier<number, number>, "getPoints">;
type FncDif<Grade extends number, Dimension extends number, Name extends Names> = StaticBezier<Grade, Dimension>[Name];

export class FunctionBodyHandler<Name extends Names,
    Args extends unknown[]> {

  private readonly bodyCache = new Map<string, string>();

  private dynamicFunctionCache = new Map<string, FncDif<number, number, Name>>();
  private staticFunctionCache = new Map<string, PointsPlaces>();

  constructor(
        private readonly name: Name,
        private readonly keyGen: (grade: number, dimension: number, ...args: Args) => string,
        private readonly args: IDS[],
        private readonly createBody: (grade: number, dimension: number, ...args: Args) => string,
        private readonly additionalGlobals: (grade: number, dimension: number, ...args: Args) => { internalName: string, globalValue: unknown }[] = () => [],
        private readonly insteadFunction: (grade: number, dimension: number, ...args: Args) => undefined | (() => unknown) = () => undefined
  ) {
  }

  getUnmodifiedBody<Grade extends number, Dimension extends number>(grade: Grade, dimension: Dimension, ...args: Args) {
    const key = this.keyGen(grade, dimension, ...args);

    const res = this.bodyCache.get(key);
    if (res !== undefined)
      return res;

    const body = this.createBody(grade, dimension, ...args);

    this.bodyCache.set(key, body);

    return body;
  }

  getDynamicFunction<Grade extends number, Dimension extends number>(grade: Grade, dimension: Dimension, ...args: Args): FncDif<Grade, Dimension, Name> {
    const instead = this.insteadFunction(grade, dimension, ...args);
    if (instead !== undefined)
      return instead as FncDif<Grade, Dimension, Name>;

    const key = this.keyGen(grade, dimension, ...args);
    const res = this.dynamicFunctionCache.get(key);

    if (res !== undefined)
      return res as unknown as FncDif<Grade, Dimension, Name>;

    const body = this.getUnmodifiedBody(grade, dimension, ...args);
    const resArgs = this.args.filter(n => n != ID_POINTS).join(", ");
    const additionalGlobals = this.additionalGlobals(grade, dimension, ...args);

    const fnc = Function(...additionalGlobals.map(e => "_" + e.internalName),
      additionalGlobals.map(e => "const " + e.internalName + " =  _" + e.internalName + ";\n").join("") +
            "return function " + this.name + "(" + resArgs + ") {\n" +
            "\"use strict\";\n" +
            "const points = this.points;\n" +
            body +
            "\n}"
    )(...additionalGlobals.map(e => e.globalValue)) as FncDif<Grade, Dimension, Name>;

    this.dynamicFunctionCache.set(key, fnc as never);

    return fnc;
  }

  getStaticFunction<Grade extends number, Dimension extends number>(grade: Grade, dimension: Dimension, points: Points<Grade, Dimension>, ...args: Args): FncDif<Grade, Dimension, Name> {
    const instead = this.insteadFunction(grade, dimension, ...args);
    if (instead !== undefined)
      return instead as FncDif<Grade, Dimension, Name>;

    const key = this.keyGen(grade, dimension, ...args);
    let splitBody = this.staticFunctionCache.get(key);

    if (splitBody == undefined) {
      const body = this.getUnmodifiedBody(grade, dimension, ...args);
      splitBody = getPlaces(body);
    }

    const resArgs = this.args.filter(n => n != ID_POINTS).join(", ");
    const additionalGlobals = this.additionalGlobals(grade, dimension, ...args);


    const fnc = Function(...additionalGlobals.map(e => e.internalName),
      "return function " + this.name + "(" + resArgs + ") {\n" +
            "\"use strict\";\n" +
            makeSpecific(splitBody, points) +
            "\n}"
    )(...additionalGlobals.map(e => e.globalValue)) as FncDif<Grade, Dimension, Name>;

    this.staticFunctionCache.set(key, splitBody);

    return fnc;
  }
}
