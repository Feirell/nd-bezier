const {measure, speed, defaultTestRunner} = require('performance-test-runner');
const {printSuiteState} = require('performance-test-runner/lib/suite-console-printer');

const quadratic = require('bezier').prepare(4);

const {
    Bezier,
    StaticBezier,
    AT_FUNCTIONS_NAMES,
    TSEARCH_FUNCTIONS_NAMES
} = require('../'); // since an directory with an package.json is an package

let availableTSearchNames = [...TSEARCH_FUNCTIONS_NAMES, 'StaticBezier', 'bezier'];
let availableAtNames = [...AT_FUNCTIONS_NAMES, 'StaticBezier', 'bezier'];

const points = [
    [1, 5],
    [2, 6],
    [3, 7],
    [4, 8]
];

global.require = require;

const arrayCopy = (inst, off = 0) => Array.prototype.slice.call(inst, off);
const args = arrayCopy(process.argv, 2);


// measure('create at', () => {
//     for (const name of availableAtNames)
//         if (name == 'bezier') {
//             // there is no creation
//         } else if (name == 'StaticBezier')
//             speed(name, () => {
//                 new StaticBezier(points)
//             })
//         else
//             speed(name, () => {
//                 (new Bezier(points, name)).at(0)
//             })
// });

measure('at', () => {
    const xS = points.map(p => p[0]);
    const yS = points.map(p => p[1]);

    let i = 0;

    for (const name of availableAtNames)
        if (name == 'bezier') {
            speed('bezier', () => {
                if (++i == 11)
                    i = 0;

                const v = i / 10;

                quadratic(xS, v);
                quadratic(yS, v);
            })
        } else if (name == 'StaticBezier') {
            const sb = new StaticBezier(points);
            speed(name, () => {
                if (++i == 11)
                    i = 0;

                const v = i / 10;

                sb.at(v);
            })
        } else {
            // const instance = new Bezier(points, name);
            speed(name, () => {
                instance.at(v)
            })
        }
});

measure('t-search', name => {
    for (const name of availableTSearchNames)
        if (name == 'bezier') {

        } else if (name == 'StaticBezier') {
            const sb = new StaticBezier(points);
            speed(name, () => {
                sb.tSearch(1.9, 0)
            }) // ≈ 0.3
        } else {
            const instance = new Bezier(points, undefined, name);
            speed(name, () => {
                instance.tSearch(1.9, 0)
            }) // ≈ 0.3
        }
});

// TODO: reimplement runnable test selection

// const matcher = /--([a-z-]+)=(.+)/;
//
// for (let arg of args) {
//     const m = matcher.exec(arg);
//
//     if (m == null) {
//         for (let group of TestGroup.getAllGroups())
//             group.addFilterString(arg);
//     } else {
//         let group = TestGroup.getGroupByName(m[1]);
//         if (group) {
//             group.addFilterString(m[2]);
//         }
//     }
// }

// TestGroup.testAllGroups(true);

(async () => {
    const firstLogger = printSuiteState(defaultTestRunner, {printOnCycle: true, framerate: 30});
    await defaultTestRunner.runSuite();
    await firstLogger;
})()
    .catch(err => {
        let actualError = err;
        if (err.type == 'error')
            actualError = err.message;

        console.error(actualError);
        process.exit(1);
    });