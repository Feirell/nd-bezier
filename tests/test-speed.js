const Benchmark = require('benchmark');
const formatter = require('benchmark-suite-formatter');

const {
    Bezier,
    CubicBezier,
    NDBezier,
    ProducedBezier
} = require('../'); // since an directory with an package.json is an package

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


// 425,000,000 hz with one core
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

// const t = 3;

// const functionCache = [];

// function getFunc(a, b) {
//     return () => {};
// if (functionCache[a] != undefined) {
//     if (functionCache[a][b] != undefined)
//         return functionCache[a][b];
// } else {
//     functionCache[a] = [];
// }


// return functionCache[a][b] = (e) => {
//     return 'dddd' + e;
// };
// }

// function getFunction() {
//     return () => {};
// }

// const getArrow = () => {
//     return () => {};
// };

// class TestClass {
//     constructor(v) {
//         if (v)
//             this.methode = getFunction();
//         else
//             this.methode = getArrow();
//     }
// }

// let k = 0;
// const tests = {
//     // 'with function': () => {
//     //     new TestClass(true)
//     // },
//     // 'with arrow': () => {
//     //     new TestClass(false)
//     // }

//     '1e5': () => {
//         let i = 1e7;

//         while (i-- > 0) Math.random();
//     },
//     '1e2': () => {
//         let i = 1e2;
//         if (((k++) % 2) == 0) {
//             i = 1e7;
//             // console.log('pushed i')
//         }
//         // else console.log('did not pushed i')


//         while (i-- > 0) Math.random();
//     }
// }

// const creationSuite = createAndRunSuite(tests, str => {
//     // console.clear();
//     console.log(str);
// })

// creationSuite.run({
//     'async': true
// });



// creationSuite.on('complete', () => {
//     console.log('k', k)
//     console.log(creationSuite.map(b => ({
//         name: b.name,
//         samples: b.stats.sample
//     })));
// })