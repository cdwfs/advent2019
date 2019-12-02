var aoc01_1 = function() {
    "use strict"
    var testCase = function(func, input, expected) {
        var actual = func(input);
        console.assert(actual === expected, "%s(%d) is %d (expected %d)", func.name, input, actual, expected);
    }

    var processIntcodeProgram = function(pgm) {
        return pgm;
    }
    
    var processFile1 = function(inElem, outElem) {
        var firstFile = document.querySelector(inElem).files[0];
        var reader = new FileReader();
        reader.onload = (event) => {
            const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/);

            var re = /^(\d+)$/;
            allLines.forEach( (line) => {
                //console.log(line);
                var match = line.match(re);
                if (match) {
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

            var re = /^(\d+)$/;
            allLines.forEach( (line) => {
                //console.log(line);
                var match = line.match(re);
                if (match) {
                }
            });
            
            document.querySelector(outElem).innerHTML = sum;
        };
        reader.onerror = (event) => {
            alert(event.target.error.name);
        };
        reader.readAsText(firstFile);
    }

    testCase(processIntcodeProgram, [1,9,10,3,2,3,11,0,99,30,40,50], [3500,9,10,70,2,3,11,0,99,30,40,50]);
    testCase(processIntcodeProgram, [1,0,0,0,99], [2,0,0,0,99]);
    testCase(processIntcodeProgram, [2,3,0,3,99], [2,3,0,6,99]);
    testCase(processIntcodeProgram, [2,4,4,5,99,0], [2,4,4,5,99,9801]);
    testCase(processIntcodeProgram, [1,1,1,4,99,5,6,0,99], [30,1,1,4,2,5,6,0,99]);
    
    return {
        processFile1: processFile1,
        processFile2: processFile2,
    };
}();
