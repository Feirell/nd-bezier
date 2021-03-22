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

const holdingPointVariations = [
    {
        holdingPoint: [[0, 2], [1, 1], [2, 0]],
        tSearchSolutions: [{
            dimension: 1,
            xValue: 1.8,
            tValue: 0.1
        }],
        atResults: []
    },
    {
        holdingPoint: [[0, 0], [2, 1]],
        tSearchSolutions: [{
            dimension: 0,
            xValue: 1,
            tValue: 0.5
        }],
        atResults: []
    }, {
        holdingPoint: [[0, 0], [0, 1], [1, 1]],
        tSearchSolutions: [{
            dimension: 0,
            xValue: 0.25,
            tValue: 0.5
        }],
        atResults: []
    }, {
        holdingPoint: [[0, 0], [1, 0], [0, 1], [1, 1]],
        tSearchSolutions: [{
            dimension: 0,
            xValue: 0.468,
            tValue: 0.3
        }],
        atResults: [
            {
                tValue: 0.3,
                xValue: 0.468,
                yValue: 0.216
            },
            {
                tValue: 0,
                xValue: 0,
                yValue: 0
            },
            {
                tValue: 1,
                xValue: 1,
                yValue: 1
            }
        ]
    }];

describe('at', () => {
    for (const {holdingPoint, atResults} of holdingPointVariations) {
        if (atResults.length == 0)
            continue;

        describe('holding points ' + JSON.stringify(holdingPoint), () => {
            const bezier = new StaticBezier(holdingPoint);

            for (const {tValue, xValue, yValue} of atResults) {
                it('bezier.at(' + tValue + ') ≈ [' + xValue + ', ' + yValue + ']', () => {
                    const res = bezier.at(tValue);
                    inRangeArr(res, [xValue, yValue]);
                });
            }
        });
    }
});

describe('tSearch', () => {
    for (const {holdingPoint, tSearchSolutions} of holdingPointVariations) {
        const bezier = new StaticBezier(holdingPoint);

        describe('holding points ' + JSON.stringify(holdingPoint), () => {
            for (const {xValue, dimension, tValue} of tSearchSolutions)
                it('bezier.tSearch(' + xValue + ', ' + dimension + ') ≈ ' + tValue, () => {
                    const res = bezier.tSearch(dimension, xValue);
                    oneInRange(res, tValue, 1e-4);
                });
        });

    }
});