/* global aoc */
let aoc05 = function() {
    "use strict";

    let processIntcodeProgram = function(pgm, input) {
        let ip = 0;
        let output = [];

        // Validate that an program address is within the valid range
        let checkAddr = function(addr) {
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
            return addr;
        };
        let getArgValue = function(arg, mode) {
            if (mode === 0) {
                checkAddr(pgm, ip, arg);
                return pgm[arg];
            } else if (mode === 1) {
                return arg;
            } else {
                throw {
                    pgm: pgm,
                    ip: ip,
                    msg: `ERROR: Unsupported mode (${mode})`,
                };
            }
        };
        
        do {
            checkAddr(ip);
            const opcode = pgm[ip];
            const op = opcode % 100;
            let o = parseInt(opcode / 100);
            let modes = [Math.floor(o/1) % 10, Math.floor(o/10) % 10, Math.floor(o/100) % 10,]; // TODO: expand more when more params are required
            if (op === 1) {
                // add src0 src1 dst
                // [dst] = [src0] + [src1]
                console.assert(modes[2] === 0, "dst is in immediate mode");
                const src0 = getArgValue(pgm[ip+1], modes[0]);
                const src1 = getArgValue(pgm[ip+2], modes[1]);
                const dst  = checkAddr(pgm[ip+3]);
                pgm[dst] = src0 + src1;
                ip += 4;
            } else if (op === 2) {
                // mul src1 src2 dst
                // [dst] = [src1] * [src2]
                console.assert(modes[2] === 0, "dst is in immediate mode");
                const src0 = getArgValue(pgm[ip+1], modes[0]);
                const src1 = getArgValue(pgm[ip+2], modes[1]);
                const dst  = checkAddr(pgm[ip+3]);
                pgm[dst] = src0 * src1;
                ip += 4;
            } else if (op === 3) {
                // input dst
                // [dst] = [input]
                console.assert(modes[0] === 0, "dst is in immediate mode");
                const dst = checkAddr(pgm[ip+1]);
                pgm[dst] = input;
                ip += 2;
            } else if (op === 4) {
                // output src
                // write [src] to output
                const src = getArgValue(pgm[ip+1], modes[0]);
                output.push(src);
                ip += 2;
            } else if (op === 5) {
                // jump-if-true cond newip
                // if cond is true, set ip to newip. Otherwise, continue.
                const cond = getArgValue(pgm[ip+1], modes[0]);
                if (cond !== 0) {
                    ip = getArgValue(pgm[ip+2], modes[1]);
                } else {
                    ip += 3;
                }
            } else if (op === 6) {
                // jump-if-false cond newip
                // if cond is false, set ip to newip. Otherwise, continue.
                const cond = getArgValue(pgm[ip+1], modes[0]);
                if (cond === 0) {
                    ip = getArgValue(pgm[ip+2], modes[1]);
                } else {
                    ip += 3;
                }
            } else if (op === 7) {
                // less-than src0 src1 dst
                // if src0 < src1, write 1 to dst. Else, write 0 to dst.
                console.assert(modes[2] === 0, "dst is in immediate mode");
                const src0 = getArgValue(pgm[ip+1], modes[0]);
                const src1 = getArgValue(pgm[ip+2], modes[1]);
                const dst  = checkAddr(pgm[ip+3]);
                pgm[dst] = (src0 < src1) ? 1 : 0;
                ip += 4;
            } else if (op === 8) {
                // equals src0 src1 dst
                // if src0 === src1, write 1 to dst. Else, write 0 to dst.
                console.assert(modes[2] === 0, "dst is in immediate mode");
                const src0 = getArgValue(pgm[ip+1], modes[0]);
                const src1 = getArgValue(pgm[ip+2], modes[1]);
                const dst  = checkAddr(pgm[ip+3]);
                pgm[dst] = (src0 === src1) ? 1 : 0;
                ip += 4;
            } else if (op === 99) {
                break;
            } else {
                throw {
                    pgm: pgm,
                    ip: ip,
                    opcode: opcode,
                    msg: `ERROR: Unsupported op (${op})`,
                };
            }
        } while (true);
        return output;
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allInts = reader.result.split(/,/u).map(elem => parseInt(elem));

            let result = callback(allInts);
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
        let pgm = [3,0,4,0,99,];
        aoc.testCase(processIntcodeProgram, [pgm, 17,], [17,], aoc.compareArrays);
        pgm = [1002,4,3,4,33,];
        aoc.testCase(processIntcodeProgram, [pgm, 17,], [], aoc.compareArrays);
        // part 2
        pgm = [3,9,8,9,10,9,4,9,99,-1,8,];
        aoc.testCase(processIntcodeProgram, [pgm, 8,], [1,], aoc.compareArrays);
        aoc.testCase(processIntcodeProgram, [pgm, 6,], [0,], aoc.compareArrays);
        aoc.testCase(processIntcodeProgram, [pgm, 9,], [0,], aoc.compareArrays);
        pgm = [3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9,];
        aoc.testCase(processIntcodeProgram, [pgm, 0,], [0,], aoc.compareArrays);
        aoc.testCase(processIntcodeProgram, [pgm, 1,], [1,], aoc.compareArrays);
        pgm = [3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
               1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
               999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99,];
        aoc.testCase(processIntcodeProgram, [pgm, 6,], [999,], aoc.compareArrays);
        aoc.testCase(processIntcodeProgram, [pgm, 8,], [1000,], aoc.compareArrays);
        aoc.testCase(processIntcodeProgram, [pgm, 10,], [1001,], aoc.compareArrays);
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (pgm) => {
            const input = 1;
            const pout = processIntcodeProgram(pgm, input);
            let i = 0;
            for(i=0; i<pout.length-1; ++i) {
                if (pout[i] !== 0) {
                    throw({output: pout,});
                }
            }
            return {
                actual: pout[pout.length-1],
                expected: 7259358,
            };
        },
        solvePart2: (pgm) => {
            const input = 5;
            const pout = processIntcodeProgram(pgm, input);
            return {
                actual: pout[0],
                expected: 11826654,
            };
        },
    };
}();
