/* global aoc */
let aoc04 = function() {
    "use strict";

    let isViablePasscode1 = function(passcode) {
        const asStr = passcode.toString();
        if (asStr.length !== 6) {
            return false;
        }
        let i = 0;
        let hasDouble = false;
        for(i=0; i<asStr.length-1; ++i) {
            if (asStr[i+1] < asStr[i]) {
                return false; // digits must never decrease
            }
            if (asStr[i] === asStr[i+1]) {
                hasDouble = true; // must have at least one duplicate of the same digit
            }
        }
        if (!hasDouble) {
            return false;
        }
        return true;
    };
    
    let isViablePasscode2 = function(passcode) {
        const asStr = passcode.toString();
        if (asStr.length !== 6) {
            return false;
        }
        let i = 0;
        let hasDouble = false;
        for(i=0; i<asStr.length-1; ++i) {
            if (asStr[i+1] < asStr[i]) {
                return false; // digits must never decrease
            }
            if ((asStr[i] === asStr[i+1]) &&
                (asStr[i-1] || "A") !== asStr[i] &&
                (asStr[i+2] || "A") !== asStr[i]) {
                hasDouble = true; // must have at least one duplicate of the same digit that is *not* part of a larger group
            }
        }
        if (!hasDouble) {
            return false;
        }

        return true;
    };
    
    let countViablePasscodes = function(range, isViableFunc) {
        let i=0;
        let count = 0;
        for(i=range.min; i<=range.max; ++i) {
            if (isViableFunc(i)) {
                count += 1;
            }
        }
        return count;
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/u);
            const re = /(\d{6})-(\d{6})/u;
            const match = allLines[0].match(re);
            let result = 0;
            if (match) {
                result = callback({min: parseInt(match[1]), max: parseInt(match[2])});
            }
            if (result.actual === result.expected) {
                document.querySelector(outElem).innerHTML = `${result.actual} (Correct!)`;
            } else {
                document.querySelector(outElem).innerHTML = `${result.actual} (ERROR: expected ${result.expected})`;
            }
        };
        reader.onerror = (event) => {
            alert(event.target.error.name);
        };
        reader.readAsText(firstFile);
    };

    window.onload = function() {
        // Part 1 tests
        aoc.testCase(isViablePasscode1, [111111,],  true);
        aoc.testCase(isViablePasscode1, [223450,], false);
        aoc.testCase(isViablePasscode1, [123789,], false);
        // Part 2 tests
        aoc.testCase(isViablePasscode2, [112233,],  true);
        aoc.testCase(isViablePasscode2, [123444,], false);
        aoc.testCase(isViablePasscode2, [111122,],  true);

        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (range) => {
            return {
                actual: countViablePasscodes(range, isViablePasscode1), 
                expected: 530,
            };
        },
        solvePart2: (range) => {
            return {
                actual: countViablePasscodes(range, isViablePasscode2),
                expected: 324,
            };
        },
    };
}();
