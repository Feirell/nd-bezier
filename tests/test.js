const assert = require('assert');

const {
    Bezier,
    AT_FUNCTIONS_NAMES,
    TSEARCH_FUNCTIONS_NAMES
} = require('..');

function inRange(is, should, range = 1e-5) {
    if (!isFinite(is))
        assert.fail(is + ' is not finite');

    if (!(Math.abs(is - should) <= range))
        assert.fail('' + is + ' is not in the range of ' + should + ' is off by ' + (Math.abs(is - should) - range));
}

function oneInRange(isses, should, range = 1e-5) {
    for (let is of isses)
        try {
            inRange(is, should, range);
            return;
        } catch (e) { }

    assert.fail('[' + isses + '] is not in the range of ' + should);
}

describe('Bezier', function () {
    const arrLinear = [[0, 0], [2, 1]];
    const arrLinearStr = JSON.stringify(arrLinear);

    const arrCubic = [[0, 0], [0, 1], [1, 1]];
    const arrCubicStr = JSON.stringify(arrCubic);

    const arrQuadratic = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const arrQuadraticStr = JSON.stringify(arrQuadratic);

    const arrSpecial = [[0, 2], [1, 1], [2, 0]];
    const arrSpecialStr = JSON.stringify(arrSpecial);

    const arrays = [
        {
            array: arrSpecial,
            string: arrSpecialStr,
            solution: [{
                dimension: 1,
                xValue: 1.8,
                tValue: 0.1
            }]
        },
        {
            array: arrLinear,
            string: arrLinearStr,
            solution: [{
                dimension: 0,
                xValue: 1,
                tValue: 0.5
            }]
        }, {
            array: arrCubic,
            string: arrCubicStr,
            solution: [{
                dimension: 0,
                xValue: 0.25,
                tValue: 0.5
            }]
        }, {
            array: arrQuadratic,
            string: arrQuadraticStr,
            solution: [{
                dimension: 0,
                xValue: 0.468,
                tValue: 0.3
            }]
        }];

    for (let name of AT_FUNCTIONS_NAMES) {
        describe('Bezier with atFunction "' + name + '"', function () {
            let bezier;

            it('new Bezier(' + arrQuadraticStr + ', "' + name + '") instanceof Bezier', function () {
                bezier = new Bezier(arrQuadratic, name);
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

            for (let { array, string, solution } of arrays) {
                let bezier = new Bezier(array, undefined, name);

                it('new Bezier(' + string + ', undefined, "' + name + '") instanceof Bezier', function () {
                    assert(bezier instanceof Bezier);
                });

                for (let { xValue, dimension, tValue } of solution)
                    it('bezier.tSearch(' + xValue + ', ' + dimension + ') ≈ ' + tValue, function () {
                        const res = bezier.tSearch(xValue, dimension);
                        oneInRange(res, tValue, 1e-4);
                    });
            }
        });
    }
});