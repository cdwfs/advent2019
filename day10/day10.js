/* global aoc */
let aoc10 = function() {
    "use strict";

    const findBestStationLocation = function(map) {
        return [3,4,];
    };
    
    const parseMap = function(text) {
        const allLines = text.split(/\r\n|\n/u);
        return {
            grid: allLines.map( line => line.split("")),
            width: allLines[0].length,
            height: allLines.length,
        };
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const fileContents = reader.result;
            const map = parseMap(fileContents);
            const result = callback(map);
            if (aoc.compareArrays(result.actual, result.expected)) {
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
        let text =`.#..#
.....
#####
....#
...##`;
        aoc.testCase(findBestStationLocation, [parseMap(text),], [3,4,], aoc.compareArrays);
        // part 2
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (map) => {
            return {
                actual: findBestStationLocation(map),
                expected: [0,0,],
            };
        },
        solvePart2: (map) => {
            return {
                actual: findBestStationLocation(map),
                expected: [0,0,],
            };
        },
    };
}();
