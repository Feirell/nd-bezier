# nd-bezier

`nd-bezier` is module which eases the use of bezier curves.

## `new Bezier(points, atFunction, tSerachFunction)`

### atFunction:

- `produced-generic`

    This generator is able to create really fast functions for any static combination of `grade` and `dimension` 

- `produced-specific`

    This generator is even faster and creates functions for a static combination of `grade`, `dimension` **AND** `points`

- `nd-cubic`

    Is able to solve all dimension cubic beziers and does not need any configuration (about no creation time)

- `2d-iterativ`

    Is able to solve any 2d bezier (all points need to be a vector of the length 2) and does not need any configuration (about no creation time)

- `nd-iterativ`

    Is able to solve any given bezier and does not need any configuration (about no creation time)

### tSerachFunction

- `deterministic`

    is defined for `linear`, `quadratic` and `cubic` bezier curves and returns all possible solutions.

- `binary-search`

    is defined for all `injective` t -> x relations (the given `x` can be calculated by one `t`), if the bezier curve described by the given points is not `injective` this function will not return and might break the script

## speed testing

If you want to contribute to this repository or just want to speed test this library you can use the package command `speed`:

`yarn speed` executes the JavaScript file test-speed.js which is speed tests all implemented algorithem.
It also can be configured to just test some specific algorithem:

`yarn speed --at=nd` would just test all algorithem which contain the string `nd`, the string after the `=` is interpreted as an regular expression.
If you want to skip a group (`cerate` or `at`) you can pass the argument like this `yarn speed --at=none`.
Every string passed without the `--xx=` prefix is assumed to be an general filter. So `yarn speed --at=nd 2` would test all algorithem which match `/2/` and additonaly add all algorithem matching `nd` in the `at` group.