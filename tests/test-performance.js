const {measure, speed, defaultTestRunner} = require('performance-test-runner');
const {runAndReport} = require('performance-test-runner/lib/suite-console-printer');

const bezier = require('bezier');
const {StaticBezier} = require('../'); // since an directory with an package.json is an package

const points = [
    [1, 5],
    [2, 6],
    [3, 7],
    [4, 8]
];

measure('create', () => {
    measure('bezier', () => {
        speed('just prepare', {bezier}, () => {
            bezier.prepare(4);
        });

        const xs = points.map(v => v[0]);
        speed('with at call', {bezier, xs}, () => {
            const prep = bezier.prepare(4);
            prep(xs, .3);
        });
    });

    measure('StaticBezier', () => {
        speed('just prepare', {StaticBezier, points}, () => {
            new StaticBezier(points);
        });

        speed('with at call', {StaticBezier, points}, () => {
            const inst = new StaticBezier(points);
            inst.at(.3);
        });
    });
});

measure('at', () => {
    let c = {i: 0};

    measure('bezier', () => {
        const xS = points.map(p => p[0]);
        const yS = points.map(p => p[1]);

        const quadratic = bezier.prepare(4);
        speed('different values', {c, xS, yS, quadratic}, () => {
            // changing the v value to get a better mean
            if (++c.i == 11)
                c.i = 0;

            const v = c.i / 10;

            quadratic(xS, v);
            quadratic(yS, v);
        })

        speed('same value', {c, xS, yS, quadratic}, () => {
            quadratic(xS, .3);
            quadratic(yS, .3);
        })
    });

    measure('StaticBezier', () => {
        const sb = new StaticBezier(points);
        speed('different values', {c, sb}, () => {
            // changing the t value to get a better mean
            if (++c.i == 11)
                c.i = 0;

            const v = c.i / 10;

            sb.at(v);
        })

        speed('same value', {c, sb}, () => {
            sb.at(.3);
        })
    });
});

measure('tSearch', () => {
    const sb = new StaticBezier(points);

    const values = new Array(11).fill([0, 0]).map((v, i) => sb.at(i / 10));

    let c = {d: 0};

    speed('different values', {c, sb, values}, () => {
        if (++c.d == 2)
            c.d = 0;

        sb.tSearch(values[c.d], c.d);
    });

    speed('same value', {sb}, () => {
        sb.tSearch(1.9, 0)
    }); // ≈ 0.3
});

measure('direction', () => {
    const sb = new StaticBezier(points);

    let c = {i: 0};

    speed('different values', {c, sb}, () => {
        if (++c.i == 2)
            c.i = 0;

        sb.direction(c.i / 10);
    });

    speed('same value', {sb}, () => {
        sb.direction(.3);
    });
});

measure('offset point', () => {
    const sb = new StaticBezier(points);

    let c = {i: 0};

    speed('different values', {c, sb}, () => {
        if (++c.i == 2)
            c.i = 0;

        sb.offsetPointLeft(c.i / 10, 100);
    });

    speed('same value', {sb}, () => {
        sb.offsetPointLeft(.3, 100);
    });
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