var aoc01_1 = function() {
    "use strict"
    var getFuelForMass = function(mass) {
        return Math.max(0, Math.floor(mass/3) - 2);
    }

    var getTotalFuelForMass = function(mass) {
        var fuel = getFuelForMass(mass);
        var total = fuel;
        do {
            fuel = getFuelForMass(fuel);
            total += fuel;
        } while (fuel !== 0);
        return total;
    }

    var testCase = function(func, input, expected) {
        var actual = func(input);
        console.assert(actual === expected, "%s(%d) is %d (expected %d)", func.name, input, actual, expected);
    }

    var processFile1 = function(inElem, outElem) {
        var firstFile = document.querySelector(inElem).files[0];
        var reader = new FileReader();
        reader.onload = (event) => {
            const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/);
            var sum = 0;
            var re = /^(\d+)$/;
            allLines.forEach( (line) => {
                //console.log(line);
                var match = line.match(re);
                var mass = 0;
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

    }

    var processFile2 = function(inElem, outElem) {
        var firstFile = document.querySelector(inElem).files[0];
        var reader = new FileReader();
        reader.onload = (event) => {
            const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/);
            var sum = 0;
            var re = /^(\d+)$/;
            allLines.forEach( (line) => {
                //console.log(line);
                var match = line.match(re);
                var mass = 0;
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

    }

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
