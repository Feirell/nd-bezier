import {measure, speed} from "performance-test-runner";
import {runAndReport} from "performance-test-runner/lib/suite-console-printer";
import {arcLengthSubSections} from "../src/arc-length-sub-sections";
import {arcLengthIntegration} from "../src/arc-length-integration";
import {generateBezier} from "./generate-bezier";

const e = 4;
const steps = 20;

console.log('value check');
for (let dimension = 2; dimension < 5; dimension++) {
    console.group('dimension ' + dimension);
    for (let grade = 2; grade < 4; grade++) {
        const sb = generateBezier(grade, dimension);
        console.log('points: ' + JSON.stringify(sb.getPoints()));
        console.group('grade ' + grade);
        for (let v = 0; v <= 3; v++) {
            const start = 0;
            const end = (v + 1) / 4;
            console.group('t: [' + start + ', ' + end + ']');

            const ad = arcLengthSubSections(sb, start, end, steps);
            console.log('sub sections', ad);

            const cd = arcLengthIntegration(sb, start, end, e);
            console.log('integration ', cd);

            const al = sb.arcLength(start, end);
            console.log('arcLength   ', al);

            console.groupEnd();
            // console.log(fmr.format(100 * Math.abs(1 - ad / cd)) + '% off the actual value: ' + (Math.abs(ad - cd)));
        }
        console.groupEnd();
    }
    console.groupEnd();
}

const alss = arcLengthSubSections;
const ali = arcLengthIntegration;

for (let dimension = 2; dimension < 4; dimension++)
    for (let grade = 2; grade < 4; grade++)
        measure('arc length, g: ' + grade + ' d: ' + dimension, () => {
            const sb = generateBezier(grade, dimension);

            let delta = {i: 0};

            speed('arcLengthSubSections', {delta, alss, sb, steps}, () => {
                if (++delta.i == 10)
                    delta.i = 0;

                const d = delta.i / 10 * .4;
                const start = d;
                const end = .6 + d;

                alss(sb, start, end, steps);
            });

            speed('arcLengthIntegration', {delta, ali, sb, e}, () => {
                if (++delta.i == 10)
                    delta.i = 0;

                const d = delta.i / 10 * .4;
                const start = d;
                const end = .6 + d;

                ali(sb, start, end, e);
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
