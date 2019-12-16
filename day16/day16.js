/* global aoc */
let aoc16 = function() {
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

    function patternForOutputDigit(n, len) {
        let pattern = [];
        const basePattern = [0,1,0,-1];
        for(let i=0; i<len; ++i) {
            pattern.push(basePattern[Math.floor((i+1)/(n+1)) % 4]);
        }
        return pattern;
    }

    function doFFT(signal, phaseCount) {
        let digits = signal.split("").map(d => parseInt(d));
        let digitPatterns = [];
        for(let i=0; i<digits.length; ++i) {
            digitPatterns.push(patternForOutputDigit(i, digits.length));
        }
        for(let phase=0; phase<phaseCount; ++phase) {
            let outDigits = [];
            for(let od=0; od<digits.length; ++od) {
                let product = 0;
                let pattern = digitPatterns[od];
                for(let id=0; id<digits.length; ++id) {
                    product += digits[id] * pattern[id];
                }
                outDigits.push(Math.abs(product) % 10);
            }
            digits = outDigits;
        }
        return digits;
    }
    
    function testFFT(signal, phaseCount) {
        const result = doFFT(signal, phaseCount);
        return result.slice(0,8).join("");
    }

    function testFFTAtOffset(signal, phaseCount) {
        let messageOffset = parseInt(signal.slice(0,7));
        const fullSignal = signal.repeat(10000);
        let digits = fullSignal.slice(messageOffset).split("").map(d => parseInt(d));
        for(let phase=0; phase<phaseCount; ++phase) {
            let sum = digits.reduce((sum,elem) => sum + elem, 0);
            let outDigits = [];
            for(let od=0; od<digits.length; ++od) {
                outDigits.push(Math.abs(sum) % 10);
                sum -= digits[od];
            }
            digits = outDigits;
        }
        return digits.slice(0,8).join("");
    }
    
    window.onload = function() {
        // part 1
        aoc.testCase(testFFT, ["12345678",1,], "48226158");
        aoc.testCase(testFFT, ["12345678",2,], "34040438");
        aoc.testCase(testFFT, ["12345678",3,], "03415518");
        aoc.testCase(testFFT, ["12345678",4,], "01029498");
        aoc.testCase(testFFT, ["80871224585914546619083218645595",100,], "24176176");
        aoc.testCase(testFFT, ["19617804207202209144916044189917",100,], "73745418");
        aoc.testCase(testFFT, ["69317163492948606335995924319873",100,], "52432133");
        // part 2
        aoc.testCase(testFFTAtOffset, ["03036732577212944063491565474664",100,], "84462026");
        aoc.testCase(testFFTAtOffset, ["02935109699940807407585447034323",100,], "78725270");
        aoc.testCase(testFFTAtOffset, ["03081770884921959731165446850517",100,], "53553731");
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
