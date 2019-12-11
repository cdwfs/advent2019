/* global aoc */
let aoc10 = function() {
    "use strict";

    const getAsteroidLocations = function(map) {
        let asteroids = [];
        for(let y=0; y<map.height; ++y) {
            for(let x=0; x<map.width; ++x) {
                if (map.grid[y][x] === "#") {
                    asteroids.push([x,y,]);
                }
            }
        }
        return asteroids;
    };

    const queryAsteroidsFromBase = function(asteroids, base) {
        let infos = [];
        asteroids.forEach( other => {
            if (!aoc.compareArrays(base, other)) {
                infos.push({
                    loc: other,
                    angle: Math.atan2(-(other[0] - base[0]), other[1] - base[1]),
                    distance: aoc.manhattanDistance(base[0], base[1], other[0], other[1]),
                });
            }
        });
        return infos;
    };
    
    // Returns an array of [x,y,#visibleAsteroids]
    const findBestStationLocation = function(map) {
        const asteroids = getAsteroidLocations(map);
        asteroids.forEach( base => {
            const infos = queryAsteroidsFromBase(asteroids, base);
            const angles = infos.map(elem => elem.angle);
            base.push(aoc.uniqueArray(angles).length);
        });
        return asteroids.reduce( (best, current) => (current[2] > best[2]) ? current : best);
    };

    const findLocationOfNthZappedAsteroid = function(map, n) {
        const base = findBestStationLocation(map).slice(0,2);
        const asteroids = getAsteroidLocations(map);
        if (asteroids.length < n) {
            throw `can't find ${n}th zapped asteroid when the map only has ${asteroids.length} asteroids!`;
        }
        let infos = queryAsteroidsFromBase(asteroids, base);
        infos = infos.sort( (lhs, rhs) => {
            if (lhs.angle < rhs.angle) {
                return -1;
            } else if (lhs.angle > rhs.angle) {
                return 1;
            } else {
                // break ties by distance (closest first)
                if (lhs.distance < rhs.distance) {
                    return -1;
                } else if (lhs.distance > rhs.distance) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
        let zapCount = 0;
        while (infos.length > 0) {
            let survivors = [];
            let lastZapAngle = NaN;
            for(let i=0; i<infos.length; ++i) {
                if (infos[i].angle !== lastZapAngle) {
                    console.log(`${zapCount+1}: ${infos[i].loc[0]}, ${infos[i].loc[1]}`);
                    lastZapAngle = infos[i].angle;
                    if (++zapCount === n) {
                        return infos[i].loc[0]*100 + infos[i].loc[1];
                    }
                } else {
                    survivors.push(infos[i]);
                }
            }
            infos = survivors;
        }
        console.assert("Shouldn't get here?");
    };
    
    const parseMap = function(text) {
        const allLines = text.split(/\r\n|\n/u);
        return {
            grid: allLines.map( line => line.split("")),
            width: allLines[0].length,
            height: allLines.length,
        };
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const fileContents = reader.result;
            const map = parseMap(fileContents);
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
    };

    window.onload = function() {
        // part 1
        let text =`.#..#
.....
#####
....#
...##`;
        aoc.testCase(findBestStationLocation, [parseMap(text),], [3,4,8,], aoc.compareArrays);
        
        text = `......#.#.
#..#.#....
..#######.
.#.#.###..
.#..#.....
..#....#.#
#..#....#.
.##.#..###
##...#..#.
.#....####`;
        aoc.testCase(findBestStationLocation, [parseMap(text),], [5,8,33,], aoc.compareArrays);
        
        text = `#.#...#.#.
.###....#.
.#....#...
##.#.#.#.#
....#.#.#.
.##..###.#
..#...##..
..##....##
......#...
.####.###.`;
        aoc.testCase(findBestStationLocation, [parseMap(text),], [1,2,35,], aoc.compareArrays);

        text = `.#..#..###
####.###.#
....###.#.
..###.##.#
##.##.#.#.
....###..#
..#.#..#.#
#..#.#.###
.##...##.#
.....#.#..`;
        aoc.testCase(findBestStationLocation, [parseMap(text),], [6,3,41,], aoc.compareArrays);

        text = `.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##`;
        aoc.testCase(findBestStationLocation, [parseMap(text),], [11,13,210,], aoc.compareArrays);
        // part 2
        aoc.testCase(findLocationOfNthZappedAsteroid, [parseMap(text), 200,], 802);
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (map) => {
            return {
                actual: findBestStationLocation(map)[2],
                expected: 282,
            };
        },
        solvePart2: (map) => {
            return {
                actual: findLocationOfNthZappedAsteroid(map, 200),
                expected: 1008,
            };
        },
    };
}();
