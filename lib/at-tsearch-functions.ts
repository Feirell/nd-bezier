import ND_CUBIC from './at-functions/nd-cubic';
import ND_ITERATIV from './at-functions/nd-iterativ';
import PRODUCED_GENERIC from './at-functions/produced-generic';
import PRODUCED_SPECIFIC from './at-functions/produced-specific';

const AT_FUNCTIONS = Object.freeze({
    ND_CUBIC, ND_ITERATIV, PRODUCED_GENERIC, PRODUCED_SPECIFIC
});

const AT_FUNCTIONS_NAMES = Object.freeze(Object.keys(AT_FUNCTIONS));

import BINARY_SEARCH from './t-search-functions/binary-search';
import DETERMENISTIC from './t-search-functions/deterministic';

const TSEARCH_FUNCTIONS = Object.freeze({
    BINARY_SEARCH, DETERMENISTIC
});

const TSEARCH_FUNCTIONS_NAMES = Object.freeze(Object.keys(TSEARCH_FUNCTIONS));

export { AT_FUNCTIONS, TSEARCH_FUNCTIONS, AT_FUNCTIONS_NAMES, TSEARCH_FUNCTIONS_NAMES }