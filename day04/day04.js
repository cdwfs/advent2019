let aoc04 = function() {
    "use strict";

    let testCase = function(func, input, expected, compareFunc) {
        let actual = func(input);
        if (!compareFunc(actual, expected)) {
            document.querySelector("#testResults").innerHTML = `TEST FAILURE:<BR> ${func.name}(${input}) is ${actual}<BR>(expected ${expected})`;
            throw {msg: "Unit test failure",};
        }
    };

    let isViablePasscode = function(passcode) {
        return false;
    };
    
    let countViablePasscodes = function(range) {
        const rangeMin = range.min;
        const rangeMax = range.max;
        return 0;
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/u);
            const re = /(\d{6})-(\d{6})/u;
            const match = allLines[0].match(re);
            let count = 0;
            if (match) {
                count = callback({min: parseInt(match[1]), max: parseInt(match[2])});
            }

            document.querySelector(outElem).innerHTML = count;
        };
        reader.onerror = (event) => {
            alert(event.target.error.name);
        };
        reader.readAsText(firstFile);
    };

    window.onload = function() {
        // Part 1 tests
        testCase(isViablePasscode, 111111, true, (a,b) => (a === b));
        testCase(isViablePasscode, 223450, false, (a,b) => (a === b));
        testCase(isViablePasscode, 123789, false, (a,b) => (a === b));

        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (range) => {
            return countViablePasscodes(range);
        },
        solvePart2: (range) => {
            return "Beans";
        },
    };
}();
