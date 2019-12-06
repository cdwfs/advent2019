let aoc06 = function() {
    "use strict";

    let testCase = function(func, input, expected, compareFunc) {
        let actual = func(input);
        const compare = compareFunc || ((a,b) => (a === b));
        if (!compare(actual, expected)) {
            document.querySelector("#testResults").innerHTML = `TEST FAILURE:<BR> ${func.name}(${input}) is ${actual}<BR>(expected ${expected})`;
            throw {msg: "Unit test failure",};
        }
    };

    let countOrbits = function(pairs) {
        let bodies = {
            COM: { depth: 0, },
        };
        pairs.forEach( (pair) => {
            const parent = pair.parent;
            const child = pair.child;
            if (!bodies.hasOwnProperty(parent)) {
                bodies[parent] = {};
            }
        });
        return 0;
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/u);
            const re = /(\w+)\)(\w+)/u;
            const match = allLines[0].match(re);
            let count = 0;
            if (match) {
                count = callback({parent: match[1], child: match[2],});
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
        testCase(countOrbits, [
            {parent:"COM",child:"B",},
            {parent:"B",child:"C",},
            {parent:"C",child:"D",},
            {parent:"D",child:"E",},
            {parent:"E",child:"F",},
            {parent:"B",child:"G",},
            {parent:"G",child:"H",},
            {parent:"D",child:"I",},
            {parent:"E",child:"J",},
            {parent:"J",child:"K",},
            {parent:"K",child:"L",},
        ], 42);
        
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
