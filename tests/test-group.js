const Benchmark = require('benchmark');
const formatter = require('benchmark-suite-formatter');

const arrayCopy = (inst, off = 0) => Array.prototype.slice.call(inst, off);

class TestGroup {
    constructor(name, paramArray, testFunctionProducer) {
        TestGroup.allGroups.push(this);

        this.name = name;
        this.defaultArray = paramArray;
        this.testFunctionProducer = testFunctionProducer;

        this.none = false;
        this.regExpStrings = [];

    }

    getString() {
        if (this.suite)
            return this.name + '\n' + formatter.stringifySuite(this.suite);
        else
            return undefined;
    }

    startSuite() {
        return new Promise((resolve, reject) => {
            if (!this.suite)
                resolve();

            this.suite.on('complete', () => resolve());

            this.suite.on('error', (err) => reject({
                nameSuite: this.name,
                nameFunction: err.target.name,
                code: err.target.compiled.toString(),
                error: err.target.error
            }));

            this.suite.run({
                'async': true
            });
        })
    }

    createSuite() {
        const allFuncts = this.getAllTestsFunctions();

        if (allFuncts.length == 0)
            return;

        this.suite = new Benchmark.Suite();

        // function wrapTest(func) {
        //     return function () {
        //         try {
        //             func()
        //         } catch (e) {
        //             console.error('%s threw an error\n', func.name, e);
        //             process.exit();
        //         }
        //     }
        // }

        for (let { name, func } of allFuncts)
            this.suite.add(name, func);
    }

    addFilterString(str) {
        if (str == 'none')
            this.none = true;
        else
            this.regExpStrings.push(str);
    }

    getAllFitting() {
        if (this.none)
            return [];

        const bigRegExpString = this.regExpStrings.filter(str => {
            if (str == '')
                return false;

            try {
                new RegExp(str);
            } catch (e) {
                return false;
            }

            return true;
        }).join('|');

        console.log('bigRegExpString', bigRegExpString);

        if (bigRegExpString.length == 0)
            return arrayCopy(this.defaultArray);

        const regExp = new RegExp(bigRegExpString);
        return this.defaultArray.filter(str => regExp.test(str))
    }

    getAllTestsFunctions() {
        return this.getAllFitting().map(name => ({ name, func: this.testFunctionProducer(name) }));
    }

    static getGroupByName(name) {
        return TestGroup.getAllGroups().find(g => g.name == name) || null;
    }

    static getAllGroups() {
        return this.allGroups;
    }

    static logAllSuites() {
        let con = TestGroup.getAllGroups().map(group => group.getString()).filter(v => v != undefined);

        if (con.length > 0) {
            console.clear();
            console.log(con.join('\n\n'));
        }
    }

    static async testAllGroups() {

        const timeoutID = setInterval(() => {
            TestGroup.logAllSuites();
        }, 75);

        for (let testGroup of TestGroup.getAllGroups())
            testGroup.createSuite();

        for (let testGroup of TestGroup.getAllGroups())
            await testGroup.startSuite();

        clearInterval(timeoutID);
        TestGroup.logAllSuites();
    }
}
TestGroup.allGroups = [];

module.exports = { TestGroup };