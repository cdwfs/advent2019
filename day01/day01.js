/* global aoc */
let aoc01 = function() {
    "use strict";
    let getFuelForMass = function(mass) {
        return Math.max(0, Math.floor(mass/3) - 2);
    };

    let getTotalFuelForMass = function(mass) {
        let fuel = getFuelForMass(mass);
        let total = fuel;
        do {
            fuel = getFuelForMass(fuel);
            total += fuel;
        } while (fuel !== 0);
        return total;
    };

    let processFile1 = function(inElem, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/u);
            let sum = 0;
            let re = /^(\d+)$/u;
            allLines.forEach( (line) => {
                //console.log(line);
                let match = line.match(re);
                let mass = 0;
                if (match) {
                    mass = match[1];
                    sum += getFuelForMass(mass);
                }
            });
            const expected = 3423279;
            if (sum === expected) {
                document.querySelector(outElem).innerHTML = `${sum} (Correct!)`;
            } else {
                document.querySelector(outElem).innerHTML = `${sum} (ERROR: expected ${expected})`;
            }
        };
        reader.onerror = (event) => {
            alert(event.target.error.name);
        };
        reader.readAsText(firstFile);

    };

    let processFile2 = function(inElem, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/u);
            let sum = 0;
            let re = /^(\d+)$/u;
            allLines.forEach( (line) => {
                //console.log(line);
                let match = line.match(re);
                let mass = 0;
                if (match) {
                    mass = match[1];
                    sum += getTotalFuelForMass(mass);
                }
            });            
            const expected = 5132018;
            if (sum === expected) {
                document.querySelector(outElem).innerHTML = `${sum} (Correct!)`;
            } else {
                document.querySelector(outElem).innerHTML = `${sum} (ERROR: expected {$expected}`;
            }
        };
        reader.onerror = (event) => {
            alert(event.target.error.name);
        };
        reader.readAsText(firstFile);

    };

    window.onload = function() {
        // Part 1
        aoc.testCase(getFuelForMass, [12,], 2);
        aoc.testCase(getFuelForMass, [14,], 2);
        aoc.testCase(getFuelForMass, [1969,], 654);
        aoc.testCase(getFuelForMass, [100756,], 33583);
        // Part 2
        aoc.testCase(getTotalFuelForMass, [14,], 2);
        aoc.testCase(getTotalFuelForMass, [1969,], 966);
        aoc.testCase(getTotalFuelForMass, [100756,], 50346);
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile1: processFile1,
        processFile2: processFile2,
    };
}();
