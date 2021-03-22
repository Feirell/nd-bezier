import {ID_T} from "../ids";
import {CoefficientUsageDefinition} from "../polynomial-coefficient-usage";

export function constructBezierComponents(grade: number, dimension: number, coeffDef: CoefficientUsageDefinition, prefix = '') {
    const T_EXP_ID = prefix ? prefix + 'TExp' : 'tExp';
    const COMP_ID = prefix ? prefix + 'Comp' : 'comp';

    let retStr = '';

    for (let c = 0; c < coeffDef.length; c++) {
        const coeffsToUse = coeffDef[c];

        if (c == 1)
            retStr += 'let ' + T_EXP_ID + ' = ' + ID_T + ';\n';
        else if (c > 1)
            retStr += T_EXP_ID + ' *= ' + ID_T + ';\n';

        for (let d = 0; d < dimension; d++) {
            if (c == 0)
                retStr += 'let ' + COMP_ID + d + ' = ';
            else
                retStr += COMP_ID + d + ' += ' + T_EXP_ID;

            let combined = '';
            for (let i = 0; i < coeffsToUse.length; i++) {
                if (combined.length > 0)
                    combined += ' + ';

                if (coeffsToUse[i].multiplier != 1)
                    combined += coeffsToUse[i].multiplier;

                const vars = coeffsToUse[i].variables;

                for (let v = 0; v < vars.length; v++) {
                    if (coeffsToUse[i].multiplier != 1 || v > 0)
                        combined += ' * ';

                    combined += 'coeff' + d + '_' + vars[v];
                }
            }

            if (combined.length != 0 && c > 0) {
                if (coeffsToUse.length > 1)
                    combined = '( ' + combined + ' )';

                combined = ' * ' + combined;
            }

            retStr += combined + ';\n';
        }

        if (c < coeffDef.length - 1)
            retStr += '\n';
    }

    return retStr;
}