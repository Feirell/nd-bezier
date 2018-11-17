const assert = require('assert');

const {
    Bezier,
    AT_FUNCTIONS_NAMES
} = require('..');

function inRange(is, should, range = 1e-5) {
    return Math.abs(is - should) <= range;
}

describe('Bezier', function () {
    const arr = [[1, 0], [2, 2], [1, 0], [2, 2]];
    const arrStr = JSON.stringify(arr);

    for (let name of AT_FUNCTIONS_NAMES) {
        describe('Bezier with atFunction "' + name + '"', function () {
            let bezier;

            it('new Bezier(' + arrStr + ', "' + name + '") instanceof Bezier', function () {
                bezier = new Bezier(arr, name);
                assert(bezier instanceof Bezier);
            });

            it('bezier.at(0.3) ≈ [1.468, 0.936]', function () {
                const res = bezier.at(0.3);
                assert(inRange(res[0], 1.468) && inRange(res[1], 0.936));
            });

            it('bezier.at(0) ≈ [1, 0]', function () {
                const res = bezier.at(0);
                assert(inRange(res[0], 1) && inRange(res[1], 0));
            });

            it('bezier.at(1) ≈ [2, 2]', function () {
                const res = bezier.at(1);
                assert(inRange(res[0], 2) && inRange(res[1], 2));
            });
        })
    }
});