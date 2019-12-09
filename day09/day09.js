/* global aoc */
let aoc09 = function() {
    "use strict";

    // Note: this function may modify pgm in-place! Use a copy if the caller needs to reuse pgm elsewhere.
    let intcodeMachine = function*(pgm) {
        let inputs = yield []; // dummy yield to retrieve initial inputs
        let ip = 0;
        let relativeBase = 0;
        let outputs = [];
        // Read the contents of memory address addr.
        const readMem = function(addr) {
            if (typeof pgm[addr] === "number") {
                return pgm[addr];
            } else {
                // Uninitialized memory implicitly has the value 0.
                return 0;
            }
        };
        // Write a value to memory at the specified address.
        const writeMem = function(addr, value) {
            if (typeof value !== "number") {
                throw `Attempting to write non-number value ${value} to address ${addr}`;
            }
            pgm[addr] = value;
        };
        
        const getArgValue = function(arg, mode) {
            if (mode === 0) {
                return readMem(arg);
            } else if (mode === 1) {
                return arg;
            } else if (mode === 2) {
                return readMem(relativeBase + arg);
            } else {
                throw {
                    pgm: pgm,
                    ip: ip,
                    msg: `ERROR: Unsupported mode (${mode})`,
                };
            }
        };

        const getDstAddr = function(arg, mode) {
            // mode 1 is not allowed for dst parameters
            if (mode === 0) {
                return arg;
            } else if (mode === 2) {
                return relativeBase + arg;
            } else {
                throw `at ip=${ip} dst has invalid mode ${mode}`;
            }
        }

        do {
            const opcode = readMem(ip);
            const op = opcode % 100;
            let o = parseInt(opcode / 100);
            let modes = [parseInt(o/1) % 10, parseInt(o/10) % 10, parseInt(o/100) % 10,]; // TODO: expand more when more params are required
            if (op === 1) {
                // add src0 src1 dst
                // [dst] = [src0] + [src1]
                const src0 = getArgValue(readMem(ip+1), modes[0]);
                const src1 = getArgValue(readMem(ip+2), modes[1]);
                const dst  = getDstAddr(readMem(ip+3), modes[2]);
                writeMem(dst, src0 + src1);
                ip += 4;
            } else if (op === 2) {
                // mul src1 src2 dst
                // [dst] = [src1] * [src2]
                const src0 = getArgValue(readMem(ip+1), modes[0]);
                const src1 = getArgValue(readMem(ip+2), modes[1]);
                const dst  = getDstAddr(readMem(ip+3), modes[2]);
                writeMem(dst, src0 * src1);
                ip += 4;
            } else if (op === 3) {
                // input dst
                // [dst] = [input]
                // Yield if no input is available
                const dst = getDstAddr(readMem(ip+1), modes[0]);
                if (inputs.length === 0) {
                    // Pause execution, return all outputs up to this point
                    inputs = yield outputs;
                    if (inputs.length === 0) {
                        throw "Program expects an input, but none was provided!";
                    }
                    // Reset outputs before continuing
                    outputs = [];
                }
                writeMem(dst, inputs.shift());
                ip += 2;
            } else if (op === 4) {
                // output src
                // write [src] to output
                const src = getArgValue(readMem(ip+1), modes[0]);
                outputs.push(src);
                ip += 2;
            } else if (op === 5) {
                // jump-if-true cond newip
                // if cond is true, set ip to newip. Otherwise, continue.
                const cond = getArgValue(readMem(ip+1), modes[0]);
                if (cond !== 0) {
                    ip = getArgValue(readMem(ip+2), modes[1]);
                } else {
                    ip += 3;
                }
            } else if (op === 6) {
                // jump-if-false cond newip
                // if cond is false, set ip to newip. Otherwise, continue.
                const cond = getArgValue(readMem(ip+1), modes[0]);
                if (cond === 0) {
                    ip = getArgValue(readMem(ip+2), modes[1]);
                } else {
                    ip += 3;
                }
            } else if (op === 7) {
                // less-than src0 src1 dst
                // if src0 < src1, write 1 to dst. Else, write 0 to dst.
                const src0 = getArgValue(readMem(ip+1), modes[0]);
                const src1 = getArgValue(readMem(ip+2), modes[1]);
                const dst  = getDstAddr(readMem(ip+3), modes[2]);
                writeMem(dst, (src0 < src1) ? 1 : 0);
                ip += 4;
            } else if (op === 8) {
                // equals src0 src1 dst
                // if src0 === src1, write 1 to dst. Else, write 0 to dst.
                const src0 = getArgValue(readMem(ip+1), modes[0]);
                const src1 = getArgValue(readMem(ip+2), modes[1]);
                const dst  = getDstAddr(readMem(ip+3), modes[2]);
                writeMem(dst, (src0 === src1) ? 1 : 0);
                ip += 4;
            } else if (op === 9) {
                // addToRelativeBase src0
                // Adds [src0] to relativeBase
                const src0 = getArgValue(readMem(ip+1), modes[0]);
                relativeBase += src0;
                ip += 2;
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
        return outputs;
    };
    // Helper function if all inputs are known up front
    const processIntcodeProgram = function(pgm, inputs) {
        let machine = aoc.coroutine(intcodeMachine, [pgm,]);
        const result = machine(inputs);
        if (!result.done) {
            throw "machine expects additional inputs!";
        }
        return result.value;
    };

    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allInts = reader.result.split(/,/u).map(elem => parseInt(elem));

            const result = callback(allInts);
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
        let pgm = [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99,];
        aoc.testCase(processIntcodeProgram, [pgm.slice(),], pgm, aoc.compareArrays);
        pgm = [1102,34915192,34915192,7,4,7,99,0,];
        aoc.testCase( pgm => processIntcodeProgram(pgm, [])[0].toString().length, [pgm,], 16);
        pgm = [104,1125899906842624,99,];
        aoc.testCase(processIntcodeProgram, [pgm.slice(),], [pgm[1],], aoc.compareArrays);
        // part 2
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (pgm) => {
            return {
                actual: processIntcodeProgram(pgm, [1,])[0],
                expected: 2932210790,
            };
        },
        solvePart2: (pgm) => {
            return {
                actual: processIntcodeProgram(pgm, [2,])[0],
                expected: 73144,
            };
        },
    };
}();
