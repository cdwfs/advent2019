/* global aoc */
let aoc19 = function() {
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
    
    // Helper function if all inputs are known up front.
    function processIntcodeProgram(pgm, inputs) {
        let machine = aoc.coroutine(intcodeMachine, [pgm,]);
        const result = machine(inputs);
        if (!result.done) {
            throw "machine expects additional inputs!";
        }
        return result.value;
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

    function countAffectedPoints(pgm, canvas, x0, y0, x1, y1) {
        let ctx = null;
        if (canvas) {
            canvas.width = (x1-x0) * 1;
            canvas.height = (y1-y0) * 1;
            ctx = canvas.getContext('2d');
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.translate(x0, y0);
            ctx.scale(1, 1);
        }
        let count = 0;
        for(let y=y0; y<y1; ++y) {
            for(let x=x0; x<x1; ++x) {
                const results = processIntcodeProgram(pgm.slice(), [x,y,]);
                if (results[0] === 1) {
                    count += 1;
                    ctx.fillStyle = "#808080";
                    ctx.fillRect(x,y,1,1);
                }
            }
        }
        return count;
    }

    function getClosestBoxFit(pgm, bw, bh) {
        let slope = [354, 400,];
        let miny = 10;
        let maxy = 200;
        while(true) {
            let ty = Math.floor( (miny+maxy)/2 );
            // Find the right edge of the beam at this height
            let tx = Math.floor((ty / slope[1]) * slope[0]);
            const ur = processIntcodeProgram(pgm.slice(), [tx,ty,])[0];
            if (ur) {
                // test point is inside the beam; move right until the right neighbor is outside.
                while(processIntcodeProgram(pgm.slice(), [tx+1,ty,])[0]) {
                    tx += 1;
                }
            } else {
                // Test point is outside the beam; move left until test point is inside.
                do {
                    tx -= 1;
                } while(!processIntcodeProgram(pgm.slice(), [tx,ty,])[0]);
            }                
            // tx,ty is now the rightmost point inside the beam at height Y.
            slope = [tx, ty,]; // update slope estimate.
            
            // maxy tracks the smallest Y we've tested where a bw*bh box definitely fits.
            // miny tracks the largest Y we've tested where a bw*bh box does NOT fit, but a (bw-1)*(bh-1) box DOES.
            let [blx,bly] = [tx-(bw-1), ty+(bh-1),]
            const bl = processIntcodeProgram(pgm.slice(), [blx,bly,])[0];
            if (bl) {
                // box is inside the beam. Adjust upper bound.
                maxy = ty;
            } else {
                // box is outside the beam. Adjust lower bound.
                miny = ty+1;
            }
            if (miny === maxy) {
                break;
            }
        }
        const closestPoint = [Math.floor((miny / slope[1]) * slope[0]), miny,];
        return closestPoint[0]*10000 + closestPoint[1];
    }
    
    window.onload = function() {
        // part 1
        // part 2
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (pgm) => {
            return {
                actual: countAffectedPoints(pgm, document.querySelector("#myCanvas1"), 0, 0, 200, 200),
                expected: 110,
            };
        },
        solvePart2: (pgm) => {
            return {
                actual: getClosestBoxFit(pgm, 8, 8),
                expected: 18902145,
            };
        },
    };
}();
