const assert = require('assert');

const {
    Bezier
} = require('..');

describe('Bezier', function () {
    describe('#constructor()', function () {
        it('[]', function () {
            assert.ok((new Bezier([])) instanceof Bezier);
        });
    });
});