import {ID_POINTS, IDS} from "../new-src/ids";
import {Points, StaticBezier} from "../new-src/bezier-definitions";
import {getPlaces, PointsPlaces} from "./find-points-places";

const functionId = (() => {
    const wm = new WeakMap<() => void, number>();
    let counter = 0;

    return (fnc: () => void) => {
        let ret = wm.get(fnc);
        if (ret === undefined)
            wm.set(fnc, ret = counter++);

        return ret;
    }
})();

const valueMapper = (key: string, value: any) => {
    const type = typeof value;

    if (type == "number" || type == "string")
        return value;
    else if (type == "function")
        return functionId(value);
    else if (type == "object")
        return value;
    else
        throw new Error('can not set ' + type + ' as key for cache table ' + JSON.stringify(value));
}

const DEFAULT_KEY_GENERATOR = <Keys extends any[]>(keys: Keys): string => JSON.stringify(keys, valueMapper);

export class Cache<Keys extends any[], Value> {
    private readonly backing = new Map<string, Value>();

    constructor(private readonly keyGenerator = DEFAULT_KEY_GENERATOR) {
    }

    get(keys: Keys) {
        return this.backing.get(this.keyGenerator(keys));
    }

    set(keys: Keys, value: Value) {
        return this.backing.set(this.keyGenerator(keys), value);
    }
}