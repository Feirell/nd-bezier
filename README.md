# nd-Bézier

[![npm](https://img.shields.io/npm/v/nd-bezier.svg)](https://www.npmjs.com/package/nd-bezier)
[![types](https://img.shields.io/npm/types/nd-bezier.svg)](https://www.npmjs.com/package/nd-bezier)
[![GitHub issues](https://img.shields.io/github/issues/Feirell/nd-bezier.svg)](https://github.com/Feirell/nd-bezier/issues)

This package aims to help with the usage of n-dimensional Bézier curves. Those curves are mostly used to model paths or to interpolate between values.

A lot of work has gone into making this package as fast as possible, have a look at the performance section.

This package also provides other utility functions such as the `findTs` which is the reverse for the `at` function as well as the `nearestTs` to find the nearest ts for a given point. 

## API

### `new StaticBezier(points: Points<Grade, Dimension>)`

This constructor gives you access to the following methods and is the main export. The points have to be in the first order grade and then dimension (`[[x1, y1], [x2, y2], [x3, y3], [x4, y4]]`). There is no check in place to ensure that you provided this format and that all points are actually of the same dimension.

### Methods

#### `at(t: number): NrTuple<Dimension>`

The at function is used to get the point on the Bézier curve depending on the given `t`. The `t` can be any number but should be constrained to the range [0, 1] to be in the Bézier definition. The returned array is of the same dimension as the given Bézier points.

#### `direction(t: number): NrTuple<Dimension>`

With this function you can get the direction of the Beziér curve at the specified `t` the Result is the direction vector.

#### `offsetPoint(t: number, distance: number): Dimension extends 2 ? NrTuple<Dimension> : never`

> Only available for Bézier with the dimensions (amount of components) 2 

This function is a utility function which adds the `direction` vector in a 90° to the left, if distance is positive or to the right if the distance is negative, of the `at` vector at the specified `t`.
The direction vector will be set to the specified length. The resulting new curve can be interpreted as an offset Beziér curve, but
be aware that this approach will fail when the curve defined by the points has a to narrow curvature. See [this example](https://feirell.github.io/offset-bezier/)
move the orange points of a and b together and see how the black lines parallel to the central curve collapse. Enable the "Spikes for offset bezier" in the lower right to see why this happens.

#### `offsetDirection(t: number, distance: number): Dimension extends 2 ? Grade extends 2 | 3 | 4 ? NrTuple<Dimension> : never : never`

> Only available for Bézier with the grade (amount of control points) 2, 3 and 4
> Only available for Bézier with the dimensions (amount of components) 2

With this function you can get the direction of the offset Beziér (defined by the offsetPoints function). This vector will be a scaled variation of the direction vector given by the `direction` method.

#### `findTs(dimension: NrRange<0, Dimension>, value: number): Grade extends 2 | 3 | 4 ? number[] : never`

> Only available for Bézier with the grade (amount of control points) 2, 3 and 4

This function returns all valid `t` which produce the given `value` in that `dimension` (in most cases x == 0, y == 1, z == 2) of the specified Bézier curve. The returned t are not limited to the [0..1] range but are all real numbers.

#### `nearestTs(point: NrTuple<Dimension>): Grade extends 2 | 3 ? number[] : never`

> Only available for Bézier with the grade (amount of control points) 2 and 3

This method returns the nearest t for the given point. Those t are not limited to the [0..1] range but are real numbers. This function returns multiple ts, since it solves the underlying polynomial.
If you only need the nearest one you can just plug those t into the at function and find the one with the lowest distance to the points given, this one will be guaranteed to be the closest one. But this function does not do this for you so you
can follow your Bézier curve more smoothly and you can pick the correct t depending on previous lookups, otherwise the t might jump unexpected when another part of the bezier is closer.

#### `split(t: number): [Points<Grade, Dimension>, Points<Grade, Dimension>]`

Splits this Bézier curve into two Bézier curves of the same dimensions with the same merged form. The first value in the return array are the control points
for the Bézier curve which goes from 0 to t and the second set describes a Bézier curve from t to 1.

#### `arcLength(tStart: number, tEnd: number): Grade extends 2 | 3? number: never`

> Only available for Bézier with the grade (amount of control points) 2 and 3

This function returns the length of the Bézier curve arc in the range from `tStart` to `tEnd`. This is not an approximation but a closed form calculation hence the limitation for grade 2 and 3.
See the section 'arc length' for further information and additional options for other grades.

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
npm run build-performance
node tests/lib/tests/test-performance.js
node tests/lib/tests/test-arc-length-performance.js
```

Feel free to add other libraries and create a pull request.

The result of the latest version (Grade 3, Dimension 2):

```text
                     ops/sec  MoE samples relative
create
  bezier
    just prepare 103,499,871 0.34      95     1.68
    with at call  61,664,485 0.19      96     1.00
  StaticBezier
    just prepare   3,584,532 0.38      90    18.57
    with at call     193,020 1.67      89     1.00
at
  bezier         124,130,718 0.14      96     1.00
  StaticBezier   360,891,167 0.19      96     2.91
findTs
  StaticBezier     9,189,329 1.23      95     1.00
direction
  StaticBezier   440,271,266 0.18      91     1.00
offset point
  StaticBezier   435,724,239 0.16      92     1.00
offset direction
  StaticBezier   420,808,509 0.13      96     1.00
nearestTs
  StaticBezier     1,724,496 0.22      95     1.00
arcLength
  StaticBezier   353,168,939 0.19      92     1.00
```

> `bezier` refers to the [bezier package](https://www.npmjs.com/package/bezier), StaticBezier is the export of this package.
> The tests can be found in tests/test-performance.ts

As you can see StaticBezier is about 3 times faster than, for example, the bezier package, but this comes at the cost that the creation time is lower.
The creation time stays the same but the performance difference for the at function increases with more control points. 
So if you often need to change the control points and then calculate one or two points for this curve, then you should use another Bézier package.

If you need to calculate multiple values of the curve, or your Bézier has static control points, then the StaticBezier provides you with a faster and
more versatile alternative.

## arc length

The `StaticBezier.arcLength` is calculated in a closed form which allows a greatly improved performance and robustness but sadly it is also limited by the grade.
If you need to get the length of an arc for another curve with a higher grade or the length of the offset curve then you can use two provided alternatives.

Those alternative also allow you to do the inverse, to find the t which is a certain arc length distance from the start.

Since those alternatives are only approximations of the actual length you should try different settings for the precision beforehand and compare them with results of very high settings to see how much they differentiate and which settings suit your use case.
Precision also changes the performance for the creation. So you need to keep a balance.

Both of the following function return a `ArcLengthHelper` which has two methods: 

### ArcLengthHelper

#### `getArcLength(tEnd: number): number`;

This function gets the arc length for the interval 0 to `tEnd`. Be aware that this is an approximation and its quality highly depend on the `precision` value.
`tEnd` will be clipped to the `[0, 1]` range, so `getArcLength(1)`, `getArcLength(1.5)` and `getArcLength(2)` will all yield the same result.

This function is not iterative and there for has no direct precision control. The performance of this function does not depend on the `precision` only the quality will change with the `precision`.

#### `getTForArcLength(arcLength: number, epsilon?: number): number`;

This function does the inverse as `getArcLength` does. It will only return values in the range of 0 to 1, even when the value is not in that range.
Check this beforehand by comparing your value with the full arc length by calling `getArcLength(1)`.

This function uses the secant root finding algorithm, and the epsilon is used to stop the iterative approximation when a threshold is reached.
The resulting t will satisfy the constraint `estArc = getTForArcLength(resultT); estArc is in range [arcLength - epsilon, arcLength + epsilon]`

### alternatives

#### `createArcLengthHelperForBezier(sb: StaticBezier<number, number>, precision: number = 1000): ArcLengthHelper`

> `import {createArcLengthHelperForBezier} from "nd-bezier/lib/arc-length-helper";`

This function creates the `ArcLengthHelper` with the given precision. If your `StaticBezier` has the grade 3 then you should just use the `arcLength` property of the `StaticBezier` itself.

#### `createArcLengthHelperForOffsetBezier(sb: StaticBezier<2, 2> | StaticBezier<3, 2> | StaticBezier<4, 2>, offset: number, precision: number = 1000): ArcLengthHelper`

> `import {createArcLengthHelperForOffsetBezier} from "nd-bezier/lib/arc-length-helper";`

This function creates the `ArcLengthHelper` with the given precision for the offset bezier, a positive offset is on the left side, a negative is on the right side.

### performance of alternatives

```text
                      ops/sec  MoE samples relative
arc length, g: 2 d: 2
  arcLengthHelper  20,150,675 0.30      92     1.00
  arcLength       368,602,633 0.13      95    18.29
arc length, g: 3 d: 2
  arcLengthHelper  20,282,408 0.18      96     1.00
  arcLength       352,131,394 0.17      97    17.36
arc length, g: 2 d: 3
  arcLengthHelper  19,968,141 0.60      93     1.00
  arcLength       367,831,490 0.19      95    18.42
arc length, g: 3 d: 3
  arcLengthHelper  20,189,512 0.29      94     1.00
  arcLength       354,856,260 0.21      96    17.58
```
