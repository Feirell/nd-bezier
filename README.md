# nd-Bézier

[![npm](https://img.shields.io/npm/v/nd-bezier.svg)](https://www.npmjs.com/package/nd-bezier)
[![GitHub issues](https://img.shields.io/github/issues/Feirell/nd-bezier.svg)](https://github.com/Feirell/nd-bezier/issues)

This package aims to help with the usage of n-dimensional Bézier curves. Those curves are mostly used to model paths or to interpolate between values.

Alot of work has gone into making this package as fast as possible, have a look at the performance section.

This package also provides other ulitity functions such as the `findTs` which is the reverse for the `at` function as well as the `nearestTs` to find the nearest ts for a given point. 

## API

### `new StaticBezier(points: Points<Grade, Dimension>)`

This constructor gives you access to the following methods and is the main export. The points have to be in the first order grade and then dimension (`[[x1, y1], [x2, y2], [x3, y3], [x4, y4]]`). There is no check in place to ensure that you provided this format and that all points are actually of the same dimension.

### Methods

#### `at(t: number): NrTuple<Dimension>`

The at function is used to get the point on the Bézier curve depending on the given `t`. The `t` can be any number but should be constrained to the range [0, 1] to be in the Bézier definition. The returned array is of the same dimension as the given Bézier points.

#### `direction(t: number): NrTuple<Dimension>`

With this function you can get the direction of the Beziér curve at the specified `t` the Result is the direction vector.

#### `offsetPointLeft(t: number, distance: number): NrTuple<Dimension>`

This function is a utility function which adds the `direction` vector in a 90° to the left of the `at` vector at the specified `t`.
The direction vector will be set to the specified length. The resulting new curve can be interpreted as an offset Beziér curve, but
be aware that this approach will fail when the curve defined by the points has a to narrow curvature. See [this example](https://feirell.github.io/offset-bezier/)
move the orange points of a and b together and see how the black lines parallel to the central curve collapse. Enable the "Spikes for offset bezier" in the lower right to see why this happens.

#### `offsetPointRight(t: number, distance: number): NrTuple<Dimension>`

Works the same way `offsetPointsLeft` works but adds the `direction` to the right.

#### `findTs(dimension: NrRange<0, Dimension>, value: number, cleanSolutions?: boolean): Grade extends 2 | 3 | 4 ? number[] : never`

> Only available for Bezier with the grade (amount of control points) 2, 3 and 4

This function returns all valid `t` which produce the given `value` in that `dimension` (in most cases x == 0, y == 1, z == 2) of the specified Bézier curve. The returned t are not limited to the [0..1] range but are all real numbers.

#### `nearestTs(point: NrTuple<Dimension>): Grade extends 2 | 3 ? number[] : never`

> Only available for Bezier with the grade (amount of control points) 2 and 3

This method returns the nearest t for the given point. Those t are not limited to the [0..1] range but are real numbers. This function returns multiple ts, since it solves the underlying polynomial.
If you only need the nearest one you can just plug those t into the at function and find the one with the lowest distance to the points given, this one will be guaranteed to be the closest one. But this function does not do this for you so you
can follow your Bézier curve more smoothly and you can pick the correct t depending on previous lookups, otherwise the t might jump unexpected when another part of the bezier is closer.

## examples

```javascript
import {StaticBezier} from "nd-bezier";

const points = [[0, 0], [1, 0], [0, 1], [1, 1]];

const b = new StaticBezier(points);

b.at(0.3) // returns [0.468, 0.216]

// 0 == first dimension, 1 == second dimension
b.findTs(0, 0.468) // returns [ 0.3 ]
b.findTs(1, 0.216) // returns [ 1.448528137423857, -0.24852813742385704, 0.3 ]
```

## performance test

Since this package is meant to provide a faster option in comparision to other Bézier packages, there is a performance measuring script in place similar to the unit tests.

You can invoke this script by calling: 

```bash
npm run performance
```

Feel free to add other libraries and create a pull request.

The result of the latest version (Grade 3, Dimension 2):

```text
                         ops/sec  MoE samples relative
create
  bezier
    just prepare      97,621,844 0.62      90     1.70
    with at call      57,584,289 0.72      89     1.00
  StaticBezier
    just prepare       3,162,669 0.53      93    17.68
    with at call         178,892 2.03      90     1.00
at
  bezier
    different values 110,662,674 0.83      90     1.00
    same value       654,401,773 0.64      95     5.91
  StaticBezier
    different values 325,996,952 2.95      93     1.00
    same value       674,542,248 0.65      94     2.07
findTs
  StaticBezier
    different values   6,264,139 1.75      89     1.00
    same value         7,322,656 1.00      88     1.17
direction
  StaticBezier
    different values 406,979,752 0.53      93     1.00
    same value       669,016,650 2.17      92     1.64
offset point
  StaticBezier
    different values 385,832,153 1.00      89     1.00
    same value       674,512,727 1.13      90     1.75
nearestT
  StaticBezier
    different values   4,463,967 0.81      91     1.00
    same value         4,673,739 1.18      88     1.05
```

> `bezier` refers to the [bezier package](https://www.npmjs.com/package/bezier), StaticBezier is the export of this package.
> The tests can be found in tests/test-performance.js

As you can see StaticBezier is about 3 times faster than, for example, the bezier package, but this comes at the cost that the creation time is lower.
The creation time stays the same but the performance difference for the at function increases with more control points. 
So if you often need to change the control points and then calculate one or two points for this curve, then you should use another Bézier package.

If you need to calculate multiple values of the curve, or your Bézier has static control points, then the StaticBezier provides you with a faster and
more versatile alternative.