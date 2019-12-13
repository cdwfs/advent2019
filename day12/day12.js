/* global aoc */
let aoc12 = function() {
    "use strict";

    function stepSimulation(bodies) {
        // apply gravity to update velocities
        for(let iBody1=0; iBody1<bodies.length; ++iBody1) {
            let body1 = bodies[iBody1];
            for(let iBody2=iBody1+1; iBody2<bodies.length; ++iBody2) {
                let body2 = bodies[iBody2];
                for(let axis=0; axis<3; ++axis) {
                    if (body2.pos[axis] > body1.pos[axis]) {
                        body1.vel[axis] += 1;
                        body2.vel[axis] -= 1;
                    } else if (body2.pos[axis] < body1.pos[axis]) {
                        body1.vel[axis] -= 1;
                        body2.vel[axis] += 1;
                    }
                }
            }
        }
        // update positions based on current velocity
        bodies.forEach(body => {
            for(let axis=0; axis<3; ++axis) {
                body.pos[axis] += body.vel[axis];
            }
        });
    }
    
    function getTotalEnergy(bodies, stepCount) {
        for(let i=0; i<stepCount; ++i) {
            stepSimulation(bodies);
            //console.log(`After ${i+1} steps:`);
            //bodies.forEach(body => {
            //    console.log(`pos=<x=${body.pos[0]}, y=${body.pos[1]}, z=${body.pos[2]}>, vel=<x=${body.vel[0]}, y=${body.vel[1]}, z=${body.vel[2]}>`);
            //});
        }
        // Compute total potential + kinetic energy
        return bodies.reduce( (sum, body) => {
            return sum +
                ((Math.abs(body.pos[0]) + Math.abs(body.pos[1]) + Math.abs(body.pos[2])) *
                 (Math.abs(body.vel[0]) + Math.abs(body.vel[1]) + Math.abs(body.vel[2])));
        }, 0);
    }

    function copyBodies(bodies) {
        // I hate this idiom but I am impatient.
        return JSON.parse(JSON.stringify(bodies));
    }
    
    function compareStatesForAxis(state1, state2, axis) {
        if (state1.length !== state2.length) {
            return false;
        }
        for(let i=0; i<state1.length; ++i) {
            if (state1[i].pos[axis] !== state2[i].pos[axis] || state1[i].vel[axis] !== state2[i].vel[axis]) {
                return false;
            }
        }
        return true;
    }

    function getStepsToRepeatState(bodies) {
        let cycles = [
            {found: false,},
            {found: false,},
            {found: false,},
        ];
        const originalState = copyBodies(bodies);
        stepSimulation(bodies);
        let step = 1;
        while(true) {
            if (cycles[0].found && cycles[1].found && cycles[2].found) {
                break;
            }
            for(let axis=0; axis<3; ++axis) {
                if (cycles[axis].found) {
                    continue;
                }
                if (compareStatesForAxis(bodies, originalState, axis)) {
                    cycles[axis].found = true;
                    cycles[axis].length = step;
                }
            }
            stepSimulation(bodies);
            ++step;
        }
        return aoc.lcm(cycles[0].length, cycles[1].length, cycles[2].length);
    }
    
    function parseInput(text) {
        const allLines = text.split(/\r\n|\n/u).filter(line => line !== "");
        return allLines.map( line => {
            let match = line.match(/^<x=(-?\d+), y=(-?\d+), z=(-?\d+)>$/u);
            return {
                pos: [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]),],
                vel: [0,0,0,],
            };
        });
    }
    
    function processFile(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const fileContents = reader.result;
            const bodies = parseInput(fileContents);
            const result = callback(bodies);
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
        aoc.testCase(aoc.gcd, [28, 8,], 4);
        aoc.testCase(aoc.gcd, [28,], 28);
        aoc.testCase(aoc.gcd, [28, 8, 3,], 1);
        aoc.testCase(aoc.lcm, [3,15,], 15);
        aoc.testCase(aoc.lcm, [100,90,80,7,], 25200);
        
        let text = `<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>`;
        aoc.testCase(getTotalEnergy, [parseInput(text),10,], 179);
        aoc.testCase(getStepsToRepeatState, [parseInput(text),], 2772);

        text = `<x=-8, y=-10, z=0>
<x=5, y=5, z=10>
<x=2, y=-7, z=3>
<x=9, y=-8, z=-3>`;
        aoc.testCase(getTotalEnergy, [parseInput(text),100,], 1940);
        aoc.testCase(getStepsToRepeatState, [parseInput(text),], 4686774924);

        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (bodies) => {
            return {
                actual: getTotalEnergy(bodies, 1000),
                expected: 9493,
            };
        },
        solvePart2: (bodies) => {
            return {
                actual: getStepsToRepeatState(bodies),
                expected: 326365108375488,
            };
        },
    };
}();
