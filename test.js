const { Bezier, TSEARCH_FUNCTIONS_NAMES } = require('.');

const arr = [[0, 0], [1, 0], [0, 1], [1, 1]];

{
    const b = new Bezier(arr, undefined, TSEARCH_FUNCTIONS_NAMES[0]);
    console.log('b.tSearch(0.468, 0)', b.tSearch(0.468, 0));
}

{
    const b = new Bezier(arr, undefined, TSEARCH_FUNCTIONS_NAMES[1]);
    console.log('b.tSearch(0.468, 0)', b.tSearch(0.468, 0));
}