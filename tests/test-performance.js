const {measure, speed, defaultTestRunner} = require('performance-test-runner');
const {runAndReport} = require('performance-test-runner/lib/suite-console-printer');

const bezier = require('bezier');

const {StaticBezier} = require('../lib/src/static-bezier');

const {getDynamicBezier} = require('../lib/new-src/dynamic-bezier');

const {StaticBezier: NewStaticBezier} = require("../lib/new-src/static-bezier");

const points = [
    [1, 5],
    [2, 6],
    [3, 7],
    [4, 8]
];

const gdb = getDynamicBezier;

const NewDynamicBezier = gdb(4, 2);

const variations = [
    ['StaticBezier', new StaticBezier(points)],
    ['new DynamicBezier', new NewDynamicBezier(points)],
    ['new StaticBezier', new NewStaticBezier(points)],
];


measure('create', () => {
    measure('bezier', () => {
        speed('just prepare', {bezier}, () => {
            bezier.prepare(4);
        });

        const xs = points.map(v => v[0]);
        const ys = points.map(v => v[1]);
        speed('with at call', {bezier, xs, ys}, () => {
            const prep = bezier.prepare(4);
            prep(xs, .3);
            prep(ys, .3);
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

    measure('new StaticBezier', () => {
        speed('just prepare', {NewStaticBezier, points}, () => {
            new NewStaticBezier(points);
        });

        speed('with at call', {NewStaticBezier, points}, () => {
            const inst = new NewStaticBezier(points);
            inst.at(.3);
        });
    });

    measure('new DynamicBezier', () => {
        speed('one time generation', {gdb}, () => {
            gdb(4, 2);
        });

        speed('just prepare', {NewDynamicBezier, points}, () => {
            new NewDynamicBezier(points);
        });

        speed('with at call', {NewDynamicBezier, points}, () => {
            const inst = new NewDynamicBezier(points);
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

    for (const [name, instance] of variations) {
        measure(name, () => {
            speed('different values', {c, instance}, () => {
                // changing the t value to get a better mean
                if (++c.i == 11)
                    c.i = 0;

                const v = c.i / 10;

                instance.at(v);
            })

            speed('same value', {c, instance}, () => {
                instance.at(.3);
            })
        });
    }
});


measure('tSearch', () => {
    for (const [name, instance] of variations) {
        measure(name, () => {
            const values = new Array(11).fill([0, 0]).map((v, i) => instance.at(i / 10));

            let c = {d: 0, i: 0};

            speed('different values', {c, instance, values}, () => {
                if (++c.i == 11)
                    c.i = 0;

                if (++c.d == 2)
                    c.d = 0;

                instance.tSearch(c.d, values[c.i][c.d]);
            });

            speed('same value', {instance}, () => {
                instance.tSearch(0, 1.9)
            }); // ≈ 0.3
        });
    }
});


measure('direction', () => {
    for (const [name, instance] of variations) {
        measure(name, () => {
            let c = {i: 0};

            speed('different values', {c, instance}, () => {
                if (++c.i == 2)
                    c.i = 0;

                instance.direction(c.i / 10);
            });

            speed('same value', {instance}, () => {
                instance.direction(.3);
            });

        })
    }
});

measure('offset point', () => {
    for (const [name, instance] of variations) {
        measure(name, () => {
            let c = {i: 0};

            speed('different values', {c, instance}, () => {
                if (++c.i == 2)
                    c.i = 0;

                instance.offsetPointLeft(c.i / 10, 100);
            });

            speed('same value', {instance}, () => {
                instance.offsetPointLeft(.3, 100);
            });
        })
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