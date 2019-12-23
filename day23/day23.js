/* global aoc */
let aoc23 = function() {
    "use strict";

    // Note: this function may modify pgm in-place! Use a copy if the caller needs to reuse pgm elsewhere.
    // The coroutine returns an object with two fields:
    //   done: the program has terminated
    //   value: an array of outputs generated during execution
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

    function firstPacketToAddress(pgm, addr) {
        // Create hosts
        let hosts = [];
        for(let a=0; a<50; ++a) {
            let vm = aoc.coroutine(intcodeMachine, [pgm.slice(),]);
            let result = vm([a,]);
            console.assert(!result.done, `unexpected termination during init`);
            console.assert(result.value.length === 0, `wrote a packet without input?`);
            hosts[a] = {
                address: a,
                vm: vm,
                packetQueue: [],
            };
        }
        let cycles = 0;
        while(true) {
            for(let host of hosts) {
                // Submit one packet as input (or the host address, if not running yet)
                let result = null;
                if (host.packetQueue.length > 0) {
                    if (host.packetQueue.length % 2 !== 0) {
                        throw `packet queue contains incomplete packets`;
                    }
                    const inputs = [host.packetQueue.shift(), host.packetQueue.shift(),];
                    result = host.vm(inputs);
                } else {
                    // no packets available
                    result = host.vm([-1,]);
                }            
                if (result.done) {
                    throw `Unexpected termination?`;
                }
                
                // Process outputs. results are [a,x,y] tuples
                let packets = result.value;
                if (packets.length % 3 !== 0) {
                    throw `Invalid packet stream length (${packets.length}): ${packets}`;
                }
                while(packets.length > 0) {
                    const a = packets.shift();
                    const x = packets.shift();
                    const y = packets.shift();
                    if (a === 255) {
                        return [x,y,];
                    } else if (a < 0 || a >= hosts.length) {
                        throw `packet [${a},${x},${y}] address is out of range`;
                    } else {
                        hosts[a].packetQueue.push(x);
                        hosts[a].packetQueue.push(y);
                        console.log(`${cycles}: [${x},${y}] ${host.address} -> ${a}`);
                    }
                }
            }
            ++cycles;
            if (cycles === 2000) {
                throw `Ran too long; aborting`;
            }
        }
    }

    function firstRepeatedYFromNat(pgm) {
        // Create hosts
        let hosts = [];
        for(let a=0; a<50; ++a) {
            let vm = aoc.coroutine(intcodeMachine, [pgm.slice(),]);
            let result = vm([a,]);
            console.assert(!result.done, `unexpected termination during init`);
            console.assert(result.value.length === 0, `wrote a packet without input?`);
            hosts[a] = {
                address: a,
                vm: vm,
                packetQueue: [],
                idle: false,
            };
        }
        // Create NAT
        let nat = {
            idleCount: 0,
            x: -1,
            y: -1,
            sentYs: [],
        };
        let cycles = 0;
        while(true) {
            for(let host of hosts) {
                // Submit one packet as input (or the host address, if not running yet)
                let result = null;
                if (host.packetQueue.length > 0) {
                    // Receiving inputs wakes an idle host
                    if (host.idle) {
                        host.idle = false;
                        nat.idleCount -= 1;
                    }
                    if (host.packetQueue.length % 2 !== 0) {
                        throw `packet queue contains incomplete packets`;
                    }
                    const inputs = [host.packetQueue.shift(), host.packetQueue.shift(),];
                    result = host.vm(inputs);
                } else {
                    // no packets available
                    if (host.idle) {
                        continue; // idle hosts require no further processing without input
                    }
                    result = host.vm([-1,]);
                    if (result.value.length === 0) {
                        host.idle = true; // no inputs & no outputs; go idle
                        nat.idleCount += 1;
                    }
                }            
                if (result.done) {
                    throw `Unexpected termination?`;
                }
                
                // Process outputs. results are [a,x,y] tuples
                let packets = result.value;
                if (packets.length % 3 !== 0) {
                    throw `Invalid packet stream length (${packets.length}): ${packets}`;
                }
                while(packets.length > 0) {
                    const a = packets.shift();
                    const x = packets.shift();
                    const y = packets.shift();
                    if (a === 255) {
                        nat.x = x;
                        nat.y = y;
                        console.log(`${cycles}: [${x},${y}] ${host.address} -> NAT`);
                    } else if (a < 0 || a >= hosts.length) {
                        throw `packet [${a},${x},${y}] address is out of range`;
                    } else {
                        hosts[a].packetQueue.push(x);
                        hosts[a].packetQueue.push(y);
                        console.log(`${cycles}: [${x},${y}] ${host.address} -> ${a}`);
                    }
                }
            }
            if (nat.idleCount === hosts.length) {
                if (nat.sentYs.hasOwnProperty(nat.y)) {
                    return nat.y;
                }
                hosts[0].packetQueue.push(nat.x);
                hosts[0].packetQueue.push(nat.y);
                nat.sentYs[nat.y] = true;
                console.log(`${cycles}: [${nat.x},${nat.y}] NAT -> 0`);                
            }
            ++cycles;
            if (cycles === 2000) {
                throw `Ran too long; aborting`;
            }
        }
    }

    window.onload = function() {
        document.querySelector("#testResults").innerHTML = "No unit tests";
    };
    
    return {
        processFile: processFile,
        solvePart1: (pgm) => {
            return {
                actual: firstPacketToAddress(pgm, 255)[1],
                expected: 21089,
            };
        },
        solvePart2: (pgm) => {
            return {
                actual: firstRepeatedYFromNat(pgm),
                expected: 16658,
            };
        },
    };
}();
