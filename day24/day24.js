/* global aoc */
let aoc24 = function() {
    "use strict";

    function parseInput(text) {
        const allLines = text.split(/\r\n|\n/u).filter(line => line !== "");
        return allLines.join("");
    }

    function processFile(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const fileContents = reader.result;
            const state = parseInput(fileContents);
            const result = callback(state);
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

    const xy2i = (x,y) => {
        if (x < 0 || x >= 5 || y < 0 || y >= 5) {
            return -1;
        } else {
            return y*5+x;
        }
    };

    const adjacents = (x,y) => [
        xy2i(x+1,y),
        xy2i(x-1,y),
        xy2i(x,y+1),
        xy2i(x,y-1),
    ];
    
    function nextState(state, neighborLists) {
        let newState = [];
        for(let y=0; y<5; ++y) {
            for(let x=0; x<5; ++x) {
                let i = xy2i(x,y);
                const ns = neighborLists[i];
                let count = 0;
                for(let [ni,dz] of ns) {
                    if (state[ni] === "#") {
                        count++;
                        if (count > 2) {
                            break;
                        }
                    }
                }
                if (state[i] === "#") {
                    // live square dies without exactly one neighbor
                    newState[i] = (count === 1) ? "#" : ".";
                } else {
                    // dead squares spawn a bug with one or two neighbors
                    newState[i] = (count === 1 || count === 2) ? "#" : ".";
                }
            }
        }
        return newState.join("");
    }

    function getCycleBiodiversity(startState) {
        let state = startState;
        let steps = 0;
        let seenStates = {};
        let neighborLists = [];
        for(let y=0; y<5; ++y) {
            for(let x=0; x<5; ++x) {
                let ns = [];
                for(let ni of adjacents(x,y)) {
                    if (ni !== -1) {
                        ns.push([ni, 0,]);
                    }
                }
                neighborLists.push(ns);
            }
        }
        const calculateBiodiversity = function(state) {
            return state.split("").reduce( (acc, cur, idx) => (cur === "#") ? (acc | (1<<idx)) : acc , 0);
        };
        while(true) {
            // Record state
            if (seenStates.hasOwnProperty(state)) {
                return calculateBiodiversity(state);
            }
            seenStates[state] = true;
            // Tick simulation
            state = nextState(state, neighborLists);
            // Infinite loop escape hatch
            steps++;
            if (steps > 1000000) {
                throw `ran too long; abort`;
            }
        }
    }

    function countBugsRecursive(startState, targetStepCount) {
        /* jshint -W140 */ // suppress "nocomma" warning for this table
        let neighborLists = [
            //   U        R        D        L
            [ [ 7,-1], [ 1, 0], [ 5, 0], [11,-1],                                              ], //  0
            [ [ 7,-1], [ 2, 0], [ 6, 0], [ 0, 0],                                              ], //  1
            [ [ 7,-1], [ 3, 0], [ 7, 0], [ 1, 0],                                              ], //  2
            [ [ 7,-1], [ 4, 0], [ 8, 0], [ 2, 0],                                              ], //  3
            [ [ 7,-1], [13,-1], [ 9, 0], [ 3, 0],                                              ], //  4

            [ [ 0, 0], [ 6, 0], [10, 0], [11,-1],                                              ], //  5
            [ [ 1, 0], [ 7, 0], [11, 0], [ 5, 0],                                              ], //  6
            [ [ 2, 0], [ 8, 0],          [ 6, 0], [ 0, 1], [ 1, 1], [ 2, 1], [ 3, 1], [ 4, 1], ], //  7
            [ [ 3, 0], [ 9, 0], [13, 0], [ 7, 0],                                              ], //  8
            [ [ 4, 0], [13,-1], [14, 0], [ 8, 0],                                              ], //  9

            [ [ 5, 0], [11, 0], [15, 0], [11,-1],                                              ], // 10
            [ [ 6, 0],          [16, 0], [10, 0], [ 0, 1], [ 5, 1], [10, 1], [15, 1], [20, 1], ], // 11
            [                                                                                  ], // 12
            [ [ 8, 0], [14, 0], [18, 0],          [ 4, 1], [ 9, 1], [14, 1], [19, 1], [24, 1], ], // 13
            [ [ 9, 0], [13,-1], [19, 0], [13, 0],                                              ], // 14

            [ [10, 0], [16, 0], [20, 0], [11,-1],                                              ], // 15
            [ [11, 0], [17, 0], [21, 0], [15, 0],                                              ], // 16
            [          [18, 0], [22, 0], [16, 0], [20, 1], [21, 1], [22, 1], [23, 1], [24, 1], ], // 17
            [ [13, 0], [19, 0], [23, 0], [17, 0],                                              ], // 18
            [ [14, 0], [13,-1], [24, 0], [18, 0],                                              ], // 19

            [ [15, 0], [21, 0], [17,-1], [11,-1],                                              ], // 20
            [ [16, 0], [22, 0], [17,-1], [20, 0],                                              ], // 21
            [ [17, 0], [23, 0], [17,-1], [21, 0],                                              ], // 22
            [ [18, 0], [24, 0], [17,-1], [22, 0],                                              ], // 23
            [ [19, 0], [13,-1], [17,-1], [23, 0],                                              ], // 24
        ];
        /* jshint +W140 */

        let state = {
            0: startState,
        };
        for(let step=0; step<targetStepCount; ++step) {
            //console.log(`Step: ${step+1}:`);
            let newState = {};
            const maxZ = Math.ceil( (step+1)/2 );
            for(let z=-maxZ; z<=maxZ; ++z) {
                const level = state[z] || [];
                let newLevel = [];
                // TODO: skip empty levels?
                for(let y=0; y<5; ++y) {
                    for(let x=0; x<5; ++x) {
                        let i = xy2i(x,y);
                        const ns = neighborLists[i];
                        let count = 0;
                        for(let [ni,dz] of ns) {
                            if (state[z+dz] !== undefined && state[z+dz][ni] === "#") {
                                count++;
                                if (count > 2) {
                                    break;
                                }
                            }
                        }
                        if (level[i] === "#") {
                            // live square dies without exactly one neighbor
                            newLevel[i] = (count === 1) ? "#" : ".";
                        } else {
                            // dead squares spawn a bug with one or two neighbors
                            newLevel[i] = (count === 1 || count === 2) ? "#" : ".";
                        }
                    }
                }
                //console.log(`Depth ${z}:`);
                //for(let i=0; i<5; ++i) {
                //    console.log(newLevel.slice(5*i, 5*i+5).join(""));
                //}
                newState[z] = newLevel.join("");
            }
            state = newState;
        }
        // Count bugs
        let bugs = 0;
        for(let [z,level] of Object.entries(state)) {
            for(let i=0; i<level.length; ++i) {
                if (level[i] === "#"){
                    bugs++;
                }
            }
        }
        return bugs;
    }
    
    window.onload = function() {
        // part 1
        let state = `\
....#\
#..#.\
#..##\
..#..\
#....`;
        aoc.testCase(getCycleBiodiversity, [state,], 2129920);

        // part 2
        aoc.testCase(countBugsRecursive, [state,10,], 99);
        
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (state) => {
            return {
                actual: getCycleBiodiversity(state),
                expected: 32776479,
            };
        },
        solvePart2: (state) => {
            return {
                actual: countBugsRecursive(state, 200),
                expected: 2017,
            };
        },
    };
}();
