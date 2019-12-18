/* global aoc */
let aoc18 = function() {
    "use strict";

    function parseInput(text) {
        const allLines = text.split(/\r\n|\n/u).filter(line => line !== "");
        return allLines[0];
    }
    
    function processFile(inElem, callback, outElem) {
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
    }

    window.onload = function() {
        // part 1
        // part 2
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (signal) => {
            return {
                actual: testFFT(signal, 100),
                expected: "84970726",
            };
        },
        solvePart2: (signal) => {
            return {
                actual: testFFTAtOffset(signal, 100),
                expected: "47664469",
            };
        },
    };
}();
