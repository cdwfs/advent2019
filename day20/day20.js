/* global aoc */
let aoc20 = function() {
    "use strict";

    function parseInput(text) {
        const allLines = text.split(/\r\n|\n/u).filter(line => line !== "");
        const mapWidth = allLines[0].length - 4;
        const mapHeight = allLines.length - 4;
        let grid = [];
        let portalEnds = {};
        for(let y=2; y<mapHeight+2; ++y) {
            grid[y-2] = [];
            for(let x=2; x<mapWidth+2; ++x) {
                const [mx,my] = [x-2,y-2,];
                const c = allLines[y][x];
                grid[my][mx] = c;
                // Check for portals
                if (c === ".") {
                    const n = allLines[y-1][x];
                    const s = allLines[y+1][x];
                    const w = allLines[y][x-1];
                    const e = allLines[y][x+1];
                    const dz = (mx === 0 || mx === mapWidth-1 || my === 0 || my === mapHeight-1) ? 1 : -1;
                    if ("A" <= n && n <= "Z") {
                        const portal = allLines[y-2][x] + n;
                        if (!portalEnds.hasOwnProperty(portal)) {
                            portalEnds[portal] = [];
                        }
                        portalEnds[portal].push([mx,my,dz,]);
                    }
                    if ("A" <= s && s <= "Z") {
                        const portal = s + allLines[y+2][x];
                        if (!portalEnds.hasOwnProperty(portal)) {
                            portalEnds[portal] = [];
                        }
                        portalEnds[portal].push([mx,my,dz,]);
                    }
                    if ("A" <= w && w <= "Z") {
                        const portal = allLines[y][x-2] + w;
                        if (!portalEnds.hasOwnProperty(portal)) {
                            portalEnds[portal] = [];
                        }
                        portalEnds[portal].push([mx,my,dz,]);
                    }
                    if ("A" <= e && e <= "Z") {
                        const portal = e + allLines[y][x+2];
                        if (!portalEnds.hasOwnProperty(portal)) {
                            portalEnds[portal] = [];
                        }
                        portalEnds[portal].push([mx,my,dz,]);
                    }
                }
            }
        }
        // build portal lookup
        let portals = [];
        let start = null;
        let end = null;
        for(let y=0; y<mapHeight; ++y) {
            portals.push([]);
        }
        for(const [p, ends] of Object.entries(portalEnds)) {
            if (p === "AA") {
                // start of the maze; no end point
                console.assert(ends.length === 1, `found ${ends.length} endpoints for portal ${p} (expected 1)`);
                start = [ ends[0][0], ends[0][1], ];
            } else if (p === "ZZ") {
                // goal; no end point
                console.assert(ends.length === 1, `found ${ends.length} endpoints for portal ${p} (expected 1)`);
                end = [ ends[0][0], ends[0][1], ];
            } else {
                console.assert(ends.length === 2, `found ${ends.length} endpoints for portal ${p} (expected 2)`);
                const [x0,y0,dz0] = ends[0];
                const [x1,y1,dz1] = ends[1];
                portals[y0][x0] = [x1,y1,dz1,p,];
                portals[y1][x1] = [x0,y0,dz0,p,];
            }
        }
        return {
            width: mapWidth,
            height: mapHeight,
            grid: grid,
            portals: portals,
            start: start,
            end: end,
        };
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

    function shortestSolutionLength(map) {
        let seen = {};
        let toVisit = [
            [map.start[0], map.start[1], 0,],
        ];
        while(toVisit.length > 0) {
            const [px,py,steps] = toVisit.shift();
            if (seen[px+"."+py]) {
                continue;
            }
            seen[px+"."+py] = true;
            
            if (px === map.end[0] && py === map.end[1]) {
                return steps;
            }
            
            if (py > 0 && map.grid[py-1][px] === '.') {
                toVisit.push([px,py-1,steps+1,]);
            }
            if (py < map.height-1 && map.grid[py+1][px] === '.') {
                toVisit.push([px,py+1,steps+1,]);
            }
            if (px > 0 && map.grid[py][px-1] === '.') {
                toVisit.push([px-1,py,steps+1,]);
            }
            if (px < map.width-1 && map.grid[py][px+1] === '.') {
                toVisit.push([px+1,py,steps+1,]);
            }

            const pd = map.portals[py][px];
            if (pd) {
                toVisit.push([pd[0], pd[1], steps+1,]);
            }
        }
        throw `nowhere left to visit & haven't found exit yet?`;
    }
    
    function shortestRecursiveSolutionLength(map) {
        let seen = {};
        let toVisit = [
            [map.start[0], map.start[1], 0, 0,],
        ];
        while(toVisit.length > 0) {
            const [px,py,pz,steps] = toVisit.shift();
            if (seen[px+"."+py+"."+pz]) {
                continue;
            }
            seen[px+"."+py+"."+pz] = true;

            if (px === map.end[0] && py === map.end[1] && pz === 0) {
                return steps;
            }
            
            if (py > 0 && map.grid[py-1][px] === '.') {
                toVisit.push([px,py-1,pz,steps+1,]);
            }
            if (py < map.height-1 && map.grid[py+1][px] === '.') {
                toVisit.push([px,py+1,pz,steps+1,]);
            }
            if (px > 0 && map.grid[py][px-1] === '.') {
                toVisit.push([px-1,py,pz,steps+1,]);
            }
            if (px < map.width-1 && map.grid[py][px+1] === '.') {
                toVisit.push([px+1,py,pz,steps+1,]);
            }

            const pd = map.portals[py][px];
            if (pd) {
                if (pz === 0 && pd[2] === -1) {
                    // ignore outer portals at the outermost level
                } else {
                    toVisit.push([pd[0], pd[1], pz + pd[2], steps+1,]);
                }
            }
        }
        throw `nowhere left to visit & haven't found exit yet?`;
    }

    window.onload = function() {
        let text = `\
         A           
         A           
  #######.#########  
  #######.........#  
  #######.#######.#  
  #######.#######.#  
  #######.#######.#  
  #####  B    ###.#  
BC...##  C    ###.#  
  ##.##       ###.#  
  ##...DE  F  ###.#  
  #####    G  ###.#  
  #########.#####.#  
DE..#######...###.#  
  #.#########.###.#  
FG..#########.....#  
  ###########.#####  
             Z       
             Z       `;
        aoc.testCase(shortestSolutionLength, [parseInput(text),], 23);
        aoc.testCase(shortestRecursiveSolutionLength, [parseInput(text),], 26);

        text = `\
                   A               
                   A               
  #################.#############  
  #.#...#...................#.#.#  
  #.#.#.###.###.###.#########.#.#  
  #.#.#.......#...#.....#.#.#...#  
  #.#########.###.#####.#.#.###.#  
  #.............#.#.....#.......#  
  ###.###########.###.#####.#.#.#  
  #.....#        A   C    #.#.#.#  
  #######        S   P    #####.#  
  #.#...#                 #......VT
  #.#.#.#                 #.#####  
  #...#.#               YN....#.#  
  #.###.#                 #####.#  
DI....#.#                 #.....#  
  #####.#                 #.###.#  
ZZ......#               QG....#..AS
  ###.###                 #######  
JO..#.#.#                 #.....#  
  #.#.#.#                 ###.#.#  
  #...#..DI             BU....#..LF
  #####.#                 #.#####  
YN......#               VT..#....QG
  #.###.#                 #.###.#  
  #.#...#                 #.....#  
  ###.###    J L     J    #.#.###  
  #.....#    O F     P    #.#...#  
  #.###.#####.#.#####.#####.###.#  
  #...#.#.#...#.....#.....#.#...#  
  #.#####.###.###.#.#.#########.#  
  #...#.#.....#...#.#.#.#.....#.#  
  #.###.#####.###.###.#.#.#######  
  #.#.........#...#.............#  
  #########.###.###.#############  
           B   J   C               
           U   P   P               `;
        aoc.testCase(shortestSolutionLength, [parseInput(text),], 58);
        // no solution in recursive case

        text = `\
             Z L X W       C                 
             Z P Q B       K                 
  ###########.#.#.#.#######.###############  
  #...#.......#.#.......#.#.......#.#.#...#  
  ###.#.#.#.#.#.#.#.###.#.#.#######.#.#.###  
  #.#...#.#.#...#.#.#...#...#...#.#.......#  
  #.###.#######.###.###.#.###.###.#.#######  
  #...#.......#.#...#...#.............#...#  
  #.#########.#######.#.#######.#######.###  
  #...#.#    F       R I       Z    #.#.#.#  
  #.###.#    D       E C       H    #.#.#.#  
  #.#...#                           #...#.#  
  #.###.#                           #.###.#  
  #.#....OA                       WB..#.#..ZH
  #.###.#                           #.#.#.#  
CJ......#                           #.....#  
  #######                           #######  
  #.#....CK                         #......IC
  #.###.#                           #.###.#  
  #.....#                           #...#.#  
  ###.###                           #.#.#.#  
XF....#.#                         RF..#.#.#  
  #####.#                           #######  
  #......CJ                       NM..#...#  
  ###.#.#                           #.###.#  
RE....#.#                           #......RF
  ###.###        X   X       L      #.#.#.#  
  #.....#        F   Q       P      #.#.#.#  
  ###.###########.###.#######.#########.###  
  #.....#...#.....#.......#...#.....#.#...#  
  #####.#.###.#######.#######.###.###.#.#.#  
  #.......#.......#.#.#.#.#...#...#...#.#.#  
  #####.###.#####.#.#.#.#.###.###.#.###.###  
  #.......#.....#.#...#...............#...#  
  #############.#.#.###.###################  
               A O F   N                     
               A A D   M                     `;
        aoc.testCase(shortestRecursiveSolutionLength, [parseInput(text),], 396);
        
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (map) => {
            return {
                actual: shortestSolutionLength(map),
                expected: 432,
            };
        },
        solvePart2: (map) => {
            return {
                actual: shortestRecursiveSolutionLength(map),
                expected: 5214,
            };
        },
    };
}();
