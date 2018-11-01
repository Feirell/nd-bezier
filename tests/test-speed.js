const Benchmark = require('benchmark');
const formatter = require('benchmark-suite-formatter');

const {
    Bezier,
    CubicBezier,
    NDBezier,
    ProducedBezier
} = require('./');

const points = [
    [1, 5],
    [2, 6],
    [3, 7],
    [4, 8]
]

// global.Bezier = Bezier;

bezier = new Bezier(points);
ndbezier = new NDBezier(points);
cubicBezier = new CubicBezier(points);
producedBezierGeneric = new ProducedBezier(points, 'generic');
producedBezierSpecific = new ProducedBezier(points, 'specific');

// to create the at Functions
producedBezierGeneric.at(0);
producedBezierSpecific.at(0);

function testAllCLIArguments() {
    const args = Array.prototype.slice.call(process.argv, 2).map(n => parseFloat(n));

    function testOutput(t) {
        console.log("t: %d => \n  Bezier:\n  %o \n  ProducedBezier Spez.:\n  %o\n  ProducedBezier Gen.:\n  %o", t, bezier.at(t), producedSpecificNDBezierSpecific.at(t), producedSpecificNDBezierGeneric.at(t));
    }

    for (let n of args)
        testOutput(n);

    process.exit();
};

function createAndRunSuite(tests, resultCallback) {
    const suite = new Benchmark.Suite();

    function wrapTest(func) {
        return function () {
            try {
                func()
            } catch (e) {
                console.error('%s threw an error\n', func.name, e);
                process.exit();
            }
        }
    }

    for (let k in tests)
        suite.add(k, wrapTest(tests[k]));

    suite.on('cycle', () => {
        resultCallback(formatter.stringifySuite(suite));
    })

    suite.on('error', (err) => console.error(err.target.compiled.toString(), err.target.error));



    resultCallback(formatter.stringifySuite(suite));
    return suite;
}

// testAllCLIArguments();

const creationTimings = {
    'ProducedBezier Generic ': () => {
        const producedBezierGeneric = new ProducedBezier(points, 'generic');
        producedBezierGeneric.at(0.3);
    },

    'ProducedBezier Specific': () => {
        const producedBezierSpecific = new ProducedBezier(points, 'specific');
        producedBezierSpecific.at(0.3);
    },

    'Bezier': () => {
        const bezier = new Bezier(points);
    },

    'ND Bezier': () => {
        const ndbezier = new NDBezier(points);
    },

    'Cubic Bezier': () => {
        const cubicBezier = new CubicBezier(points);
    }
}

const atTimings = {
    'ProducedBezier Generic ': () => {
        producedBezierGeneric.at(0.3);
    },

    'ProducedBezier Specific': () => {
        producedBezierSpecific.at(0.3);
    },

    'Bezier': () => {
        bezier.at(0.3);
    },

    'ND Bezier': () => {
        ndbezier.at(0.3);
    },

    'Cubic Bezier': () => {
        cubicBezier.at(0.3);
    }
}

const output = [
    "Creation speed\n",
    "",
    "\nAt speed\n",
    ""
]

function logger(index, str) {
    output[index] = str;
    console.clear();
    console.log(output.join(''));
}

const creationSuite = createAndRunSuite(creationTimings, logger.bind(null, 1));
const atSuite = createAndRunSuite(atTimings, logger.bind(null, 3))

creationSuite.on('complete', () => {
    atSuite.run({
        'async': true
    });
});

creationSuite.run({
    'async': true
});