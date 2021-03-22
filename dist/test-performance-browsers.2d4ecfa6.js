// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/math-functions.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bc = exports.factorial = void 0;

exports.factorial = function () {
  const factorialCache = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000];
  /**
   * Calculates n!
   * @param n
   */

  function factorial(n) {
    return factorialCache[n];
  }

  return factorial;
}();

exports.bc = function () {
  const bcCache = [];
  /**
   * Calculates the binomial coefficient for n over k
   * @param n
   * @param k
   */

  function bc(n, k) {
    if (k > n / 2) k = n - k;
    if (k == 0) return 1;
    if (k == 1) return n;
    return bcCache[n][k];
  } // building up cache


  for (let n = 0; n <= 15; n++) {
    bcCache[n] = [];

    for (let k = 0; k <= Math.ceil(n / 2); k++) {
      bcCache[n][k] = exports.factorial(n) / (exports.factorial(k) * exports.factorial(n - k));
    }
  }

  return bc;
}();
},{}],"src/cache.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cache = void 0;

const DEFAULT_KEY_GENERATOR = keys => JSON.stringify(keys);

class Cache {
  constructor(keyGenerator = DEFAULT_KEY_GENERATOR) {
    this.keyGenerator = keyGenerator;
    this.backing = new Map();
  }

  get(keys) {
    return this.backing.get(this.keyGenerator(keys));
  }

  set(keys, value) {
    return this.backing.set(this.keyGenerator(keys), value);
  }

}

exports.Cache = Cache;
},{}],"src/produce-generic.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.produceGenericOffsetAt = exports.produceGenericDerived = exports.produceGenericAt = exports.assembleBezierFunction = exports.ID_POINTS = exports.ID_DISTANCE = exports.ID_ONE_MINUS_T = exports.ID_T = void 0;

const math_functions_1 = require("./math-functions");

const cache_1 = require("./cache");

exports.ID_T = 't';
exports.ID_ONE_MINUS_T = 'oneMinusT';
exports.ID_DISTANCE = 'distance';
exports.ID_POINTS = 'points';

function exp(identifier, exp) {
  if (exp == 0) return '1';
  let res = "";
  const expAbs = exp < 0 ? -exp : exp;

  for (let e = 0; e < expAbs; e++) {
    res += identifier;
    if (e < exp - 1) res += ' * ';
  }

  if (exp < 0) res = "1 / (" + identifier + ")";
  return res;
}
/**
 * creates a * t ^ b * (1 - t) ^ c string
 *
 * @param a
 * @param b
 * @param c
 * @constructor
 */


function bezierMultiplier(a, b, c) {
  let ret = '';

  if (a != 0) {
    ret += a;
    if (b != 0) ret += ' * ' + exp(exports.ID_T, b);
    if (c != 0) ret += ' * ' + exp(exports.ID_ONE_MINUS_T, c);
  }

  return ret.length == 0 ? '0' : ret;
}
/**
 * K derived:   a * b * t ^ (b - 1) * (1 - t) ^ c
 *            - a * c * t ^ b * (1 - t) ^ (c - 1)
 *
 * @param a
 * @param b
 * @param c
 * @constructor
 */


function bezierMultiplierDerived(a, b, c) {
  let ret = '';

  if (a * b != 0) {
    ret += a * b;
    if (b - 1 != 0) ret += ' * ' + exp(exports.ID_T, b - 1);
    if (c != 0) ret += ' * ' + exp(exports.ID_ONE_MINUS_T, c);
  }

  if (a * c != 0) {
    ret += ret.length == 0 ? '' : ' ';
    ret += '- ' + a * c;
    if (b != 0) ret += ' * ' + exp(exports.ID_T, b);
    if (c - 1 != 0) ret += ' * ' + exp(exports.ID_ONE_MINUS_T, c - 1);
  }

  return ret.length == 0 ? '0' : ret;
}

function produceMultiplierAndComponents(grade, dimension, name, multiplierFunction) {
  let res = '';

  for (let g = 0; g <= grade; g++) {
    res += "const " + "m" + name + g + " = " + multiplierFunction(math_functions_1.bc(grade, g), g, grade - g) + ";\n";
  }

  res += '\n';

  for (let d = 0; d < dimension; d++) {
    res += "const " + "c" + name + d + " = ";

    for (let g = 0; g <= grade; g++) {
      res += "m" + name + g + " * " + exports.ID_POINTS + "[" + g + "][" + d + "]";

      if (g < grade) {
        res += " + ";
      } else {
        res += ";\n";
      }
    }
  }

  return res;
}

const cache = new cache_1.Cache();
/**
 * This function generates an general at function which is usable for this specific combination of grade and dimension.
 */

function assembleBezierFunction(kFunction, grade, dimension) {
  grade = grade - 1;
  const cacheItem = cache.get([kFunction, grade, dimension]);
  if (cacheItem) return Object.assign({}, cacheItem);
  const base = produceMultiplierAndComponents(grade, dimension, 'b'
  /* for base */
  , bezierMultiplier);
  let pointSumConcat = "";

  for (let i = 0; i < dimension; i++) {
    pointSumConcat += "    cb" + i;
    if (i < dimension - 1) pointSumConcat += ",\n";else pointSumConcat += "\n";
  }

  const body = "\"use strict\";\n" + "\n" + "const " + exports.ID_ONE_MINUS_T + " = 1 - " + exports.ID_T + ";\n" + base + "\n" + "return [\n" + pointSumConcat + "];";
  const func = new Function(exports.ID_POINTS, exports.ID_T, body);
  cache.set([kFunction, grade, dimension], {
    body,
    func
  });
  return {
    body,
    func
  };
}

exports.assembleBezierFunction = assembleBezierFunction;
const distantCache = new cache_1.Cache();
/**
 * Matrix defines how the directional vector (from the first derivative) is applies to the point vector from the bezier
 * curve.
 *
 * For example :
 * ```
 * [
 *   [0, -1],
 *   [1, 0]
 * ]
 * ```
 *
 * Would result in the normal vector be applied in a 90° to the curve on the left side.
 *
 * @param grade
 * @param dimension
 * @param matrix
 */

function assembleOffsetAtFunction(grade, dimension, matrix) {
  grade = grade - 1;
  const cacheItem = distantCache.get([grade, dimension, matrix]);
  if (cacheItem) return Object.assign({}, cacheItem);
  const base = produceMultiplierAndComponents(grade, dimension, 'b'
  /* for base */
  , bezierMultiplier);
  const derived = produceMultiplierAndComponents(grade, dimension, 'd'
  /* for base */
  , bezierMultiplierDerived);
  let derivedLength = "";

  for (let d = 0; d < dimension; d++) {
    derivedLength += "cd" + d + " * " + "cd" + d;
    if (d < dimension - 1) derivedLength += " + ";
  }

  derivedLength = "const scale = " + exports.ID_DISTANCE + " / Math.sqrt(" + derivedLength + ");\n";
  let normalizedDelta = "";

  for (let d = 0; d < dimension; d++) normalizedDelta += 'const cdn' + d + ' = cd' + d + ' * scale;\n';

  let pointSumConcat = "";

  for (let d = 0; d < dimension; d++) {
    pointSumConcat += "    cb" + d;
    const row = matrix[d];

    for (let dt = 0; dt < dimension; dt++) {
      const effectiveMultiplier = row[dt];
      if (effectiveMultiplier == 0) continue;
      pointSumConcat += ' + ' + effectiveMultiplier + ' * cdn' + dt;
    }

    if (d < dimension - 1) pointSumConcat += ",\n";else pointSumConcat += "\n";
  }

  const body = "\"use strict\";\n" + "\n" + "const " + exports.ID_ONE_MINUS_T + " = 1 - " + exports.ID_T + ";\n" + "\n" + base + "\n" + derived + "\n" + derivedLength + "\n" + normalizedDelta + "\n" + "return [\n" + pointSumConcat + "];";
  const func = new Function(exports.ID_POINTS, exports.ID_T, exports.ID_DISTANCE, body);
  distantCache.set([grade, dimension, matrix], {
    body,
    func
  });
  return {
    body,
    func
  };
}

function produceGenericAt(grade, dimension) {
  return assembleBezierFunction(bezierMultiplier, grade, dimension);
}

exports.produceGenericAt = produceGenericAt;

function produceGenericDerived(grade, dimension) {
  return assembleBezierFunction(bezierMultiplierDerived, grade, dimension);
}

exports.produceGenericDerived = produceGenericDerived;

function produceGenericOffsetAt(grade, dimension, matrix) {
  return assembleOffsetAtFunction(grade, dimension, matrix);
}

exports.produceGenericOffsetAt = produceGenericOffsetAt;
},{"./math-functions":"src/math-functions.ts","./cache":"src/cache.ts"}],"src/find-points-places.ts":[function(require,module,exports) {
"use strict";
/*
from:

"use strict";
const oneMinusT = 1 - t;
const rePoint = [NaN, NaN];
const m0 = 1 * oneMinusT * oneMinusT * oneMinusT;
const m1 = 3 * t * oneMinusT * oneMinusT;
const m2 = 3 * t * t * oneMinusT;
const m3 = 1 * t * t * t;
rePoint[0] = m0 * points[0][0] + m1 * points[1][0] + m2 * points[2][0] + m3 * points[3][0];
rePoint[1] = m0 * points[0][1] + m1 * points[1][1] + m2 * points[2][1] + m3 * points[3][1];
return rePoint;

to:

"use strict";
const oneMinusT = 1 - t;
const rePoint = [NaN, NaN];
const m0 = 1 * oneMinusT * oneMinusT * oneMinusT;
const m1 = 3 * t * oneMinusT * oneMinusT;
const m2 = 3 * t * t * oneMinusT;
const m3 = 1 * t * t * t;
rePoint[0] = m0 * 0 + m1 * 1 + m2 * 0 + m3 * 1;
rePoint[1] = m0 * 0 + m1 * 0 + m2 * 1 + m3 * 1;
return rePoint;
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPlaces = void 0;

const produce_generic_1 = require("./produce-generic");

const cache = new Map(); // const pointsRegEx = /points\[(\d+)\]\[(\d+)\]/g;

const pointsRegEx = new RegExp(produce_generic_1.ID_POINTS + "\\[(\\d+)\\]\\[(\\d+)\\]", 'g');
/**
 * transforms the given string into an array of strings and objects
 *
 * the string will be concatenated with the objects string representation
 */

function getPlaces(str) {
  // looking up cache and returning that value if it was already produced
  const cacheEntry = cache.get(str);
  if (cacheEntry) return cacheEntry; // searching for all occurrences of the pattern

  const searchResults = [];
  let match;

  while ((match = pointsRegEx.exec(str)) != null) searchResults.push({
    length: match[0].length,
    point: parseInt(match[1]),
    dimension: parseInt(match[2]),
    start: match.index
  }); // assembling those results into the actual return value


  const result = [];
  let prevStop = 0;

  for (const sr of searchResults) {
    if (sr.start != 0) {
      result[result.length] = str.slice(prevStop, sr.start);
    }

    prevStop = sr.start + sr.length;
    result[result.length] = {
      point: sr.point,
      dimension: sr.dimension
    };
  } // processing the last entry


  const strLength = str.length;
  if (prevStop != strLength) result[result.length] = str.slice(prevStop, strLength); // saving the result in the cache

  cache.set(str, result);
  return result;
}

exports.getPlaces = getPlaces;
},{"./produce-generic":"src/produce-generic.ts"}],"src/produce-specific.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.produceSpecificOffsetAtFunction = exports.produceSpecificDerivedFunction = exports.produceSpecificAtFunction = void 0;

const produce_generic_1 = require("./produce-generic");

const find_points_places_1 = require("./find-points-places");

function makeSpecific(body, points) {
  const places = find_points_places_1.getPlaces(body);
  let newFuncBody = "";

  for (let i = 0; i < places.length; i++) {
    // every even element is a string which separates two occurrences of point[p][d]
    if (i % 2 == 0) {
      newFuncBody += places[i];
    } else {
      // every odd one is an object which has to be replaced by the numeric value in points[p][d] (the function argument)
      const para = places[i];
      newFuncBody += '' + points[para.point][para.dimension];
    }
  }

  return newFuncBody;
}

function produceSpecificAtFunction(points) {
  const grade = points.length;
  const dimension = points[0].length; // the generic function is the base for the specific one

  const generic = produce_generic_1.produceGenericAt(grade, dimension);
  const body = generic.body;
  const specificBody = makeSpecific(body, points);
  return Function(produce_generic_1.ID_T, specificBody);
}

exports.produceSpecificAtFunction = produceSpecificAtFunction;

function produceSpecificDerivedFunction(points) {
  const grade = points.length;
  const dimension = points[0].length; // the generic function is the base for the specific one

  const generic = produce_generic_1.produceGenericDerived(grade, dimension);
  const body = generic.body;
  const specificBody = makeSpecific(body, points);
  return Function(produce_generic_1.ID_T, specificBody);
}

exports.produceSpecificDerivedFunction = produceSpecificDerivedFunction;

function produceSpecificOffsetAtFunction(points, matrix) {
  const grade = points.length;
  const dimension = points[0].length; // the generic function is the base for the specific one

  const generic = produce_generic_1.produceGenericOffsetAt(grade, dimension, matrix);
  const body = generic.body;
  const specificBody = makeSpecific(body, points);
  return Function(produce_generic_1.ID_T, produce_generic_1.ID_DISTANCE, specificBody);
}

exports.produceSpecificOffsetAtFunction = produceSpecificOffsetAtFunction;
},{"./produce-generic":"src/produce-generic.ts","./find-points-places":"src/find-points-places.ts"}],"node_modules/linear-quadratic-cubic-eq-solver/cjs/complex.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Complex {
    constructor(re, im) {
        this.re = re || 0;
        this.im = im || 0;
    }
}
/**
 * Multiplies the complex numbers a and b.
 */
Complex.multiply = function multiply(a, b) {
    return new Complex(a.re * b.re - a.im * b.im, a.re * b.im + b.re * a.im);
};
/**
 * Adds Complex a to Complex b
 */
Complex.add = function add(a, b) {
    return new Complex(a.re + b.re, a.im + b.im);
};
/**
 * Divide a complex number by an real number
 *
 * n / c
 *
 * divideNCompl(3, new Complex(2, -5)) == 3 / (2 - 5i)
 */
Complex.divideNCompl = function divideNCompl(n, c) {
    const nDivByk = n / (c.re * c.re + c.im * c.im);
    return new Complex(c.re * nDivByk, -c.im * nDivByk);
};
/**
 * Calculates the complex nth-roots of the given complex number.
 */
Complex.root = function root(c, n) {
    const a = c.re;
    const b = c.im;
    // length of the complex number 
    const r = Math.sqrt(a * a + b * b);
    const phi = Math.acos(a / r);
    const roots = new Array(n);
    const nthRootOfR1 = Math.pow(r, 1 / n);
    const nthRootOfR2 = (b < 0 ? -nthRootOfR1 : nthRootOfR1);
    for (let k = 0; k < n; k++) {
        const d = (k * 2 * Math.PI + phi) / n;
        roots[k] = new Complex(nthRootOfR1 * Math.cos(d), nthRootOfR2 * Math.sin(d));
    }
    return roots;
};
/**
 * Is a simplified variant of the root(), which is somewhat faster and only returns the first root.
 */
Complex.cubicRoot = function cubicRoot(c) {
    const a = c.re;
    const b = c.im;
    // length of the complex number 
    const r = Math.sqrt(a * a + b * b);
    const nthRootOfR1 = Math.pow(r, 1 / 3);
    const nthRootOfR2 = (b < 0 ? -nthRootOfR1 : nthRootOfR1);
    const d = Math.acos(a / r) / 3;
    return new Complex(nthRootOfR1 * Math.cos(d), nthRootOfR2 * Math.sin(d));
};
exports.default = Complex;

},{}],"node_modules/linear-quadratic-cubic-eq-solver/cjs/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const complex_js_1 = require("./complex.js");
/**
 * Solves 0 = a*x + b for x
 */
function solveLinearEquation(a, b) {
    if (a == 0)
        if (b != 0)
            return [];
        else
            return [0];
    else
        return [-b / a];
}
exports.solveLinearEquation = solveLinearEquation;
/**
 * Solves 0 = a*x^2 + b*x + c for x
 */
function solveQuadraticEquation(a, b, c) {
    if (a == 0)
        return solveLinearEquation(b, c);
    const p = b / a;
    const q = c / a;
    const sqrtContent = p / 2 * p / 2 - q;
    if (sqrtContent < 0) {
        const sqrtR = Math.sqrt(-sqrtContent);
        return [new complex_js_1.default(-p / 2, sqrtR), new complex_js_1.default(-p / 2, -sqrtR)];
    }
    else {
        const sqrtR = Math.sqrt(sqrtContent);
        return [-p / 2 + sqrtR, -p / 2 - sqrtR];
    }
}
exports.solveQuadraticEquation = solveQuadraticEquation;
const c1Multi = new complex_js_1.default(-0.5, 0.5 * Math.sqrt(3));
const c2Multi = new complex_js_1.default(-0.5, -0.5 * Math.sqrt(3));
function calcC(d0, d1) {
    const sqrtContent = d1 * d1 - 4 * d0 * d0 * d0;
    if (sqrtContent < 0) {
        const imaginaryPart = Math.sqrt(-sqrtContent) / 2;
        const realPart = d1 / 2;
        // you could also use Complex.root to get all roots, to prevent the usage of 
        // multiplications for c1 and c2 in solveCubicEquation
        // const [c0,c1,c2] = Complex.root(new Complex(realPart, imaginaryPart), 3);
        return complex_js_1.default.cubicRoot(new complex_js_1.default(realPart, imaginaryPart));
    }
    else {
        return new complex_js_1.default(Math.cbrt((d1 + Math.sqrt(sqrtContent)) / 2), 0);
    }
}
function calcX(d0, c, a, b) {
    // -1 / (3 * a) * (b + c + d / c)
    const dDivc = complex_js_1.default.divideNCompl(d0, c);
    const res = new complex_js_1.default(-(dDivc.re + c.re + b) / (3 * a), -(dDivc.im + c.im) / (3 * a));
    return res;
}
/**
 * Solves 0 = a*x^3 + b*x^2 + c*x + d for x
 */
function solveCubicEquation(a, b, c, d) {
    if (a == 0)
        return solveQuadraticEquation(b, c, d);
    if (d == 0) {
        const x = solveQuadraticEquation(a, b, c);
        const y = [0];
        const l = x.length;
        if (l > 0) {
            y[1] = x[0];
            if (l > 1) {
                y[2] = x[1];
            }
        }
        return y;
    }
    const delta0 = b * b -
        3 * a * c;
    const delta1 = 2 * b * b * b -
        9 * a * b * c +
        27 * a * a * d;
    // const delta = 18 * a * b * c * d -
    //     4 * b * b * b * d +
    //     b * b * c * c -
    //     4 * a * c * c * c -
    //     27 * a * a * d * d;
    const c0 = calcC(delta0, delta1);
    const c1 = complex_js_1.default.multiply(c0, c1Multi);
    const c2 = complex_js_1.default.multiply(c0, c2Multi);
    const x0 = calcX(delta0, c0, a, b);
    const x1 = calcX(delta0, c1, a, b);
    const x2 = calcX(delta0, c2, a, b);
    return [x0, x1, x2];
}
exports.solveCubicEquation = solveCubicEquation;

},{"./complex.js":"node_modules/linear-quadratic-cubic-eq-solver/cjs/complex.js"}],"src/deterministic-t-search.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDeterministicTSearch = void 0;

const linear_quadratic_cubic_eq_solver_1 = require("linear-quadratic-cubic-eq-solver");
/**
 *
 * @param is the value the value is currently
 * @param should what value `is` should be
 * @param margin how far away the the value is allowed to be from the `should` result
 *
 * @returns < 0 if `is` is below the range of should - margin
 *          > 0 if `is` is above the range of should + margin
 *          = 0 if `is` is withing in the range
 */


const inRange = (is, should, margin) => {
  const spm = should + margin;
  if (is > spm) return is - spm;
  const smm = should - margin;
  if (is < smm) return is - smm;
  return 0;
};
/**
 * Removes complex numbers and converts complex numbers with an imaginary part of smaller than 1e-8 to a real number.
 * @param n
 */


const cleanSolutions = n => {
  const k = [];

  for (const h of n) {
    if (typeof h == 'number') k.push(h);else if (inRange(h.im, 0, 1e-8) == 0) k.push(h.re);
  }

  return k;
};

const solvingFunctions = [(p, f) => {
  const a = p[1] - p[0];
  const b = p[0] - f;
  return cleanSolutions(linear_quadratic_cubic_eq_solver_1.solveLinearEquation(a, b));
}, (p, f) => {
  const a = p[0] - 2 * p[1] + p[2];
  const b = -2 * p[0] + 2 * p[1];
  const c = p[0] - f;
  return cleanSolutions(linear_quadratic_cubic_eq_solver_1.solveQuadraticEquation(a, b, c));
}, (p, f) => {
  const a = -p[0] + 3 * p[1] - 3 * p[2] + p[3];
  const b = 3 * p[0] - 6 * p[1] + 3 * p[2];
  const c = -3 * p[0] + 3 * p[1];
  const d = p[0] - f;
  return cleanSolutions(linear_quadratic_cubic_eq_solver_1.solveCubicEquation(a, b, c, d));
}];

function createDeterministicTSearch(points) {
  const grade = points.length;
  const dimension = points[0].length;
  if (grade == null || grade < 2 || grade > 4) return null;
  const dimensionalSplit = [];

  for (let d = 0; d < dimension; d++) {
    const ds = [];

    for (let p = 0; p < points.length; p++) ds.push(points[p][d]);

    dimensionalSplit.push(ds);
  }

  const func = solvingFunctions[grade - 2];
  return (v, d) => {
    return func(dimensionalSplit[d], v);
  };
}

exports.createDeterministicTSearch = createDeterministicTSearch;
},{"linear-quadratic-cubic-eq-solver":"node_modules/linear-quadratic-cubic-eq-solver/cjs/index.js"}],"src/static-bezier.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StaticBezier = void 0;

const produce_specific_1 = require("./produce-specific");

const deterministic_t_search_1 = require("./deterministic-t-search");

const createSpecificAtFunction = points => {
  const at = produce_specific_1.produceSpecificAtFunction(points);
  if (at == null) throw new Error("could not create specific function for points " + JSON.stringify(points));
  return at;
};

const createDeterministicTSearchFunction = points => {
  const tSearch = deterministic_t_search_1.createDeterministicTSearch(points);
  if (tSearch == null) throw new Error("could not create deterministic function for points " + JSON.stringify(points));
  return tSearch;
};

const createSpecificDerivedFunction = points => {
  const derived = produce_specific_1.produceSpecificDerivedFunction(points);
  if (derived == null) throw new Error("could not create derived function for points " + JSON.stringify(points));
  return derived;
};

const leftMatrix = [[0, -1], [1, 0]];
const rightMatrix = [[0, 1], [-1, 0]];

const createSpecificOffsetAtFunction = (points, matrix) => {
  const offset = produce_specific_1.produceSpecificOffsetAtFunction(points, matrix);
  if (offset == null) throw new Error("could not create offset function for points " + JSON.stringify(points));
  return offset;
};

class StaticBezier {
  constructor(points) {
    this.points = points;
  }

  at(t) {
    this.at = createSpecificAtFunction(this.points);
    return this.at(t);
  }

  direction(t) {
    this.direction = createSpecificDerivedFunction(this.points);
    return this.direction(t);
  }

  tSearch(value, dimension) {
    if (this.points.length > 4) this.tSearch = () => {
      throw new Error('can not t search with a grade greater than 4');
    };else this.tSearch = createDeterministicTSearchFunction(this.points);
    return this.tSearch(value, dimension);
  }

  offsetPointLeft(t, distance) {
    if (this.points[0].length == 2) {
      this.offsetPointLeft = createSpecificOffsetAtFunction(this.points, leftMatrix);
    } else {
      this.offsetPointLeft = () => {
        throw new Error('can not get the offset point in a ' + this.points[0].length + '-dimensional Bezier,' + ' only 2-dimensional are permitted');
      };
    }

    return this.offsetPointLeft(t, distance);
  }

  offsetPointRight(t, distance) {
    if (this.points[0].length == 2) {
      this.offsetPointRight = createSpecificOffsetAtFunction(this.points, rightMatrix);
    } else {
      this.offsetPointRight = () => {
        throw new Error('can not get the offset point in a ' + this.points[0].length + '-dimensional Bezier,' + ' only 2-dimensional are permitted');
      };
    }

    return this.offsetPointRight(t, distance);
  }

}

exports.StaticBezier = StaticBezier;
},{"./produce-specific":"src/produce-specific.ts","./deterministic-t-search":"src/deterministic-t-search.ts"}],"tests/test-performance-browsers.js":[function(require,module,exports) {
"use strict";

var _staticBezier = require("../src/static-bezier");

const sb = new _staticBezier.StaticBezier([[0, 0], [1, 0], [0, 1], [1, 1]]);
const values = new Array(11).fill([0, 0]).map((v, i) => sb.at(i / 10));

function runTest() {
  let inner = 0;

  for (let i = 0; i < 1e6; i++) {
    if (++inner == 11) inner = 0;
    sb.tSearch(values[inner][0], 0);
  }
}

setTimeout(runTest, 500);
},{"../src/static-bezier":"src/static-bezier.ts"}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "49739" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","tests/test-performance-browsers.js"], null)
//# sourceMappingURL=/test-performance-browsers.2d4ecfa6.js.map