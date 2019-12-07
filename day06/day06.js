/* global aoc */
let aoc06 = function() {
    "use strict";

    const setDepth = function(orbitTree, bodyDepths, body, depth) {
        if (bodyDepths.hasOwnProperty(body)) {
            throw `${body} already present in depth array`;
        }
        bodyDepths[body] = depth;
        orbitTree[body].children.forEach( child => {
            setDepth(orbitTree, bodyDepths, child, depth+1);
        });
    };

    let buildOrbitTree = function(pairs) {
        let orbitTree = {};
        pairs.forEach( (pair) => {
            const parent = pair.parent;
            const child = pair.child;
            if (!orbitTree.hasOwnProperty(parent)) {
                orbitTree[parent] = {children: [],};
            }
            if (!orbitTree.hasOwnProperty(child)) {
                orbitTree[child] = {children: [],};
            }
            orbitTree[parent].children.push(child);
            orbitTree[child].parent = parent;
        });
        return orbitTree;
    };
    
    let countOrbits = function(pairs) {
        const orbitTree = buildOrbitTree(pairs);
        
        let bodyDepths = {};
        setDepth(orbitTree, bodyDepths, "COM", 0);
        return Object.entries(bodyDepths).reduce( (sum, entry) => sum + entry[1], 0);
    };

    let shortestPathLength = function(pairs) {
        const orbitTree = buildOrbitTree(pairs);

        let pathToRoot = function(body) {
            let path = [];
            let b = body;
            while (b !== "COM") {
                path.push(b);
                b = orbitTree[b].parent;
            }
            return path;
        };
        let pathYOU = pathToRoot("YOU");
        let pathSAN = pathToRoot("SAN");
        while(pathYOU[pathYOU.length-1] === pathSAN[pathSAN.length-1]) {
            pathYOU.pop();
            pathSAN.pop();
        }
        return pathYOU.length + pathSAN.length - 2;
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/u);
            const re = /(\w+)\)(\w+)/u;
            const pairs = allLines.map( line => {
                const match = line.match(re);
                if (match) {
                    return {parent: match[1], child: match[2],};
                } else {
                    return "BLURG";
                }
            });
            const result = callback(pairs);
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
        let pairs = [
            {parent:"COM",child:"B",},
            {parent:"B",child:"C",},
            {parent:"C",child:"D",},
            {parent:"D",child:"E",},
            {parent:"E",child:"F",},
            {parent:"B",child:"G",},
            {parent:"G",child:"H",},
            {parent:"D",child:"I",},
            {parent:"E",child:"J",},
            {parent:"J",child:"K",},
            {parent:"K",child:"L",},
        ];
        aoc.testCase(countOrbits, [pairs,], 42);
        // Part 2 tests
        pairs = [
            {parent:"COM",child:"B",},
            {parent:"B",child:"C",},
            {parent:"C",child:"D",},
            {parent:"D",child:"E",},
            {parent:"E",child:"F",},
            {parent:"B",child:"G",},
            {parent:"G",child:"H",},
            {parent:"D",child:"I",},
            {parent:"E",child:"J",},
            {parent:"J",child:"K",},
            {parent:"K",child:"L",},
            {parent:"K",child:"YOU",},
            {parent:"I",child:"SAN",},
        ];
        aoc.testCase(shortestPathLength, [pairs,], 4);
        
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (pairs) => {
            return {
                actual: countOrbits(pairs),
                expected: 158090,
            };
        },
        solvePart2: (pairs) => {
            return {
                actual: shortestPathLength(pairs),
                expected: 241,
            };
        },
    };
}();

