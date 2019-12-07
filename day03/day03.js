/* globals aoc */
let aoc03 = function() {
    "use strict";

    let manhattanDistance = function(x1, y1, x2, y2) {
        return Math.abs(x2-x1) + Math.abs(y2-y1);
    };

    let getCircuitRanges = function(circuit) {
        // extract and sort unique endpoints, sorted by L/R and U/D segments
        let endpointsLR = [];
        let endpointsUD = [];
        circuit.forEach( (segment) => {
            if (segment.isLR) {
                endpointsLR.push(segment.xL);
                endpointsLR.push(segment.xR);
            } else {
                endpointsUD.push(segment.yD);
                endpointsUD.push(segment.yU);
            }
        });
        endpointsLR = aoc.uniqueArray(endpointsLR);
        endpointsUD = aoc.uniqueArray(endpointsUD);
        endpointsLR.sort( (a,b) => a-b ); // sort() with no arg defaults to lexical, even for numbers :(
        endpointsUD.sort( (a,b) => a-b );
        // Create arrays of ranges between each set of endpoints.
        // Keep track of the range that starts at 0.
        let i;
        let iLR = null, iUD = null;
        let rangesLR = [];
        for(i=0; i<endpointsLR.length-1; ++i) {
            rangesLR.push({
                min: endpointsLR[i],
                max: endpointsLR[i+1],
                values: [],
            });
            if (endpointsLR[i] === 0) {
                iLR = i;
            }
        }
        rangesLR.push({min: endpointsLR[endpointsLR.length-1], max: Infinity, values: null,});
        
        let rangesUD = [];
        for(i=0; i<endpointsUD.length-1; ++i) {
            rangesUD.push({
                min: endpointsUD[i],
                max: endpointsUD[i+1],
                values: [],
            });
            if (endpointsUD[i] === 0) {
                iUD = i;
            }
        }
        rangesUD.push({min: endpointsUD[endpointsUD.length-1], max: Infinity, values: null,});

        console.assert(typeof iLR === "number", "no rangeLR with min of 0?!?");
        console.assert(typeof iUD === "number", "no rangeUD with min of 0?!?");
        // Insert each segment's constant value into the appropriate ranges
        let px = 0, py = 0;
        circuit.forEach( (segment) => {
            if (segment.isLR) {
                console.assert(segment.x0 === px, `Segment starts at x=${segment.x0} (expected ${px}`);
                console.assert(segment.y === py, `Segment starts at y=${segment.y} (expected ${py}`);
                console.assert(rangesLR[iLR].min === segment.x0, `rangesLR[${iLR}] min ${rangesLR[iLR].min} != segment.x0 ${segment.x0}`);
                do {
                    if (segment.x0 < segment.x1) {
                        rangesLR[iLR++].values.push(segment.y); // R segment
                    } else {
                        rangesLR[--iLR].values.push(segment.y); // L segment
                    }
                } while(rangesLR[iLR].min !== segment.x1);
                px = segment.x1;
            } else {
                console.assert(segment.x === px, `Segment starts at x=${segment.x} (expected ${px}`);
                console.assert(segment.y0 === py, `Segment starts at y=${segment.y0} (expected ${py}`);
                console.assert(rangesUD[iUD].min === segment.y0, `rangesUD[${iUD}] min ${rangesUD[iUD].min} != segment.y0 ${segment.y0}`);
                do {
                    if (segment.y0 < segment.y1) {
                        rangesUD[iUD++].values.push(segment.x); // U segment
                    } else {
                        rangesUD[--iUD].values.push(segment.x); // D segment
                    }
                } while(rangesUD[iUD].min !== segment.y1);
                py = segment.y1;
            }
        });
        return {
            lr: rangesLR,
            ud: rangesUD,
        };
    };

    let findRangeContainingPoint = function(ranges, pt) {
        // binary search
        let lo = 0, hi = ranges.length-1;
        while(lo <= hi) {
            let mid = Math.floor( (lo+hi)/2 );
            if (pt < ranges[mid].min) {
                hi = mid - 1;
            } else if (ranges[mid].max < pt) {
                lo = mid + 1;
            } else {
                return ranges[mid];
            }
        }
        return {min: -Infinity, max: Infinity, values: null,};
    };

    let findAllIntersections = function(segments0, segments1) {
        //let ranges0 = getCircuitRanges(segments0);
        let ranges1 = getCircuitRanges(segments1);

        // Find all intersection points between segments0 and ranges1
        let intersections = [];
        segments0.forEach( (segment) => {
            if (segment.isLR) {
                let r = findRangeContainingPoint(ranges1.ud, segment.y);
                (r.values || []).forEach( (x) => {
                    if (segment.xL <= x && x <= segment.xR) {
                        if (x !== 0 || segment.y !== 0) { // ignore intersections at the origin
                            intersections.push({x: x, y: segment.y,});
                        }
                    }
                });
            } else {
                let r = findRangeContainingPoint(ranges1.lr, segment.x);
                (r.values || []).forEach( (y) => {
                    if (segment.yD <= y && y <= segment.yU) {
                        if (segment.x !== 0 || y !== 0) { // ignore intersections at the origin
                            intersections.push({x: segment.x, y: y,});
                        }
                    }
                });
            }
        });
        return intersections;
    };
    
    let findClosestIntersectionToOrigin = function(segments0, segments1) {
        let intersections = findAllIntersections(segments0, segments1);
        
        // TODO: look up the functional way to do this
        let minDist = Infinity;
        intersections.forEach( (intersection) => {
            let dist = manhattanDistance(0, 0, intersection.x, intersection.y);
            if (dist < minDist) {
                minDist = dist;
            }
        });
        return minDist;
    };

    let computeLengthsToAllIntersections = function(segments, circuitIndex, ix, iy) {
        // Compute lengths along each circuit to each intersection
        let dist = 0;
        segments.forEach( (segment) => {
            if (segment.isLR) {
                // Check all intersections along segment.y
                (iy[segment.y] || []).forEach( (intersection) => {
                    if (intersection.dist[circuitIndex] > 0) {
                        return; // already found a shorter path to this intersection along this circuit
                    }
                    if (segment.xL <= intersection.x && intersection.x <= segment.xR) {
                        intersection.dist[circuitIndex] = dist + Math.abs(segment.x0 - intersection.x);
                    }
                });
                dist += Math.abs(segment.x1 - segment.x0);
            } else {
                // Check all intersections along segment.x
                (ix[segment.x] || []).forEach( (intersection) => {
                    if (intersection.dist[circuitIndex] > 0) {
                        return; // already found a shorter path to this intersection along this circuit
                    }
                    if (segment.yD <= intersection.y && intersection.y <= segment.yU) {
                        intersection.dist[circuitIndex] = dist + Math.abs(segment.y0 - intersection.y);
                    }
                });
                dist += Math.abs(segment.y1 - segment.y0);
            }
        });
    };
    
    let findShortestCombinedLengthToIntersection = function(segments0, segments1) {
        let intersections = findAllIntersections(segments0, segments1);
        // Generate lookup tables for intersections by x and y coordinates
        let ix = [];
        let iy = [];
        intersections.forEach( (intersection) => {
            if (!ix.hasOwnProperty(intersection.x)) {
                ix[intersection.x] = [intersection,];
            } else {
                ix[intersection.x].push(intersection);
            }
            if (!iy.hasOwnProperty(intersection.y)) {
                iy[intersection.y] = [intersection,];
            } else {
                iy[intersection.y].push(intersection);
            }
            intersection.dist = [0, 0,];
        });

        // Compute lengths to all intersections along both circuits
        computeLengthsToAllIntersections(segments0, 0, ix, iy);
        computeLengthsToAllIntersections(segments1, 1, ix, iy);

        // Find the intersection with the shortest total distance
        let minDist = Infinity;
        intersections.forEach( (intersection) => {
            console.assert(intersection.dist[0] > 0, "intersection not reached?!?");
            console.assert(intersection.dist[1] > 0, "intersection not reached?!?");
            let distSum = intersection.dist[0] + intersection.dist[1];
            minDist = Math.min(minDist, distSum);
        });
        
        return minDist;
    };
    
    let movesToSegments = function(moves) {
        let segments = [];
        let px = 0, py = 0;
        moves.forEach( (move) => {
            if (move[0] === "L") {
                let len = parseInt(move.substring(1));
                segments.push({isLR: true, x0: px, x1: px-len, xL: px-len, xR: px, y: py,});
                px -= len;
            } else if (move[0] === "R") {
                let len = parseInt(move.substring(1));
                segments.push({isLR: true, x0: px, x1: px+len, xL: px, xR: px+len, y: py,});
                px += len;
            } else if (move[0] === "D") {
                let len = parseInt(move.substring(1));
                segments.push({isLR: false, x: px, y0: py, y1: py-len, yD: py-len, yU: py,});
                py -= len;
            } else if (move[0] === "U") {
                let len = parseInt(move.substring(1));
                segments.push({isLR: false, x: px, y0: py, y1: py+len, yD: py, yU: py+len,});
                py += len;
            } else {
                //throw {msg: "invalid move direction (must be in [L,R,U,D])", move: move,};
                throw `move ${move} has invalid direction (must be in [L,R,U,D])`;
            }
        });
        return segments;
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/u);
            let circuits = [];
            allLines.forEach( (line) => {
                if (line === "") {
                    return; // empty line
                }
                let allMoves = line.split(",");
                let allSegments = movesToSegments(allMoves);
                circuits.push(allSegments);
            });

            let result = callback(circuits);
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
        // Part 1 tests
        aoc.testCase(findClosestIntersectionToOrigin,
                     [
                         movesToSegments(["R8","U5","L5","D3",]),
                         movesToSegments(["U7","R6","D4","L4",]),
                     ],
                     6);
        aoc.testCase(findClosestIntersectionToOrigin,
                     [
                         movesToSegments(["R75","D30","R83","U83","L12","D49","R71","U7","L72",]),
                         movesToSegments(["U62","R66","U55","R34","D71","R55","D58","R83",]),
                     ],
                     159);
        aoc.testCase(findClosestIntersectionToOrigin,
                     [
                         movesToSegments(["R98","U47","R26","D63","R33","U87","L62","D20","R33","U53","R51",]),
                         movesToSegments(["U98","R91","D20","R16","D67","R40","U7","R15","U6","R7",]),
                     ],
                     135);
        // Part 2 tests
        aoc.testCase(findShortestCombinedLengthToIntersection,
                     [
                         movesToSegments(["R8","U5","L5","D3",]),
                         movesToSegments(["U7","R6","D4","L4",]),
                     ],
                     30);
        aoc.testCase(findShortestCombinedLengthToIntersection,
                     [
                         movesToSegments(["R75","D30","R83","U83","L12","D49","R71","U7","L72",]),
                         movesToSegments(["U62","R66","U55","R34","D71","R55","D58","R83",]),
                     ],
                     610);
        aoc.testCase(findShortestCombinedLengthToIntersection,
                     [
                         movesToSegments(["R98","U47","R26","D63","R33","U87","L62","D20","R33","U53","R51",]),
                         movesToSegments(["U98","R91","D20","R16","D67","R40","U7","R15","U6","R7",]),
                     ],
                     410);
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (circuits) => {
            return {
                actual: findClosestIntersectionToOrigin(circuits[0], circuits[1]),
                expected: 2180,
            };
        },
        solvePart2: (circuits) => {
            return {
                actual: findShortestCombinedLengthToIntersection(circuits[0], circuits[1]),
                expected: 112316,
            };
        },
    };
}();
