const { Bezier } = require('.');

const arr = [[0, 0], [1, 0], [0, 1], [1, 1]];
// const bezier = new Bezier(arr, null, 'binary-search');
const bezier = new Bezier(arr, undefined, undefined);
console.log(bezier.tSearch(0.468, 0));


// function inRange(is, should, margin) {
//     const under = is <= (should + margin);
//     const above = is >= (should - margin);
//     return under && above ? 0 : (under ? -1 : 1);
// }

// function binSearch(func, should, margin) {
//     // solution fraction
//     let c = 1; // Denominator, with c / m is the current testing value

//     let m = 2; // 1/m is the current shift in each cycle

//     let d;
//     let i = 1;
//     while ((d = inRange(func(c / m), should, margin)) != 0) {
//         console.log('tested with %4f, c: %d, m: %d', c / m, c, m);
//         c = (c << 1) - d;

//         if (m > 0 && (m << 1) < 0)
//             throw new Error('could not find the gived value');
//         i++;
//         m = m << 1;
//     }

//     return c / m;
// }

// console.log(binSearch(x => x * x, 0.3, 0.001));
// // console.log(inRange(0.1, 0.2, 0.05));