const assert = require('assert');

const {
    Bezier
} = require('..');

describe('Bezier', function () {
    describe('#constructor()', function () {
        it('new Bezier() throws', function () {
            assert.throws(() => new Bezier());
        });

        it('new Bezier([]) instanceof Bezier', function () {
            assert((new Bezier([])) instanceof Bezier);
        });
    });
});