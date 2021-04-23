import {measure, speed} from "performance-test-runner";
import {runAndReport} from "performance-test-runner/lib/suite-console-printer";
import {generateBezier} from "./generate-bezier";
import {createArcLengthHelperForBezier} from "../src/arc-length-helper";

const e = 4;
const steps = 20;

console.log('value check');
for (let dimension = 2; dimension < 5; dimension++) {
    console.group('dimension ' + dimension);
    for (let grade = 2; grade < 4; grade++) {
        const sb = generateBezier(grade, dimension);
        const alh = createArcLengthHelperForBezier(sb);
        console.log('points: ' + JSON.stringify(sb.getPoints()));
        console.group('grade ' + grade);
        for (let v = 0; v <= 3; v++) {
            const start = 0;
            const end = (v + 1) / 4;
            console.group('t: [' + start + ', ' + end + ']');

            const ad = alh.getArcLength(end) - alh.getArcLength(start);
            console.log('arc length helper', ad);

            const al = sb.arcLength(start, end);
            console.log('arcLength   ', al);

            console.groupEnd();
            // console.log(fmr.format(100 * Math.abs(1 - ad / cd)) + '% off the actual value: ' + (Math.abs(ad - cd)));
        }
        console.groupEnd();
    }
    console.groupEnd();
}

const calh = createArcLengthHelperForBezier;

for (let dimension = 2; dimension < 4; dimension++)
    for (let grade = 2; grade < 4; grade++)
        measure('arc length, g: ' + grade + ' d: ' + dimension, () => {
            const sb = generateBezier(grade, dimension);
            const alh = createArcLengthHelperForBezier(sb);

            let delta = {i: 0};

            speed('arcLengthHelper', {delta, alh}, () => {
                if (++delta.i == 10)
                    delta.i = 0;

                const d = delta.i / 10 * .4;
                const start = d;
                const end = .6 + d;

                alh.getArcLength(end) - alh.getArcLength(start);
            });

            speed('arcLength', {delta, sb}, () => {
                if (++delta.i == 10)
                    delta.i = 0;

                const d = delta.i / 10 * .4;
                const start = d;
                const end = .6 + d;

                sb.arcLength(start, end);
            });
        });

runAndReport();
