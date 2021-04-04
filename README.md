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
npm run performance
```

Feel free to add other libraries and create a pull request.

The result of the latest version (Grade 3, Dimension 2):

```text
                     ops/sec  MoE samples relative
create
  bezier
    just prepare 103,261,406 0.55      96     1.69
    with at call  61,225,847 0.57      96     1.00
  StaticBezier
    just prepare   3,326,926 0.79      82    17.67
    with at call     188,263 1.31      92     1.00
at
  bezier         120,903,064 0.58      92     1.00
  StaticBezier   365,442,491 0.23      97     3.02
findTs
  StaticBezier    10,182,662 0.48      96     1.00
direction
  StaticBezier   442,733,661 0.37      97     1.00
offset point
  StaticBezier   424,521,754 0.38      93     1.00
nearestTs
  StaticBezier     2,791,775 0.37      94     1.00
arcLength
  StaticBezier   355,560,635 0.23      97     1.00
```

> `bezier` refers to the [bezier package](https://www.npmjs.com/package/bezier), StaticBezier is the export of this package.
> The tests can be found in tests/test-performance.ts

As you can see StaticBezier is about 3 times faster than, for example, the bezier package, but this comes at the cost that the creation time is lower.
The creation time stays the same but the performance difference for the at function increases with more control points. 
So if you often need to change the control points and then calculate one or two points for this curve, then you should use another Bézier package.

If you need to calculate multiple values of the curve, or your Bézier has static control points, then the StaticBezier provides you with a faster and
more versatile alternative.

## arc length

The StaticBezier.arcLength is calculated in a closed form which allows a greatly improved performance and robustness but sadly it is also limited by the grade.
If you need to get the length of an arc for another curve with a higher grade you can use one of the two other options.

### alternatives

Since those alternatives are only approximations of the actual length you should try different settings beforehand and compare them with results of very high settings to see how much they differentiate and which settings suit your use case.

#### `arcLengthSubSections(tStart: number, tEnd: number, subSections: number = 10): number`

> `import {arcLengthSubSections} from 'nd-bezier/lib/arc-length-sub-sections'

As the name implies this function just iterates over `t` values defined by the `subSections` argument and sums the distances between those points which results in an approximation of the actual length.

#### `arcLengthIntegration(tStart: number, tEnd: number, e: number = 18): number`

> `import {arcLengthSubSections} from 'nd-bezier/lib/arc-length-sub-sections'

> To use this function you need to have the npm package [sm-integral](https://www.npmjs.com/package/sm-integral) installed

This function also calculates the return value in an iterative fashion, which means that this is an approximation too, but this approximation is based on a similar approach as the arcLength method is.
The problem why the arcLength method can not be used for all grades is that it is not trivial to calculate the underlying indefinite integral. This is overcome here by the Romberg integration algorithm,
which the needed package supplies. The parameter `e` controls the resolution for the Romberg algorithm, the higher the number the better the result. Have a look at the documentation of the `sm-integral` package for more information. 

### performance remarks

Since the alternatives are iterative and can be tuned to your desired resolution you can archive different performance results.
The results of the performance vary greatly with different parameters **and with different control points**, but order of performance does not change in perspective to the quality of the returned value.

The following results are generated with an `e` setting of 4 and `subSections` of 20 which results in usable values.

```text
                           ops/sec  MoE samples relative
arc length, g: 2 d: 2
  arcLengthSubSections     473,564 1.74      88     1.00
  arcLengthIntegration     948,399 1.19      90     2.00
  arcLength            358,696,163 0.77      92   757.44
arc length, g: 3 d: 2
  arcLengthSubSections     479,027 0.99      92     1.00
  arcLengthIntegration   2,661,313 0.88      91     5.56
  arcLength            342,891,843 0.94      93   715.81
arc length, g: 2 d: 3
  arcLengthSubSections     468,739 1.08      94     1.00
  arcLengthIntegration     889,273 1.51      92     1.90
  arcLength            357,867,169 0.83      94   763.47
arc length, g: 3 d: 3
  arcLengthSubSections     451,675 1.09      89     1.00
  arcLengthIntegration   2,498,916 1.12      91     5.53
  arcLength            330,728,946 1.08      89   732.23
```
