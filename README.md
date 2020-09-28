# nd-Bézier

[![npm](https://img.shields.io/npm/v/nd-bezier.svg)](https://www.npmjs.com/package/nd-bezier)
[![GitHub issues](https://img.shields.io/github/issues/Feirell/nd-bezier.svg)](https://github.com/Feirell/nd-bezier/issues)

This package aims to help with the usage of n-dimensional Bezièr curves. Those curves are mostly used to model paths or interpolate between values.

The difference between this package and many others is that it tries to calculate the values for the provided t as fast a possible. For example this package is about 220% (228 million to 515 million calls per second) faster than the [`bezier`](https://npmjs.org/package/bezier) package.

Additionally, this package provides the reverse operation for the Bézier `at` operation, the tSearch. This function gives you all t which satisfy the given value in a specific dimension. You can search for a value on all dimensions. This function is deterministic and defined for all Bézier curves with the degree from 2 to 4 (inclusive), which covers many use cases.

## API

### `new StaticBezier(points: number[][])`

This constructor gives you access to the following two member methods and is the main export. The points have to be in the first order grade and then dimension (`[[x1, y1], [x2, y2], [x3, y3], [x4, y4]]`). There is no check in place to ensure that you provided this format and that all points are actually of the same dimension.

### `StaticBezier::at(t: number): number[]`

The at function is used to get the point on the Bézier curve depending on the given `t`. The `t` can be any number but should be constrained to the range [0, 1] to be in the Bézier definition. The returned array is of the same dimension as the given Bézier points.

### `StaticBezier::tSearch(value: number, dimension: number): number[]` 

This function returns all valid `t` which produce the given `value` in that `dimension` (in most cases x == 0, y == 0, z == 0) of the specified Bézier curve. The returned t are not limited to the [0..1] range but are all real numbers.

## examples

```typescript
import {StaticBezier} from "nd-bezier";

const points = [[0, 0], [1, 0], [0, 1], [1, 1]];

const b = new StaticBezier(points);
b.at(0.3) // returns [0.448, 0.216]

// 0 == first dimension == x dimension 
b.tSearch(0.468, 0) // returns [0.3]
b.tSearch(0.216, 1) // returns [ 1.448528137423857, -0.24852813742385704, 0.3 ]
```

## performance test

Since this package is meant to provide a faster option in comparision to other Bézier packages, there is a performance measuring script in place similar to the unit tests.

You can invoke this script by calling: 

```bash
npm run performance
```

Feel free to add other libraries and create a pull request
