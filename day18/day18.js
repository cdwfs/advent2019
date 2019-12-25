/* global aoc */
let aoc18 = function() {
    "use strict";

    function parseInput(text) {
        const allLines = text.split(/\r\n|\n/u).filter(line => line !== "");
        let map = {
            grid: [],
        };
        allLines.forEach(line => {
            map.grid.push(line.split(""));
        });
        map.height = map.grid.length;
        map.width = map.grid[0].length;
        map.stepCount = 0;
        // Local keys, doors, and you
        map.keyPos = {};
        map.doorPos = {};
        map.foundKeys = [];
        map.youKey = "@";
        for(let y=0; y<map.height; ++y) {
            for(let x=0; x<map.width; ++x) {
                const c = map.grid[y][x];
                if (c === "#" || c === ".") {
                    continue;
                } else if (c === "@") {
                    map.youPos = [x,y,];
                } else if ("a" <= c && c <= "z") {
                    map.keyPos[c] = [x,y,];
                } else if ("A" <= c && c <= "Z") {
                    map.doorPos[c] = [x,y,];
                }
            }
        }
        return map;
    }

    function cloneMap(map) {
        return JSON.parse(JSON.stringify(map));
    }
    
    function printMap(map) {
        map.grid.forEach( line => {
            console.log(line.join(""));
        });        
    }
    
    function processFile(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const fileContents = reader.result;
            const map = parseInput(fileContents);
            const result = callback(map);
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

    // returns an object mapping keys to #steps to that key from the provided start pos. Unreachable keys will have no entries.
    function shortestPathToKeys(state, startPos) {
        // Find shortest path to all reachable keys. Just flood-fill with djikstra until that proves too slow.
        let stepsToKey = {};
        let visitedHashes = {};
        let toVisit = [
            [startPos[0],startPos[1],0,],
        ];
        while(toVisit.length > 0) {
            const [px,py,steps] = toVisit.shift();
            // Skip if we've been here already
            const hash = py*state.width + px;
            if (visitedHashes.hasOwnProperty(hash)) {
                continue;
            }
            visitedHashes[hash] = 1;
            // If the current cell is a key, record the step count
            const pc = state.grid[py][px];
            if ("a" <= pc && pc <= "z") {
                console.assert(!stepsToKey.hasOwnProperty(pc), `Already have a shortest path to key ${pc}`);
                stepsToKey[pc] = steps;
                //console.log(`${steps} steps from ${startPos[0]},${startPos[1]} to key ${pc} at ${px},${py}`);
                continue;
            }
            // Add passable neighbors to the toVisit list
            const neighbors = [ [px+1,py,], [px-1,py,], [px,py+1,], [px,py-1,], ];
            for(const [nx,ny] of neighbors) {
                if (nx < 0 || nx >= state.width || ny < 0 || ny >= state.height) {
                    continue;
                }
                const nc = state.grid[ny][nx];
                if (nc === "#") {
                    continue; // wall
                } else if ("A" <= nc && nc <= "Z") {
                    continue; // door
                } else {
                    toVisit.push([nx,ny,steps+1,]); // empty cell, key, you
                }
            }
        }
        return stepsToKey;
    }
    
    function minStepsToGetAllKeys(map) {
        function getMapHash(map) {
            if (map.foundKeys.length === 0) {
                return "start";
            }
            let foundKeys = map.foundKeys.slice();
            foundKeys.sort();
            return map.youKey + foundKeys;
        }

        let seenMaps = {};
        let pq = aoc.createPriorityQueue((a,b) => a.stepCount < b.stepCount);
        pq.push(map);
        while(!pq.empty()) {
            // Pop the state with the shortest total path length.
            let state = pq.pop();
            //console.log(`After ${state.stepCount} steps, found keys [${state.foundKeys}]`);
            // If this state has no keys left, we're done; 
            if (Object.keys(state.keyPos).length === 0) {
                return state.stepCount;
            }
            // If we've seen this map state before, abort.
            const mapHash = getMapHash(state);
            if (seenMaps.hasOwnProperty(mapHash)) {
                continue;
            }
            seenMaps[mapHash] = true;

            // Find shortest path to all keys
            const stepsToKey = shortestPathToKeys(state, state.youPos);
            // For each reachable key:
            //printMap(state);
            const [yx,yy] = state.youPos;
            for(const [key,steps] of Object.entries(stepsToKey)) {
                console.assert(state.keyPos.hasOwnProperty(key), `Key doesn't exist in map?`);
                console.assert("a" <= key && key <= "z", `Invalid key ${key} found?`);
                console.assert(!state.foundKeys.includes(key), `Key ${key} has already been found?`);
                const [kx,ky] = state.keyPos[key];
                // - Create a new map state in which we've moved to that key, picked it up, and unlocked (removed) the corresponding door.
                let newState = cloneMap(state);

                newState.stepCount += steps;

                newState.grid[yy][yx] = ".";

                console.assert(state.grid[ky][kx] === key, `Expected to find key ${key} here!`);
                newState.grid[ky][kx] = "@";
                newState.youPos = [kx,ky,];
                newState.youKey = key;
                delete newState.keyPos[key];
                newState.foundKeys.push(key);
                
                const door = key.toUpperCase();
                if (state.doorPos.hasOwnProperty(door)) {
                    const [dx,dy] = state.doorPos[door];
                    console.assert(state.grid[dy][dx] === door, `Expected to find door ${door} here!`);
                    newState.grid[dy][dx] = ".";
                    delete newState.doorPos[door];
                }
                // Otherwise, add it to the list to visit later.
                pq.push(newState);
            }
        }
        throw `Ran out of map states & didn't find all keys?!?`;
    }

    function minStepsToGetAllKeys4(map) {
        // Update map structure
        const [startx,starty] = map.youPos;
        map.grid[starty-1][startx-1] = "@";
        map.grid[starty-1][startx  ] = "#";
        map.grid[starty-1][startx+1] = "@";
        map.grid[starty  ][startx-1] = "#";
        map.grid[starty  ][startx  ] = "#";
        map.grid[starty  ][startx+1] = "#";
        map.grid[starty+1][startx-1] = "@";
        map.grid[starty+1][startx  ] = "#";
        map.grid[starty+1][startx+1] = "@";
        //printMap(map);
        // Store four "you" positions and keys instead of one
        map.youPos = [
            [startx-1, starty-1,],
            [startx+1, starty-1,],
            [startx-1, starty+1,],
            [startx+1, starty+1,],
        ];
        map.youKey = ["@", "@", "@", "@", ];
        // helper to hash a map state
        function getMapHash(map) {
            let foundKeys = map.foundKeys.slice();
            foundKeys.sort();
            return map.youKey.join("") + foundKeys;
        }
        let seenMaps = {};
        
        let pq = aoc.createPriorityQueue((a,b) => a.stepCount < b.stepCount);
        pq.push(map);
        let prevSteps = 0;
        while(!pq.empty()) {
            // Pop the state with the shortest total path length.
            let state = pq.pop();
            console.assert(state.stepCount >= prevSteps, `PQ bug!`);
            prevSteps = state.stepCount;
            //console.log(`After ${state.stepCount} steps, found keys [${state.foundKeys}]`);
            // If this state has no keys left, we're done; 
            if (Object.keys(state.keyPos).length === 0) {
                return state.stepCount;
            }
            // If we've seen this map state before, abort.
            const mapHash = getMapHash(state);
            if (seenMaps.hasOwnProperty(mapHash)) {
                continue;
            }
            seenMaps[mapHash] = true;
            
            for(let i=0; i<4; ++i) {
                // Compute shortest path to each reachable key for each robot.
                // TODO: 3/4 of this work is redundant.
                let stepsToKey = shortestPathToKeys(state, state.youPos[i]);
                // For each reachable key:
                //printMap(state);
                const [yx,yy] = state.youPos[i];
                console.assert(state.grid[yy][yx] === "@", `Expected to find @ at youPos!`);
                for(const [key,steps] of Object.entries(stepsToKey)) {
                    console.assert(state.keyPos.hasOwnProperty(key), `Key doesn't exist in map?`);
                    console.assert("a" <= key && key <= "z", `Invalid key ${key} found?`);
                    console.assert(!state.foundKeys.includes(key), `Key ${key} has already been found?`);
                    const [kx,ky] = state.keyPos[key];
                    // - Create a new map state in which we've moved to that key, picked it up, and unlocked (removed) the corresponding door.
                    let newState = cloneMap(state);

                    newState.stepCount += steps;

                    newState.grid[yy][yx] = ".";

                    console.assert(state.grid[ky][kx] === key, `Expected to find key ${key} here!`);
                    newState.grid[ky][kx] = "@";
                    newState.youPos[i] = [kx,ky,];
                    newState.youKey[i] = key;
                    delete newState.keyPos[key];
                    newState.foundKeys.push(key);
                    
                    const door = key.toUpperCase();
                    if (state.doorPos.hasOwnProperty(door)) {
                        const [dx,dy] = state.doorPos[door];
                        console.assert(state.grid[dy][dx] === door, `Expected to find door ${door} here!`);
                        newState.grid[dy][dx] = ".";
                        delete newState.doorPos[door];
                    }

                    // Otherwise, add it to the list to visit later.
                    pq.push(newState);
                }
            }
        }
        throw `Ran out of map states & didn't find all keys?!?`;
    }
    
    window.onload = function() {
        // priority queue tests
        let pq = aoc.createPriorityQueue((a,b) => a > b);
        aoc.testCase(pq.size, [], 0);
        aoc.testCase(pq.empty, [], true);
        pq.push(1,4,2,0,5,3);
        aoc.testCase(pq.size, [], 6);
        aoc.testCase(pq.empty, [], false);
        for(let i=5; i>=0; --i) {
            aoc.testCase(pq.peek, [], i);
            aoc.testCase(pq.pop, [], i);
            aoc.testCase(pq.size, [], i);
        }
        aoc.testCase(pq.empty, [], true);
        // part 1
        let text = `\
#########
#b.....@#
#########`;
        aoc.testCase(minStepsToGetAllKeys, [parseInput(text),], 6);

        text = `\
########################
#f.D.E.e.C.b.A.@.a.B.c.#
######################.#
#d.....................#
########################`;
        aoc.testCase(minStepsToGetAllKeys, [parseInput(text),], 86);

        text = `\
########################
#...............b.C.D.f#
#.######################
#.....@.a.B.c.d.A.e.F.g#
########################`;
        aoc.testCase(minStepsToGetAllKeys, [parseInput(text),], 132);

        text = `\
#################
#i.G..c...e..H.p#
########.########
#j.A..b...f..D.o#
########@########
#k.E..a...g..B.n#
########.########
#l.F..d...h..C.m#
#################`;
        aoc.testCase(minStepsToGetAllKeys, [parseInput(text),], 136);

        text = `\
########################
#@..............ac.GI.b#
###d#e#f################
###A#B#C################
###g#h#i################
########################`;
        aoc.testCase(minStepsToGetAllKeys, [parseInput(text),], 81);
        
        // part 2 
        text = `\
#######
#a.#Cd#
##...##
##.@.##
##...##
#cB#Ab#
#######`;
        aoc.testCase(minStepsToGetAllKeys4, [parseInput(text),], 8);

        text = `\
###############
#d.ABC.#.....a#
######...######
######.@.######
######...######
#b.....#.....c#
###############`;

        text = `\
#############
#DcBa.#.GhKl#
#.###...#I###
#e#d#.@.#j#k#
###C#...###J#
#fEbA.#.FgHi#
#############`;
        aoc.testCase(minStepsToGetAllKeys4, [parseInput(text),], 32);

        text = `\
#############
#g#f.D#..h#l#
#F###e#E###.#
#dCba...BcIJ#
#####.@.#####
#nK.L...G...#
#M###N#H###.#
#o#m..#i#jk.#
#############`;
        aoc.testCase(minStepsToGetAllKeys4, [parseInput(text),], 72);
        
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (map) => {
            return {
                actual: minStepsToGetAllKeys(map),
                expected: 4406,
            };
        },
        solvePart2: (map) => {
            return {
                actual: minStepsToGetAllKeys4(map),
                expected: 1964,
            };
        },
    };
}();
