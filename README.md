# nd-bezier

[![npm](https://img.shields.io/npm/v/nd-bezier.svg)](https://www.npmjs.com/package/nd-bezier)
[![GitHub issues](https://img.shields.io/github/issues/Feirell/nd-bezier.svg)](https://github.com/Feirell/nd-bezier/issues)

## overview

This package can be used to ease the use of bézier curves.

> Bézier curves are widely used in computer graphics to model smooth curves. As the curve is completely contained in the convex hull of its control points, the points can be graphically displayed and used to manipulate the curve intuitively.

*[Wikipedia: Bézier cuve](https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Applications)*

This package (in comparisment to the [bezier packae](https://www.npmjs.com/package/bezier)) provides more utility and an overall more robust api.

```javascript
const { Bezier } = require('nd-bezier');

const points = [
    [0, 2],
    [1, 1],
    [2, 0]
];

const bezier = new Bezier(points);

const point = bezier.at(0.1);

console.log('point:', point);
// point: [ 0.2, 1.8 ]

// the second argument is the 
console.log('ts for y = 0.2:', bezier.tSearch(0.2, 0)) // 0 is the dimension of the given search value
// ts for y = 0.2: [ 0.1 ]

console.log('ts for x = 1.8:', bezier.tSearch(1.8, 1)) // 1 is the dimension of the given search value
// ts for x = 1.8: [ 0.1 ]

```

Or you can use this package in a browser: 

```html
<script>
    import { Bezier } from './node_modules/nd-bezier/esm';

    // ...
</script>
```

## implementations

This package provides multiple implementations for the `at` and `t-search` function. Each has its own limitations and qualities. To create a `Bezier` with another `at` or `tSearch` function you can use the `setAtFunction` or `setTSearchFunction` or the `constructor`:

```javascript
const bezier = new Bezier(points, undefined, 'deterministic');
bezier.setAtFunction('produced-specific');
```

You could also provide your own implementation, please see the [at-tsearch-functions.ts](https://github.com/Feirell/nd-bezier/blob/master/lib/at-tsearch-functions.ts) for the interface.

### atFunction generator:

- `produced-generic`

    This generator creates really fast functions for any static combination of `grade` and `dimension` 

- `produced-specific`

    This generator creates even faster functions for a static combination of `grade`, `dimension` **AND** `points`

- `nd-cubic`

    Is able to solve all dimension cubic beziers and does not need any configuration (faster to create)

- `2d-iterativ`

    Is able to solve any 2d bezier (all points need to be a vector of the length 2) and does not need any configuration (faster to create)

- `nd-iterativ`

    Is able to solve any given bezier and does not need any configuration (faster to create)

### tSerachFunction generator: 

- `deterministic`

    Is defined for `linear`, `quadratic` and `cubic` bezier curves and returns all possible solutions in `O(1)`.

- `binary-search`

    Is defined for all `injective` (use `Bezier.prototype.isInjective(dimension)` to check wether or not it is injective) t -> x relations (the given `x` can be calculated by only one `t`), if the bezier curve described by the given points is not `injective` the behavior of the function is not defined.

## speed testing

If you want to contribute to this repository or just want to speed test this library, you can use the package command `speed`:

```javascript
npm run speed
```

executes the JavaScript file test-speed.js which speed tests all implemented algorithm but it also can be configured to test specific algorithm:

`npm run speed --at=nd` for example would only test all algorithm which contain the string nd, the string after the `=` is interpreted as a regular expression. You can skip a group (create-at / at / t-search) like this: `npm run speed --at=none`. Every string passed without the `--xx=` prefix is assumed to be a general filter. So, `npm run speed --at=nd 2` would test all algorithm which match `/2/` and additionally add all algorithm matching `nd` in the `at` group.
Some old speed test results can be found in the speed-results.md located in the tests directory.
