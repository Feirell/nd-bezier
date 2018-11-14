const Benchmark = require('benchmark');
const formatter = require('benchmark-suite-formatter');

const {
    Bezier,
    AT_FUNCTIONS_NAMES
} = require('../'); // since an directory with an package.json is an package

const points = [
    [1, 5],
    [2, 6],
    [3, 7],
    [4, 8]
]

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


// 425,000,000 hz with one core
// testAllCLIArguments();
const creationTimings = {};
const atTimings = {};

for (let name of AT_FUNCTIONS_NAMES) {
    creationTimings[name] = () => {
        (new Bezier(points, name)).at(0);
    }

    {
        const instance = new Bezier(points, name);
        atTimings[name] = () => {
            instance.at(0.3);
        }
    }
}

const output = [
    "Creation speed\n",
    "",
    "\nAt speed\n",
    ""
]

function printOutput() {
    console.clear();
    console.log(output.join(''));
}

function logger(index, str) {
    output[index] = str;
    printOutput();
}

function logBothSuites() {
    output[1] = formatter.stringifySuite(creationSuite);
    output[3] = formatter.stringifySuite(atSuite);
    printOutput();
}

const creationSuite = createAndRunSuite(creationTimings, logger.bind(null, 1));
const atSuite = createAndRunSuite(atTimings, logger.bind(null, 3))

const timeoutID = setInterval(() => {
    logBothSuites();
}, 75);

creationSuite.on('complete', () => {
    atSuite.run({
        'async': true
    });
});

atSuite.on('complete', () => {
    clearInterval(timeoutID);
    logBothSuites();
})

creationSuite.run({
    'async': true
});
