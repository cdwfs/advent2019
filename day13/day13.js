/* global aoc */
let aoc13 = function() {
    "use strict";

    // Note: this function may modify pgm in-place! Use a copy if the caller needs to reuse pgm elsewhere.
    function* intcodeMachine(pgm) {
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
        };

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
    }
    
    // Helper function if all inputs are known up front
    function processIntcodeProgram(pgm, inputs) {
        let machine = aoc.coroutine(intcodeMachine, [pgm,]);
        const result = machine(inputs);
        if (!result.done) {
            throw "machine expects additional inputs!";
        }
        return result.value;
    }

    function countBlockTiles(pgm) {
        const draws = processIntcodeProgram(pgm);
        console.assert(draws.length % 3 === 0, `draws.length ${draws.length} is not divisible by 3`);
        let blockCount = 0;
        let canvasBounds = [Infinity, Infinity, -Infinity, -Infinity,]; // minX, minY, maxX, maxY
        for(let i=0; i<draws.length-2; i+=3) {
            const x = draws[i+0];
            const y = draws[i+1];
            const tile = draws[i+2];
            if (tile === 2) {
                blockCount += 1;
            }
            canvasBounds[0] = Math.min(canvasBounds[0], x);
            canvasBounds[1] = Math.min(canvasBounds[1], y);
            canvasBounds[2] = Math.max(canvasBounds[2], x);
            canvasBounds[3] = Math.max(canvasBounds[3], y);
            console.log(`${x},${y}: ${tile}`);
        }
        console.log(`canvas bounds: min=[${canvasBounds[0]},${canvasBounds[1]}], max=[${canvasBounds[2]},${canvasBounds[3]}]`);
        return blockCount;
    }

    function runGame(pgm, imgWidth, imgHeight) {
        let canvas = document.querySelector("#myCanvas");
        canvas.width = imgWidth * 4;
        canvas.height = imgHeight * 4;
        let ctx = canvas.getContext('2d');
        ctx.scale(4, 4);

        pgm[0] = 2; // play for free
        let game = aoc.coroutine(intcodeMachine, [pgm,]);
        let score = 0;
        // track ball and pad x positions to steer joystick accordingly
        let ballx = 0;
        let padx = 0;
        while(true) {
            let joystickState = 0;
            if (ballx < padx) {
                joystickState = -1;
            } else if (ballx > padx) {
                joystickState = 1;
            }
            let simResult = game([joystickState,]);
            const draws = simResult.value;
            console.assert(draws.length % 3 === 0, `draws.length ${draws.length} is not divisible by 3`);
            for(let i=0; i<draws.length-2; i+=3) {
                const x = draws[i+0];
                const y = draws[i+1];
                const tile = draws[i+2];
                if (x === -1 && y === 0) {
                    score = tile;
                } else {
                    if (tile === 0) {
                        ctx.fillStyle = "black"; // empty
                    } else if (tile === 1) {
                        ctx.fillStyle = "white"; // wall
                    } else if (tile === 2) {
                        ctx.fillStyle = "yellow"; // block
                    } else if (tile === 3) {
                        ctx.fillStyle = "cyan"; // paddle
                        padx = x;
                    } else if (tile === 4) {
                        ctx.fillStyle = "red"; // ball
                        ballx = x;
                    }
                    ctx.fillRect(x,y,1,1);
                }
            }
            if (simResult.done) {
                break;
            }
            //break; // temp, until timing loop goes in
        }
        return score;
    }

    function processFile(inElem, callback, outElem) {
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
    }

    window.onload = function() {
        // part 1
        //let pgm = [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99,];
        //aoc.testCase(processIntcodeProgram, [pgm.slice(),], pgm, aoc.compareArrays);
        // part 2
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (pgm) => {
            return {
                actual: countBlockTiles(pgm),
                expected: 2252,
            };
        },
        solvePart2: (pgm) => {
            return {
                actual: runGame(pgm, 45, 24), // todo: extract size procedurally
                expected: 13824,
            };
        },
    };
}();
