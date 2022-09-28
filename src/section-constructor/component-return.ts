export function constructComponentReturn(dimension: number, prefix = "") {
  const COMP_ID = prefix ? prefix + "Comp" : "comp";

  let retStr = "";

  retStr += "return [\n";

  for (let d = 0; d < dimension; d++) {
    retStr += "  " + COMP_ID + d;

    if (d < dimension - 1)
      retStr += ",\n";
    else
      retStr += "\n";
  }

  retStr += "];";

  return retStr;
}
