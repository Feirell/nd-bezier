const DEFAULT_KEY_GENERATOR = <Keys extends any[]>(keys: Keys): string => JSON.stringify(keys);

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