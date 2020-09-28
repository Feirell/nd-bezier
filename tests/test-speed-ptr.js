const {measure, speed, defaultTestRunner} = require('performance-test-runner');
const {runAndReport} = require('performance-test-runner/lib/suite-console-printer');

const {
    Bezier,
    StaticBezier,
    AT_FUNCTIONS_NAMES,
    TSEARCH_FUNCTIONS_NAMES
} = require('../'); // since an directory with an package.json is an package

let availableTSearchNames = TSEARCH_FUNCTIONS_NAMES;
let availableAtNames = AT_FUNCTIONS_NAMES;

const points = [
    [1, 5],
    [2, 6],
    [3, 7],
    [4, 8]
];

// const arrayCopy = (inst, off = 0) => Array.prototype.slice.call(inst, off);
// const args = arrayCopy(process.argv, 2);


measure('create at', () => {
    for (const name of availableAtNames)
        speed(name, {Bezier, points, name}, () => {
            (new Bezier(points, name)).at(0)
        });

    // bezier has no creation

    speed('StaticBezier', {StaticBezier, points}, () => {
        new StaticBezier(points)
    });
});

measure('at', () => {
    let c = {i: 0};

    for (const name of availableAtNames) {
        const instance = new Bezier(points, name);
        speed(name, {instance, c}, () => {
            if (++c.i == 11)
                c.i = 0;

            const v = c.i / 10;

            instance.at(v)
        })
    }


    {
        const xS = points.map(p => p[0]);
        const yS = points.map(p => p[1]);

        const quadratic = require('bezier').prepare(4);

        speed('bezier', {c, xS, yS, quadratic}, () => {
            if (++c.i == 11)
                c.i = 0;

            const v = c.i / 10;

            quadratic(xS, v);
            quadratic(yS, v);
        })
    }


    {
        const sb = new StaticBezier(points);
        speed('StaticBezier', {c, sb}, () => {
            if (++c.i == 11)
                c.i = 0;

            const v = c.i / 10;

            sb.at(v);
        })
    }
});

measure('t-search', name => {

    for (const name of availableTSearchNames) {
        const instance = new Bezier(points, undefined, name);
        speed(name, {instance}, () => {
            instance.tSearch(1.9, 0)
        }) // ≈ 0.3
    }

    {
        const sb = new StaticBezier(points);
        speed('StaticBezier', {sb}, () => {
            sb.tSearch(1.9, 0)
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

runAndReport(defaultTestRunner);