import {defaultTestRunner, measure, speed} from "performance-test-runner";
import {runAndReport} from "performance-test-runner/lib/suite-console-printer";

//@ts-ignore
import bezier from "bezier";
import {StaticBezier} from "../src/static-bezier";
import {generateBezier} from "./generate-bezier";

const SB = StaticBezier;

const instance = generateBezier(3, 2);
const points = instance.getPoints();


const variations: [string, StaticBezier<any, any>][] = [
    // ['old StaticBezier', new OSB(points)],
    // ['DynamicBezier', new NewDynamicBezier(points)],
    ['StaticBezier', instance],
];

measure('create', () => {
    const b = bezier;
    measure('bezier', () => {
        speed('just prepare', {b}, () => {
            b.prepare(3);
        });

        const xs = points.map(v => v[0]);
        const ys = points.map(v => v[1]);
        speed('with at call', {b, xs, ys}, () => {
            const prep = b.prepare(3);
            prep(xs, .3);
            prep(ys, .3);
        });
    });

    // measure('old StaticBezier', () => {
    //     speed('just prepare', {OldStaticBezier, points}, () => {
    //         new OldStaticBezier(points);
    //     });
    //
    //     speed('with at call', {OldStaticBezier, points}, () => {
    //         const inst = new OldStaticBezier(points);
    //         inst.at(.3);
    //     });
    // });

    measure('StaticBezier', () => {
        speed('just prepare', {SB, points}, () => {
            new SB(points);
        });

        speed('with at call', {SB, points}, () => {
            const inst = new SB(points);
            inst.at(.3);
        });
    });

    // measure('DynamicBezier', () => {
    //     speed('one time generation', {gdb}, () => {
    //         gdb(4, 2);
    //     });
    //
    //     speed('just prepare', {NewDynamicBezier, points}, () => {
    //         new NewDynamicBezier(points);
    //     });
    //
    //     speed('with at call', {NewDynamicBezier, points}, () => {
    //         const inst = new NewDynamicBezier(points);
    //         inst.at(.3);
    //     });
    // });
});

measure('at', () => {
    let c = {i: 0};

    const xS = points.map(p => p[0]);
    const yS = points.map(p => p[1]);
    const quadratic = bezier.prepare(4);

    speed('bezier', {c, xS, yS, quadratic}, () => {
        if (++c.i == 11)
            c.i = 0;

        const v = c.i / 10;

        quadratic(xS, v);
        quadratic(yS, v);
    });


    for (const [name, instance] of variations) {
        speed(name, {c, instance}, () => {
            if (++c.i == 11)
                c.i = 0;

            const v = c.i / 10;

            instance.at(v);
        });
    }
});


measure('findTs', () => {
    let c = {d: 0, i: 0};
    for (const [name, instance] of variations) {
        const values = new Array(11).fill([0, 0]).map((v, i) => instance.at(i / 10));

        speed(name, {c, instance, values}, () => {
            if (++c.i == 11)
                c.i = 0;

            if (++c.d == 2)
                c.d = 0;

            instance.findTs(c.d, values[c.i][c.d]);
        });
    }
});


measure('direction', () => {
    let c = {i: 0};

    for (const [name, instance] of variations) {
        speed(name, {c, instance}, () => {
            if (++c.i == 2)
                c.i = 0;

            instance.direction(c.i / 10);
        });
    }
});

measure('offset point', () => {
    let c = {i: 0};

    for (const [name, instance] of variations) {
        speed(name, {c, instance}, () => {
            if (++c.i == 2)
                c.i = 0;

            instance.offsetPointLeft(c.i / 10, 100);
        });
    }
});

measure('nearestTs', () => {
    const testPoints = [
        [0, 0],
        [5, 5],
        [0, 5],
        [5, 0]
    ]

    let c = {i: 0};

    for (const [name, instance] of variations) {
        speed(name, {c, instance, testPoints}, () => {
            if (++c.i == 4)
                c.i = 0;

            instance.nearestTs(testPoints[c.i]);
        });
    }
});

measure('arcLength', () => {
    let c = {i: 0};

    for (const [name, instance] of variations) {
        speed(name, {c, instance}, () => {
            if (++c.i == 10)
                c.i = 0;

            const d = c.i / 10 * .4;
            const start = d;
            const end = .6 + d;

            instance.arcLength(start, end);
        });
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
