import {ID_DISTANCE, ID_POINTS, ID_T} from "../ids";
import {constructBezierCoefficient} from "../section-constructor/bezier-coefficients";
import {
  deriveCoefficientsUsage,
  getUsedCoefficients,
  normalPolynomialCoefficientsUsage
} from "../polynomial-coefficient-usage";
import {FunctionBodyHandler} from "./function-body-handler";

export function constructOffsetBezier(grade: number, dimension: number) {
  if (dimension != 2)
    throw new Error("Can not construct offset bezier for a dimension other than 2.");

  let retStr = "";

  const coeffDef = normalPolynomialCoefficientsUsage(grade);
  const derivedDef = deriveCoefficientsUsage(coeffDef);

  const usedCoefficients = getUsedCoefficients(grade, coeffDef, derivedDef);

  retStr += constructBezierCoefficient(grade, dimension, usedCoefficients);
  retStr += "\n";

  retStr += "const d = " + ID_DISTANCE + ";\n";
  retStr += "const sqrt = Math.sqrt;\n";

  // TODO the following is the explicit form for the direction of the offset, make this generalised
  //  you will probably need a better implementation of the polynomial class with more methods.
  if (grade == 4) {
    retStr += "const uvSqr = (coeff1_2 + 2 * t * coeff1_1 + 3 * t ** 2 * coeff1_0) ** 2 + (coeff0_2 + 2 * t * coeff0_1 + 3 * t ** 2 * coeff0_0) ** 2;\n";
    retStr += "const uvSqrRoot = sqrt(uvSqr);\n";
    retStr += "const sqrtMul = d / uvSqrRoot;\n";
    retStr += "const mul = d * (2 * (2 * coeff1_1 + 6 * t * coeff1_0) * (coeff1_2 + 2 * t * coeff1_1 + 3 * t ** 2 * coeff1_0) + 2 * (2 * coeff0_1 + 6 * t * coeff0_0) * (coeff0_2 + 2 * t * coeff0_1 + 3 * t ** 2 * coeff0_0)) / (2 * uvSqr ** (3 / 2));\n\n";

    retStr += "const xComp = (-2 * coeff1_1 - 6 * t * coeff1_0) * sqrtMul - (-coeff1_2 - 2 * t * coeff1_1 - 3 * t ** 2 * coeff1_0) * mul + coeff0_2 + 2 * t * coeff0_1 + 3 * t ** 2 * coeff0_0;\n";
    retStr += "const yComp = (2 * coeff0_1 + 6 * t * coeff0_0) * sqrtMul - (coeff0_2 + 2 * t * coeff0_1 + 3 * t ** 2 * coeff0_0) * mul + coeff1_2 + 2 * t * coeff1_1 + 3 * t ** 2 * coeff1_0;\n";
  } else if (grade == 3) {
    retStr += "const uvSqr = (coeff1_1 + 2 * t * coeff1_0) ** 2 + (coeff0_1 + 2 * t * coeff0_0) ** 2;\n";
    retStr += "const uvSqrRoot = sqrt(uvSqr);\n";
    retStr += "const sqrtMul = (2 * d) / uvSqrRoot;\n";
    retStr += "const mul = d * (4 * coeff1_0 * (coeff1_1 + 2 * t * coeff1_0) + 4 * coeff0_0 * (coeff0_1 + 2 * t * coeff0_0)) / (2 * (uvSqr ** 1.5));\n\n";

    retStr += "const xComp = -coeff1_0 * sqrtMul - (-coeff1_1 - 2 * t * coeff1_0) * mul + coeff0_1 + 2 * t * coeff0_0;\n";
    retStr += "const yComp = coeff0_0 * sqrtMul - (coeff0_1 + 2 * t * coeff0_0) * mul + coeff1_1 + 2 * t * coeff1_0;\n";
  } else if (grade == 2) {
    retStr += "const xComp = coeff0_0;\n";
    retStr += "const yComp = coeff1_0;\n";
  } else
    throw new Error("Can not calculate the direction for the offset for another grade than 2, 3 or 4.");

  retStr += "\n";

  retStr += "return [xComp, yComp];";

  return retStr;
}

// (d*(-c[y]-2*t*b[y]-3*t^2*a[y]))/sqrt((c[y]+2*t*b[y]+3*t^2*a[y])^2+(c[x]+2*t*b[x]+3*t^2*a[x])^2)+d[x]+t*c[x]+t^2*b[x]+t^3*a[x]

// const offsetBezier = new Cache<[number, number, number], string>(([grade, dimension, dir]) => grade + ' ' + dimension + ' ' + dir);
//
// export function constructOffsetBezierCached(grade: number, dimension: number, direction: 'left' | 'right') {
//     const dir = direction == 'left' ? 0 : 1;
//     let res = offsetBezier.get([grade, dimension, dir]);
//
//     if (res == undefined) {
//         res = constructOffsetBezier(grade, dimension, direction)
//         offsetBezier.set([grade, dimension, dir], res);
//     }
//
//     return res;
// }
//
// const constructOffsetBezierParameters = [ID_POINTS, ID_T, ID_DISTANCE];

export const offsetDirectionFunction = new FunctionBodyHandler(
  "offsetDirection",
  (grade, dimension) => grade + " " + dimension,
  [ID_POINTS, ID_T, ID_DISTANCE],
  (grade, dimension) => constructOffsetBezier(grade, dimension),
  () => [],
  (grade, dimension) => grade == 2 || grade == 3 || grade == 4 && dimension == 2 ? undefined : () => {
    throw new Error("Can only get the offset direction for grade 2, 3 or 4 and dimension 2.");
  }
);
