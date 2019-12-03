let aoc03 = function() {
    "use strict";

    let testCase = function(func, input, expected, compareFunc) {
        let actual = func(input);
        if (!compareFunc(actual, expected)) {
            document.querySelector("#testResults").innerHTML = `TEST FAILURE:<BR> ${func.name}(${input}) is ${actual}<BR>(expected ${expected})`;
            throw {msg: "Unit test failure",};
        }
    };

    let manDist = function(x1, y1, x2, y2) {
        return Math.abs(x2-x1) + Math.abs(y2-y1);
    };
    
    let findClosestIntersectionToOrigin = function(line1, line2) {
        return "Beans";
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/u);
            let lines = [];
            allLines.forEach( (line) => {
                let allSegments = line.split(",");
                lines.append(allSegments);
            });

            let result = callback(allLines);

            document.querySelector(outElem).innerHTML = result;
        };
        reader.onerror = (event) => {
            alert(event.target.error.name);
        };
        reader.readAsText(firstFile);
    };

    let intsAreEqual = (a,b) => { return a === b; };
    
    window.onload = function() {
        return;
        testCase(findClosestIntersectionToOrigin,
                 [
                     ["R8","U5","L5","D3"],
                     ["U7","R6","D4","L4"],
                 ],
                 6, intsAreEqual);
        testCase(findClosestIntersectionToOrigin,
                 [
                     ["R75","D30","R83","U83","L12","D49","R71","U7","L72"],
                     ["U62","R66","U55","R34","D71","R55","D58","R83"],
                 ],
                 159, intsAreEqual);
        testCase(findClosestIntersectionToOrigin,
                 [
                     ["R98","U47","R26","D63","R33","U87","L62","D20","R33","U53","R51"],
                     ["U98","R91","D20","R16","D67","R40","U7","R15","U6","R7"],
                 ],
                 135, intsAreEqual);
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (lines) => {
            return findClosestIntersectionToOrigin(lines[0], lines[1]);
        },
        solvePart2: (lines) => {
        },
    };
}();
