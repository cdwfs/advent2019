let aoc02 = function() {
    "use strict";

    let compareArrays = function(arr1, arr2) {
        return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
    };
    
    let testCase = function(func, input, expected, compareFunc) {
        let actual = func(input);
        if (!compareFunc(actual, expected)) {
            document.querySelector("#testResults").innerHTML = `TEST FAILURE:<BR> ${func.name}(${input}) is ${actual}<BR>(expected ${expected})`;
            throw {msg: "Unit test failure",};
        }
    };

    let checkAddr = function(pgm, ip, addr) {
        if (addr < 0 || addr >= pgm.length) {
            console.log("ERROR: out of bounds addr (%d)", addr);
            console.log(pgm);
            console.log("ip=%d", ip);
            throw {
                pgm: pgm,
                ip: ip,
                msg: `ERROR: out of bounds addr (${addr})`,
            };
        }
    };
    
    let processIntcodeProgram = function(pgm) {
        let ip = 0;
        do {
            checkAddr(pgm, ip, ip);
            if (pgm[ip] === 1) {
                let src1 = pgm[ip+1];
                let src2 = pgm[ip+2];
                let dst = pgm[ip+3];
                checkAddr(pgm, ip, src1);
                checkAddr(pgm, ip, src2);
                checkAddr(pgm, ip, dst);
                pgm[dst] = pgm[src1] + pgm[src2];
                ip += 4;
            } else if (pgm[ip] === 2) {
                let src1 = pgm[ip+1];
                let src2 = pgm[ip+2];
                let dst = pgm[ip+3];
                checkAddr(pgm, ip, src1);
                checkAddr(pgm, ip, src2);
                checkAddr(pgm, ip, dst);
                pgm[dst] = pgm[src1] * pgm[src2];
                ip += 4;
            } else if (pgm[ip] === 99) {
                break;
            } else {
                throw {
                    pgm: pgm,
                    ip: ip,
                    msg: `ERROR: Unsupported opcode (${pgm[ip]})`,
                };
            }
        } while (true);
        return pgm;
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allInts = reader.result.split(/,/u).map(elem => parseInt(elem));

            let result = callback(allInts);

            document.querySelector(outElem).innerHTML = result;
        };
        reader.onerror = (event) => {
            alert(event.target.error.name);
        };
        reader.readAsText(firstFile);
    };

    window.onload = function() {
        testCase(processIntcodeProgram, [1,9,10,3,2,3,11,0,99,30,40,50,], [3500,9,10,70,2,3,11,0,99,30,40,50,], compareArrays);
        testCase(processIntcodeProgram, [1,0,0,0,99,], [2,0,0,0,99,], compareArrays);
        testCase(processIntcodeProgram, [2,3,0,3,99,], [2,3,0,6,99,], compareArrays);
        testCase(processIntcodeProgram, [2,4,4,5,99,0,], [2,4,4,5,99,9801,], compareArrays);
        testCase(processIntcodeProgram, [1,1,1,4,99,5,6,0,99,], [30,1,1,4,2,5,6,0,99,], compareArrays);
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        processIntcodeProgramAndReturnElemZero: (pgm) => {
            pgm[1] = 12;
            pgm[2] = 2;
            let pout = processIntcodeProgram(pgm);
            return pout[0];
        },
        processIntcodeProgramWithGoal: (pgm) => {
            let goal = 19690720;
            let noun = 0;
            let verb = 0;
            for(noun=0; noun<=99; ++noun) {
                for(verb=0; verb<=99; ++verb) {
                    let mem = pgm.slice();
                    mem[1] = noun;
                    mem[2] = verb;
                    let mout = processIntcodeProgram(mem);
                    if (mout[0] === goal) {
                        return 100 * noun + verb;
                    }
                }
            }
            return "No such luck :(";
        },
    };
}();
