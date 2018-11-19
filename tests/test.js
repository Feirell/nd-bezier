const assert = require('assert');

const {
    Bezier,
    AT_FUNCTIONS_NAMES,
    TSEARCH_FUNCTIONS_NAMES
} = require('..');

function inRange(is, should, range = 1e-5) {
    if (!(Math.abs(is - should) <= range))
        assert.fail('' + is + ' is not in the range of ' + should + ' is off by ' + (Math.abs(is - should) - range));
}

describe('Bezier', function () {
    const arr = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const arrStr = JSON.stringify(arr);

    for (let name of AT_FUNCTIONS_NAMES) {
        describe('Bezier with atFunction "' + name + '"', function () {
            let bezier;

            it('new Bezier(' + arrStr + ', "' + name + '") instanceof Bezier', function () {
                bezier = new Bezier(arr, name);
                assert(bezier instanceof Bezier);
            });

            it('bezier.at(0.3) ≈ [0.468, 0.216]', function () {
                const res = bezier.at(0.3);
                inRange(res[0], 0.468);
                inRange(res[1], 0.216);
            });

            it('bezier.at(0) ≈ [0, 0]', function () {
                const res = bezier.at(0);
                inRange(res[0], 0);
                inRange(res[1], 0);
            });

            it('bezier.at(1) ≈ [1, 1]', function () {
                const res = bezier.at(1);
                inRange(res[0], 1);
                inRange(res[1], 1);
            });
        });
    }

    for (let name of TSEARCH_FUNCTIONS_NAMES) {
        describe('Bezier with tSearchFunction "' + name + '"', function () {
            let bezier;

            it('new Bezier(' + arrStr + ', undefined, "' + name + '") instanceof Bezier', function () {
                bezier = new Bezier(arr, undefined, name);
                assert(bezier instanceof Bezier);
            });

            it('bezier.tSearch(0.468, 0) ≈ 0.3', function () {
                const res = bezier.tSearch(0.468, 0);
                inRange(res, 0.3, 1e-4);
            });
        });
    }
});