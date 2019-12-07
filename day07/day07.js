let aoc07 = function() {
    "use strict";

    let testCase = function(func, args, expected, compareFunc = (a,b) => a === b) {
        let actual = func(...args); // spread syntax!
        if (!compareFunc(actual, expected)) {
            document.querySelector("#testResults").innerHTML = `TEST FAILURE:<BR> ${func.name}(${args}) is ${actual}<BR>(expected ${expected})`;
            throw "Unit test failure";
        }
    };

    const coroutine = function(f, args) {
        let o = f(...args); // instantiate coroutine
        o.next(); // execute until first yield
        return x => o.next(x);
    };
    
    // Note: this function may modify pgm in-place! Use a copy if the caller needs to reuse pgm elsewhere.
    let intcodeMachine = function*(pgm) {
        let inputs = yield []; // dummy yield to retrieve initial inputs
        let ip = 0;
        let outputs = [];
        // Validate that an program address is within the valid range
        const checkAddr = function(addr) {
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
        
        const getArgValue = function(arg, mode) {
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
            let modes = [parseInt(o/1) % 10, parseInt(o/10) % 10, parseInt(o/100) % 10,]; // TODO: expand more when more params are required
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
                // Yield if no input is available
                console.assert(modes[0] === 0, "dst is in immediate mode");
                const dst = checkAddr(pgm[ip+1]);
                if (inputs.length === 0) {
                    // Pause execution, return all outputs up to this point
                    inputs = yield outputs;
                    if (inputs.length === 0) {
                        throw "Program expects an input, but none was provided!";
                    }
                    // Reset outputs before continuing
                    outputs = [];
                }
                pgm[dst] = inputs.shift();
                ip += 2;
            } else if (op === 4) {
                // output src
                // write [src] to output
                const src = getArgValue(pgm[ip+1], modes[0]);
                outputs.push(src);
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
        return outputs;
    };
    // Helper function if all inputs are known up front
    const processIntcodeProgram = function(pgm, inputs) {
        let machine = coroutine(intcodeMachine, [pgm,]);
        const result = machine(inputs);
        if (!result.done) {
            throw "machine expects additional inputs!";
        }
        return result.value;
    };

    const getArrayPermutations = function(inputArr) {
        let result = [];
        const permute = (arr, m = []) => {
            if (arr.length === 0) {
                result.push(m);
            } else {
                for (let i = 0; i < arr.length; i++) {
                    let curr = arr.slice();
                    let next = curr.splice(i, 1);
                    permute(curr.slice(), m.concat(next));
                }
            }
        };
        permute(inputArr);
        return result;
    };
    
    const getMaxThrusterSignal = function(pgm) {
        let thrusterSignals = [];
        const phaseSettingsPermutations = getArrayPermutations([0,1,2,3,4,]);
        phaseSettingsPermutations.forEach( phaseSettings => {
            let ampInput = 0;
            for(let i=0; i<5; ++i) {
                let inputs = [phaseSettings[i], ampInput,];
                let outputs = processIntcodeProgram(pgm.slice(), inputs); // Must use slice() to avoid modifying original pgm!
                ampInput = outputs[0];
            }
            thrusterSignals.push({phaseSettings: phaseSettings, output: ampInput,});
        });
        return thrusterSignals.reduce( (max, elem) => Math.max(max, elem.output), 0);
    };
    
    const getMaxThrusterSignalWithFeedback = function(pgm) {
        let thrusterSignals = [];
        const phaseSettingsPermutations = getArrayPermutations([5,6,7,8,9,]);
        phaseSettingsPermutations.forEach( phaseSettings => {
            let amplifiers = [
                coroutine(intcodeMachine, [pgm.slice(),]),
                coroutine(intcodeMachine, [pgm.slice(),]),
                coroutine(intcodeMachine, [pgm.slice(),]),
                coroutine(intcodeMachine, [pgm.slice(),]),
                coroutine(intcodeMachine, [pgm.slice(),]),
            ];
            // Prime all amplifiers with their phase settings
            for(let i=0; i<5; ++i) {
                let result = amplifiers[i]([phaseSettings[i],]);
                if (result.done) {
                    throw "amplifier halted before receiving any input?!?";
                }
            }
            // Tick all amplifiers until the final amp has halted
            let ampInput = 0;
            while(true) {
                let result = null;
                for(let i=0; i<5; ++i) {
                    result = amplifiers[i]([ampInput,]);
                    ampInput = result.value[0];
                }
                if (result.done) {
                    break;
                }
            }
            thrusterSignals.push({phaseSettings: phaseSettings, output: ampInput,});
        });
        return thrusterSignals.reduce( (max, elem) => Math.max(max, elem.output), 0);
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
        // part 1
        let pgm = [3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0,];
        testCase(getMaxThrusterSignal, [pgm,], 43210);
        pgm = [3,23,3,24,1002,24,10,24,1002,23,-1,23, 101,5,23,23,1,24,23,23,4,23,99,0,0,];
        testCase(getMaxThrusterSignal, [pgm,], 54321);
        pgm = [3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0,];
        testCase(getMaxThrusterSignal, [pgm,], 65210);
        // part 2
        pgm = [3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5,];
        testCase(getMaxThrusterSignalWithFeedback, [pgm,], 139629729);
        pgm = [3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,
               53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10,];
        testCase(getMaxThrusterSignalWithFeedback, [pgm,], 18216);
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (pgm) => {
            return getMaxThrusterSignal(pgm);
        },
        solvePart2: (pgm) => {
            return getMaxThrusterSignalWithFeedback(pgm);
        },
    };
}();
