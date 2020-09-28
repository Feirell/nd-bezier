const assert = require('assert');

const {
    StaticBezier,
} = require('..');

function inRange(is, should, range = 1e-5) {
    if (!isFinite(is))
        assert.fail(is + ' is not finite');

    if (!(Math.abs(is - should) <= range))
        assert.fail('' + is + ' is not in the range of ' + should + ' is off by ' + (Math.abs(is - should) - range));
}

function inRangeArr(is, should, range = 1e-5) {
    if (!Array.isArray(is))
        assert.fail(is + ' is not an array');

    if (is.length !== should.length)
        assert.fail('the array has not the desired length ' + should.length + ' but ' + is.length);

    for (let i = 0; i < is.length; i++)
        inRange(is[i], should[i], range);
}

function oneInRange(isses, should, range = 1e-5) {
    for (const is of isses)
        try {
            inRange(is, should, range);
            return;
        } catch (e) {
        }

    assert.fail('[' + isses + '] is not in the range of ' + should);
}

describe('Bezier', () => {
    const holdingPointVariations = [
        {
            holdingPoint: [[0, 2], [1, 1], [2, 0]],
            solutions: [{
                dimension: 1,
                xValue: 1.8,
                tValue: 0.1
            }]
        },
        {
            holdingPoint: [[0, 0], [2, 1]],
            solutions: [{
                dimension: 0,
                xValue: 1,
                tValue: 0.5
            }]
        }, {
            holdingPoint: [[0, 0], [0, 1], [1, 1]],
            solutions: [{
                dimension: 0,
                xValue: 0.25,
                tValue: 0.5
            }]
        }, {
            holdingPoint: [[0, 0], [1, 0], [0, 1], [1, 1]],
            solutions: [{
                dimension: 0,
                xValue: 0.468,
                tValue: 0.3
            }]
        }];

    describe('StaticBezier at', () => {
        const quadratic = holdingPointVariations[3];

        const bezier = new StaticBezier(quadratic.holdingPoint);

        it('bezier.at(0.3) ≈ [0.468, 0.216]', () => {
            const res = bezier.at(0.3);
            inRangeArr(res, [0.468, 0.216]);
        });

        it('bezier.at(0) ≈ [0, 0]', () => {
            const res = bezier.at(0);
            inRangeArr(res, [0, 0]);
        });

        it('bezier.at(1) ≈ [1, 1]', () => {
            const res = bezier.at(1);
            inRangeArr(res, [1, 1]);
        });
    })

    describe('StaticBezier tSearch', () => {

        for (const {holdingPoint, solutions} of holdingPointVariations) {
            const bezier = new StaticBezier(holdingPoint);

            for (const {xValue, dimension, tValue} of solutions)
                it('bezier.tSearch(' + xValue + ', ' + dimension + ') ≈ ' + tValue, () => {
                    const res = bezier.tSearch(xValue, dimension);
                    oneInRange(res, tValue, 1e-4);
                });

        }
    });
});