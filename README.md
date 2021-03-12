# nd-Bézier

[![npm](https://img.shields.io/npm/v/nd-bezier.svg)](https://www.npmjs.com/package/nd-bezier)
[![GitHub issues](https://img.shields.io/github/issues/Feirell/nd-bezier.svg)](https://github.com/Feirell/nd-bezier/issues)

This package aims to help with the usage of n-dimensional Bezièr curves. Those curves are mostly used to model paths or interpolate between values.

The difference between this package and many others is that it tries to calculate the values for the provided t as fast a possible. For example this package is about 220% (228 million to 515 million calls per second) faster than the [`bezier`](https://npmjs.org/package/bezier) package.

Additionally, this package provides the reverse operation for the Bézier `at` operation, the tSearch. This function gives you all t which satisfy the given value in a specific dimension. You can search for a value on all dimensions. This function is deterministic and defined for all Bézier curves with the degree from 2 to 4 (inclusive), which covers many use cases.

## API



### `new StaticBezier(points: number[][])`

This constructor gives you access to the following methods and is the main export. The points have to be in the first order grade and then dimension (`[[x1, y1], [x2, y2], [x3, y3], [x4, y4]]`). There is no check in place to ensure that you provided this format and that all points are actually of the same dimension.

### Methods

#### `at(t: number): number[]`

The at function is used to get the point on the Bézier curve depending on the given `t`. The `t` can be any number but should be constrained to the range [0, 1] to be in the Bézier definition. The returned array is of the same dimension as the given Bézier points.

#### `tSearch(value: number, dimension: number): number[]`

This function returns all valid `t` which produce the given `value` in that `dimension` (in most cases x == 0, y == 1, z == 2) of the specified Bézier curve. The returned t are not limited to the [0..1] range but are all real numbers.

#### `direction(t: number): number[]`

With this function you can get the direction of the Beziér curve at the specified `t`. The Result is the direction vector.

#### `offsetPointLeft(t: number, distance: number): number[]`

This function is a utility function which adds the `direction` vector in a 90° to the left of the `at` vector at the specified `t`.
The direction vector will be set to the specified length. The resulting new curve can be interpreted as an offset Beziér curve, but
be aware that this approach will fail when the curve defined by the points has a to narrow curvature. See [this example](https://feirell.github.io/offset-bezier/)
move the orange points of a and b together and see how the black lines from a morphed to d morphed collaps. Enable the "Spikes for offset bezier" in the lower right to see why this happens.

#### `offsetPointRight(t: number, distance: number): number[]`

Works the same way `offsetPointsLeft` works but adds the `direction` to the right.

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

Feel free to add other libraries and create a pull request.

The latest results:

```text
                         ops/sec  MoE samples relative
create
  bezier
    just prepare      93,675,202 1.19      88     1.42
    with at call      65,773,656 2.39      89     1.00
  StaticBezier
    just prepare     697,947,586 1.08      93 3,576.19
    with at call         195,165 2.50      87     1.00
at
  bezier
    different values  91,618,406 1.03      90     1.00
    same value       685,800,114 0.84      82     7.49
  StaticBezier
    different values 350,753,150 0.55      95     1.00
    same value       712,674,910 0.82      89     2.03
tSearch
  different values     1,162,558 1.01      87     1.00
  same value          11,074,675 0.91      90     9.53
direction
  different values   423,871,757 1.23      94     1.00
  same value         663,752,303 1.88      84     1.57
offset point
  different values   400,396,494 1.18      91     1.00
  same value         677,195,318 1.44      88     1.69
```

> `bezier` refers to the [bezier package](https://www.npmjs.com/package/bezier), StaticBezier is the export of this package.
> The tests can be found in tests/test-performance.js

As you can see StaticBezier is about 3.82 times faster than, for example, the bezier package. But this comes at the cost that the creation time is lower.
So if you often need to change the control points and then calculate one or two points for this curve, then you should use the bezier package.

If you need to calculate multiple values of the curve or your bezier has static control points, then the StaticBezier provides you with a faster and
more versatile alternative.