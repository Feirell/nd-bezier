import {ID_T_END, ID_T_START} from "../ids";
import {FunctionBodyHandler} from "./function-body-handler";

import {constructBezierCoefficient} from "../section-constructor/bezier-coefficients";

// implementing the approach discussed here: https://www.geometrictools.com/Documentation/MovingAlongCurveSpecifiedSpeed.pdf
export function constructArcLengthBody(grade: number, dimension: number) {
  // The book chapter describes it the following way:
  // The derivative of the at function (the normal bezier polynomial) is the velocity of the curve if you take the length
  // of that vector you get the speed. Then you can integrate over the speed to the the arc length.

  // The goal is to integrate the sqrt of the length of the vector of the derivative of the original polynomial
  // an example, for grade 3 dimension 2 (names taken from the book):

  // Original Polynomial: X_0(t) = t**2 * coeff0_0 + t * coeff0_1 + coeff0_2
  //                      X_1(t) = t**2 * coeff1_0 + t * coeff1_1 + coeff1_2

  // Derivative Polynomial: V_0(t) = t * 2 * coeff0_0 + coeff0_1
  // V_n(t) = d*X_n(t)/dt   V_1(t) = t * 2 * coeff1_0 + coeff1_1

  // Length of the derivative: σ(t) = sqrt(V_0(t)**2 + V_1(t)**2)

  // To get the length of the arc between tStart and tEnd you need to integrate σ(t) for tStart to tEnd
  // Since the indefinite integral is not trivial to calculate we have two pre defined options.

  if (grade == 2) {
    let retStr = "";

    // we dont use the last coefficient since we derived and the static part of a polynomial is dropped
    retStr += constructBezierCoefficient(grade, dimension, [true, false]);

    // a is the static part of the inner polynomial combined like it is with grade 3, have a look at grade 3 first
    // to understand those steps
    // for dimension = 2 => retStr += 'const a = coeff0_0**2 + coeff1_0**2;\n'; // * t ^ 0
    retStr += "const a = "; // * t ^ 0
    for (let d = 0; d < dimension; d++) {
      retStr += "coeff" + d + "_0 * coeff" + d + "_0";
      if (d < dimension - 1)
        retStr += " + ";
    }
    retStr += ";\n";

    // The indefinite integral of f(t) = sqrt(t^0 * a) is F(t) = t * sqrt(a)

    retStr += "let t = " + ID_T_START + ";\n";
    retStr += "const start = t * sqrt(a);\n";

    retStr += "t = " + ID_T_END + ";\n";
    retStr += "const end = t * sqrt(a);\n";

    retStr += "return end - start;\n";

    return retStr;
  } else if (grade == 3) { // we set this static for grade 3
    let retStr = "";

    // we dont use the last coefficient since we derived and the static part of a polynomial is dropped
    retStr += constructBezierCoefficient(grade, dimension, [true, true, false]);

    // a, b and c are the coefficients for the integrated polynomial: sqrt(t^2 * a + t * b + c)
    // this is the polynomial resulting from σ(t), simplified to be integrated

    // for dimension = 2 =>  retStr += 'const a = 4 * (coeff0_0 ** 2 + coeff1_0 ** 2);\n'; // * t ^ 2
    retStr += "const a = 4 * ("; // * t ^ 2
    for (let d = 0; d < dimension; d++) {
      retStr += "coeff" + d + "_0 * coeff" + d + "_0";
      if (d < dimension - 1)
        retStr += " + ";
    }

    retStr += ");\n";

    // for dimension 2 => retStr += 'const b = 4 * (coeff0_0 * coeff0_1 + coeff1_0 * coeff1_1);\n'; // * t ^ 1
    retStr += "const b = 4 * (";
    for (let d = 0; d < dimension; d++) {
      retStr += "coeff" + d + "_0 * coeff" + d + "_1";
      if (d < dimension - 1)
        retStr += " + ";
    }
    retStr += ");\n";

    // for dimension = 2 => retStr += 'const c = coeff0_1**2 + coeff1_1**2;\n'; // * t ^ 0
    retStr += "const c = ";
    for (let d = 0; d < dimension; d++) {
      retStr += "coeff" + d + "_1 * coeff" + d + "_1";
      if (d < dimension - 1)
        retStr += " + ";
    }
    retStr += ";\n";

    // The following equation is the result of the integration of sqrt(t**2 * a + t * b + c)
    // used https://www.integralrechner.de/#expr=sqrt%28t%5E2%2Aa%2Bt%2Ab%2Bc%29&intvar=t to calculate the integral
    // original form:   ((4*a**2*c-a*b**2)                * asinh( (2*a*t+b)/sqrt(4*a*c-b**2)                      ) + (4*a**(5/2)*t                  + 2*a**(3/2)*b)                 * sqrt(a*t**2+b*t+c))/(8*a**(5/2))
    // rearranged form:  (4*a**2*c-a*b**2) / (8*a**(5/2)) * asinh( t * (2*a)/sqrt(4*a*c-b**2) + b/sqrt(4*a*c-b**2) ) + (t * 4*a**(5/2) / (8*a**(5/2)) + 2*a**(3/2)*b / (8*a**(5/2)) ) * sqrt(t*(b+a*t)+c)
    //                                       -----d0-----                    -------d1-------     -------d1-------                       -----d0----                   -----d0-----
    //                   ---------------m0---------------              -----------m1---------   -------a0---------          -----------m2-----------    ------------a1-------------
    // simplified form:                 m0                * asinh( t *            m1          +        a0          ) + (t *            m2             +             a1              ) * sqrt(t*(b+a*t)+c)

    retStr += "const d0 = 8*a**(5/2);\n"; // (8*a**(5/2))
    retStr += "const d1 = sqrt(4*a*c-b*b);\n"; // sqrt(4*a*c-b**2)

    retStr += "const m0 = (4*a*a*c-a*b*b) / d0;\n"; // ((4*a**2*c-a*b**2) / (8*a**(5/2))
    retStr += "const m1 = (2*a) / d1;\n"; // (2*a)/sqrt(4*a*c-b**2)

    retStr += "const a0 = b / d1;\n"; // b/sqrt(4*a*c-b**2)

    retStr += "const m2 = 4*a**(5/2) / d0;\n"; // b/sqrt(4*a*c-b**2)
    retStr += "const a1 = 2*a**(3/2)*b / d0;\n"; // b/sqrt(4*a*c-b**2)


    retStr += "let t = " + ID_T_START + ";\n";
    retStr += "const start = m0 * asinh(t * m1 + a0) + (t * m2 + a1) * sqrt(t * (b + a * t) + c);\n";

    retStr += "t = " + ID_T_END + ";\n";
    retStr += "const end = m0 * asinh(t * m1 + a0) + (t * m2 + a1) * sqrt(t * (b + a * t) + c);\n";

    retStr += "return end - start;\n";

    return retStr;
  } else
    throw new Error("Can not construct for another grade but grade 3.");
}

export const arcLengthFunction = new FunctionBodyHandler(
  "arcLength",
  (grade: number, dimension: number) => grade + " " + dimension,
  [ID_T_START, ID_T_END],
  (grade, dimension) => constructArcLengthBody(grade, dimension),
  () => {
    const sqrt = Math.sqrt;
    const log = Math.log;
    const abs = Math.abs;
    const asinh = (x: number) => log(x + sqrt(x * x + 1));

    return [
      {internalName: "sqrt", globalValue: sqrt},
      {internalName: "log", globalValue: log},
      {internalName: "abs", globalValue: abs},
      {internalName: "asinh", globalValue: asinh}
    ];
  },
  grade => grade == 2 || grade == 3 ? undefined : () => {
    throw new Error("Can not calculate the arc length for bezier with grade other than 2 or 3");
  }
);