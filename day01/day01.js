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

    let testCase = function(func, input, expected) {
        let actual = func(input);
        console.assert(actual === expected, "%s(%s) is %s (expected %s)", func.name, input, actual, expected);
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
            document.querySelector(outElem).innerHTML = sum;
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
            document.querySelector(outElem).innerHTML = sum;
        };
        reader.onerror = (event) => {
            alert(event.target.error.name);
        };
        reader.readAsText(firstFile);

    };

    testCase(getFuelForMass, 12, 2);
    testCase(getFuelForMass, 14, 2);
    testCase(getFuelForMass, 1969, 654);
    testCase(getFuelForMass, 100756, 33583);

    testCase(getTotalFuelForMass, 14, 2);
    testCase(getTotalFuelForMass, 1969, 966);
    testCase(getTotalFuelForMass, 100756, 50346);
    
    return {
        processFile1: processFile1,
        processFile2: processFile2,
    };
}();
