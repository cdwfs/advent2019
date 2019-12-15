/* global aoc */
let aoc15 = function() {
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

    const Move = {
        N: 1,
        S: 2,
        W: 3,
        E: 4,
    };
    const CellType = {
        Wall: 0,
        Empty: 1,
        OxygenSensor: 2,
    };

    function createMap() {
        let grid = [];
        let isVisited = function(x, y) {
            return grid.hasOwnProperty(y) && grid[y].hasOwnProperty(x);
        };
        let isWall = function(x, y) {
            return isVisited(x,y) && grid[y][x].type === CellType.Wall;
        };
        let getPathTo = function(x, y) {
            if (!isVisited(x,y)) {
                throw `Getting path to unvisited cell [${x},${y}]`;
            }
            return grid[y][x].path;
        };
        let visit = function(x, y, path, cellType) {
            if (isVisited(x,y)) {
                throw `Visiting previously visited cell [${x},${y}]`;
            } else {
                if (!grid.hasOwnProperty(y)) {
                    grid[y] = [];
                }
                grid[y][x] = {
                    path: path,
                    type: cellType,
                };
            }
        };
        return {
            isVisited: isVisited,
            isWall: isWall,
            getPathTo: getPathTo,
            visit: visit,
        };
    }
    
    function findSensor(pgm, map, ctx) {
        map.visit(0, 0, [], CellType.Empty);
        let toVisit = [
            {pos: [ 0, 1,], path: [Move.N,],},
            {pos: [ 0,-1,], path: [Move.S,],},
            {pos: [-1, 0,], path: [Move.W,],},
            {pos: [ 1, 0,], path: [Move.E,],}, 
        ];
        while(toVisit.length > 0) {
            // get position and path of next cell to visit
            const nextDest = toVisit.shift();
            // Skip it if we've been there already
            if (map.isVisited(nextDest.pos[0], nextDest.pos[1])) {
                continue;
            }
            // Path to nextDest and see what we find 
            let robot = aoc.coroutine(intcodeMachine, [pgm.slice(),]);
            let result = robot(nextDest.path.slice());
            const destCellType = result.value.pop();
            map.visit(nextDest.pos[0], nextDest.pos[1], nextDest.path, destCellType);
            if (destCellType === CellType.OxygenSensor) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(nextDest.pos[0],nextDest.pos[1],1,1);
                return {
                    pos: nextDest.pos,
                    path: nextDest.path,
                }; // done!
            } else if (destCellType === CellType.Wall) {
                ctx.fillStyle = "white";
                ctx.fillRect(nextDest.pos[0],nextDest.pos[1],1,1);
            } else {
                ctx.fillStyle = "#404040";
                ctx.fillRect(nextDest.pos[0],nextDest.pos[1],1,1);
                // Add neighbors to visit queue.
                const lastStep = nextDest.path[nextDest.path.length-1];
                if (lastStep !== Move.S) {
                    toVisit.push({pos: [nextDest.pos[0] + 0, nextDest.pos[1] + 1,], path: nextDest.path.concat([Move.N,]),});
                }
                if (lastStep !== Move.N) {
                    toVisit.push({pos: [nextDest.pos[0] + 0, nextDest.pos[1] - 1,], path: nextDest.path.concat([Move.S,]),});
                }
                if (lastStep !== Move.E) {
                    toVisit.push({pos: [nextDest.pos[0] - 1, nextDest.pos[1] + 0,], path: nextDest.path.concat([Move.W,]),});
                }
                if (lastStep !== Move.W) {
                    toVisit.push({pos: [nextDest.pos[0] + 1, nextDest.pos[1] + 0,], path: nextDest.path.concat([Move.E,]),});
                }
            }
        }
        throw `Didn't find the sensor? WTF!`;
    }
    
    function minDistanceToSensor(pgm, canvas) {        
        let ctx = canvas.getContext('2d');
        let map = createMap();
        return findSensor(pgm, map, ctx).path.length;
    }

    function longestPathFromSensor(pgm, canvas) {
        let ctx = canvas.getContext('2d');
        let map = createMap();
        let sensor = findSensor(pgm, map, ctx);

        let map2 = createMap();
        map2.visit(sensor.pos[0], sensor.pos[1], [], CellType.Empty);
        let toVisit = [
            {pos: [sensor.pos[0]+0,sensor.pos[1]+1,], path: [Move.N,],},
            {pos: [sensor.pos[0]+0,sensor.pos[1]-1,], path: [Move.S,],},
            {pos: [sensor.pos[0]-1,sensor.pos[1]+0,], path: [Move.W,],},
            {pos: [sensor.pos[0]+1,sensor.pos[1]+0,], path: [Move.E,],}, 
        ];
        let longestPath = 1;
        while(toVisit.length > 0) {
            // get position and path of next cell to visit
            const nextDest = toVisit.shift();
            // Skip it if we know it's a wall
            if (map.isWall(nextDest.pos[0], nextDest.pos[1])) {
                continue;
            }
            // or if we've been there already
            if (map2.isVisited(nextDest.pos[0], nextDest.pos[1])) {
                continue;
            }
            // Path to nextDest and see what we find 
            let robot = aoc.coroutine(intcodeMachine, [pgm.slice(),]);
            robot(sensor.path.slice()); // move to sensor to start
            let result = robot(nextDest.path.slice());
            const destCellType = result.value.pop();
            map2.visit(nextDest.pos[0], nextDest.pos[1], nextDest.path, destCellType);
            if (destCellType !== CellType.Wall) {
                longestPath = Math.max(longestPath, nextDest.path.length);
                ctx.fillStyle = "#808000";
                ctx.fillRect(nextDest.pos[0],nextDest.pos[1],1,1);
                // Add neighbors to visit queue.
                const lastStep = nextDest.path[nextDest.path.length-1];
                if (lastStep !== Move.S) {
                    toVisit.push({pos: [nextDest.pos[0] + 0, nextDest.pos[1] + 1,], path: nextDest.path.concat([Move.N,]),});
                }
                if (lastStep !== Move.N) {
                    toVisit.push({pos: [nextDest.pos[0] + 0, nextDest.pos[1] - 1,], path: nextDest.path.concat([Move.S,]),});
                }
                if (lastStep !== Move.E) {
                    toVisit.push({pos: [nextDest.pos[0] - 1, nextDest.pos[1] + 0,], path: nextDest.path.concat([Move.W,]),});
                }
                if (lastStep !== Move.W) {
                    toVisit.push({pos: [nextDest.pos[0] + 1, nextDest.pos[1] + 0,], path: nextDest.path.concat([Move.E,]),});
                }
            }
        }
        return longestPath;
    }
    
    window.onload = function() {
        // canvas init
        let canvas1 = document.querySelector("#myCanvas1");
        canvas1.width = 44 * 8;
        canvas1.height = 44 * 8;
        let ctx1 = canvas1.getContext('2d');
        ctx1.fillStyle = "black";
        ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
        ctx1.translate(canvas1.width/2, canvas1.height/2);
        ctx1.scale(8, -8);
        ctx1.fillStyle = "red";
        ctx1.fillRect(0,0,1,1);

        let canvas2 = document.querySelector("#myCanvas2");
        canvas2.width = 44 * 8;
        canvas2.height = 44 * 8;
        let ctx2 = canvas2.getContext('2d');
        ctx2.fillStyle = "black";
        ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
        ctx2.translate(canvas2.width/2, canvas2.height/2);
        ctx2.scale(8, -8);
        ctx2.fillStyle = "red";
        ctx2.fillRect(0,0,1,1);
        
        // no tests
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (pgm) => {
            return {
                actual: minDistanceToSensor(pgm, document.querySelector("#myCanvas1")),
                expected: 236,
            };
        },
        solvePart2: (pgm) => {
            return {
                actual: longestPathFromSensor(pgm, document.querySelector("#myCanvas2")),
                expected: 368,
            };
        },
    };
}();
