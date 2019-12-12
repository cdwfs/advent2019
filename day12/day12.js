/* global aoc */
let aoc12 = function() {
    "use strict";

    const getTotalEnergy = function(bodies, stepCount) {
        return 17;
    };
    
    const parseInput = function(text) {
        const allLines = text.split(/\r\n|\n/u);
        return allLines.map( line => {
            let match = line.match(/^<x=(-?\d+), y=(-?\d+), z=(-?\d+)>$/u);
            return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]),];
        });
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const fileContents = reader.result;
            const bodies = parseInput(fileContents);
            const result = callback(bodies);
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
        // part 1
        let text = `<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>`;
        aoc.testCase(getTotalEnergy, [parseInput(text),1000,], 179);
        text = `<x=-8, y=-10, z=0>
<x=5, y=5, z=10>
<x=2, y=-7, z=3>
<x=9, y=-8, z=-3>`;
        aoc.testCase(getTotalEnergy, [parseInput(text),1000,], 1940);
        // part 2
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (bodies) => {
            return {
                actual: getTotalEnergy(bodies, 1000),
                expected: 282,
            };
        },
        solvePart2: (bodies) => {
            return {
                actual: getTotalEnergy(bodies, 1000),
                expected: 1008,
            };
        },
    };
}();
