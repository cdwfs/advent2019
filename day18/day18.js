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

    function minStepsToGetAllKeys(map, bestSoFar) {
        let logProgress = false;
        if (!bestSoFar) {
            logProgress = true;
            bestSoFar = Infinity;
        }
        //printMap(map);
        //console.log(`best: ${bestSoFar}`);
        // TODO: Precompute [startKey, endKey -> length, which keys needed
        
        // If this state has no keys left, we're done; 
        if (Object.keys(map.keyPos).length === 0) {
            if (map.stepCount < bestSoFar) {
                console.log("best: " + Math.min(map.stepCount, bestSoFar));
                return map.stepCount;
            }
            return bestSoFar;
        }
        // Find shortest path to all reachable keys. Just flood-fill with djikstra until that proves too slow.
        let stepsToKey = {};
        const [yx,yy] = map.youPos;
        let visitedHashes = {};
        let toVisit = [
            [yx,yy,0,],
        ];
        while(toVisit.length > 0) {
            const [px,py,steps] = toVisit.shift();
            // Skip if we've been here already
            const hash = py*map.width + px;
            if (visitedHashes.hasOwnProperty(hash)) {
                continue;
            }
            visitedHashes[hash] = 1;
            // If the current cell is a key, record the step count
            const pc = map.grid[py][px];
            if ("a" <= pc && pc <= "z") {
                console.assert(!stepsToKey.hasOwnProperty(pc), `Already have a shortest path to key ${pc}`);
                stepsToKey[pc] = steps;
                //console.log(`${steps} steps from ${yx},${yy} to key ${pc} at ${px},${py}`);
                continue;
            }
            // Add passable neighbors to the toVisit list
            const neighbors = [ [px+1,py,], [px-1,py,], [px,py+1,], [px,py-1,], ];
            for(const [nx,ny] of neighbors) {
                if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) {
                    continue;
                }
                const nc = map.grid[ny][nx];
                if (nc === "#") {
                    continue; // wall
                } else if ("A" <= nc && nc <= "Z") {
                    continue; // door
                } else {
                    toVisit.push([nx,ny,steps+1,]); // empty cell, key, you
                }
            }
        }
        // For each reachable key:
        // - If getting this key is worse than the best possible path, skip the key
        // - make new state: move to that key, unlock its doors, add to keysFound, update stepCount.
        // - recurse
        if (logProgress) {
            console.log(stepsToKey);
        }
        for(const [key,steps] of Object.entries(stepsToKey)) {
            if (logProgress) {
                console.log(`visiting ${key}`);
            }
            console.assert(map.keyPos.hasOwnProperty(key), `Key doesn't exist in map?`);
            // No sense in going further if we know we can do better
            if (map.stepCount + steps > bestSoFar) {
                continue;
            }
            // - Create a new map state in which we've moved to that key, picked it up, and unlocked (removed) the corresponding door.
            let newMap = cloneMap(map);
            
            newMap.stepCount += steps;
            
            newMap.grid[yy][yx] = ".";
            
            const [kx,ky] = newMap.keyPos[key];
            console.assert(newMap.grid[ky][kx] === key, `Expected to find key ${key} here!`);
            newMap.grid[ky][kx] = "@";
            newMap.youPos = [kx,ky,];
            delete newMap.keyPos[key];
            newMap.foundKeys.push(key);
            
            const door = key.toUpperCase();
            if (newMap.doorPos.hasOwnProperty(door)) {
                const [dx,dy] = newMap.doorPos[door];
                console.assert(newMap.grid[dy][dx] === door, `Expected to find door ${door} here!`);
                newMap.grid[dy][dx] = ".";
                delete newMap.doorPos[door];
            }

            // Recurse!
            bestSoFar = minStepsToGetAllKeys(newMap, bestSoFar);
        }
        return bestSoFar;
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
        //aoc.testCase(minStepsToGetAllKeys, [parseInput(text),], 136);

        text = `\
########################
#@..............ac.GI.b#
###d#e#f################
###A#B#C################
###g#h#i################
########################`;
        aoc.testCase(minStepsToGetAllKeys, [parseInput(text),], 81);
        
        // part 2
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (map) => {
            return {
                actual: minStepsToGetAllKeys(map),
                expected: 17,
            };
        },
        solvePart2: (signal) => {
             return {
                actual: testFFTAtOffset(signal, 100),
                expected: "47664469",
            };
        },
    };
}();
