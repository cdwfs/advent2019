/* global aoc */
let aoc14 = function() {
    "use strict";

    function parseInput(text) {
        const allLines = text.split(/\r\n|\n/u).filter(line => line !== "");
        let reactions = {};
        allLines.forEach(line => {
            const match = line.match(/^(.+) => (\d+) (\w+)$/u);
            const inputs = match[1];
            const outputCount = parseInt(match[2]);
            const outputElem = match[3];
            reactions[outputElem] = {
                outputCount: outputCount,
                inputs: inputs.split(", ").map(input => {
                    const match = input.match(/(\d+) (\w+)/u);
                    return {
                        count: parseInt(match[1]),
                        chemical: match[2],
                    };
                }),
            };
        });
        return reactions;
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

    function reduceCounts(reactions, goalCounts) {
        function addToCounts(counts, elem, count) {
            if (!counts.hasOwnProperty(elem)) {
                counts[elem] = 0;
            }
            counts[elem] += count;
        }
        let counts = JSON.parse(JSON.stringify(goalCounts));
        while(true) {
            let done = true;
            // For each stack of chemicals in the input counts, convert to component elements
            let newCounts = {};
            for(let [chem,count] of Object.entries(counts) ) {
                if (chem === "ORE") {
                    addToCounts(newCounts, chem, count);
                    continue;
                }
                const reaction = reactions[chem];
                // positive counts convert to their components
                if (count > 0) {
                    done = false;
                    const batchCount = Math.ceil(count / reaction.outputCount);
                    count -= batchCount*reaction.outputCount;
                    for(let i=0; i<reaction.inputs.length; ++i) {
                        addToCounts(newCounts, reaction.inputs[i].chemical, batchCount * reaction.inputs[i].count);
                    }
                }
                // if we have enough to undo an entire conversion, make it so
                if (count <= -reaction.outputCount) {
                    done = false;
                    const batchCount = Math.abs(Math.floor(count / reaction.outputCount));
                    count += batchCount*reaction.outputCount;
                    for(let i=0; i<reaction.inputs.length; ++i) {
                        addToCounts(newCounts, reaction.inputs[i].chemical, -batchCount * reaction.inputs[i].count);
                    }
                }
                // Add any leftovers of the output element
                if (count !== 0) {
                    addToCounts(newCounts, chem, count);
                }
            }
            counts = newCounts;
            //console.log(counts);
            if (done) {
                break;
            }
        }
        return counts;
    }
    
    function getOreForOneFuel(reactions) {
        return reduceCounts(reactions, {FUEL: 1,}).ORE;
    }

    function getFuelCountFromOre(reactions, oreCount) {
        let counts = {};
        let lowerFuel = 1;
        let upperFuel = oreCount;
        counts[lowerFuel] = reduceCounts(reactions, {FUEL: lowerFuel,}).ORE;
        counts[upperFuel] = reduceCounts(reactions, {FUEL: upperFuel,}).ORE;
        while(true) {
            const midFuel = Math.floor( (lowerFuel+upperFuel)/2 );
            if (counts.hasOwnProperty(midFuel)) {
                break;
            }
            counts[midFuel] = reduceCounts(reactions, {FUEL: midFuel,}).ORE;
            if (counts[midFuel] > oreCount ) {
                upperFuel = midFuel;
            } else if (counts[midFuel] < oreCount) {
                lowerFuel = midFuel;
            }
        }
        return lowerFuel;
    }
    
    window.onload = function() {
        let text = `10 ORE => 10 A
1 ORE => 1 B
7 A, 1 B => 1 C
7 A, 1 C => 1 D
7 A, 1 D => 1 E
7 A, 1 E => 1 FUEL`;
        aoc.testCase(getOreForOneFuel, [parseInput(text),], 31);

        text = `9 ORE => 2 A
8 ORE => 3 B
7 ORE => 5 C
3 A, 4 B => 1 AB
5 B, 7 C => 1 BC
4 C, 1 A => 1 CA
2 AB, 3 BC, 4 CA => 1 FUEL`;
        aoc.testCase(getOreForOneFuel, [parseInput(text),], 165);

        text = `157 ORE => 5 NZVS
165 ORE => 6 DCFZ
44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
179 ORE => 7 PSHF
177 ORE => 5 HKGWZ
7 DCFZ, 7 PSHF => 2 XJWVT
165 ORE => 2 GPVTF
3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`;
        aoc.testCase(getOreForOneFuel, [parseInput(text),], 13312);
        aoc.testCase(getFuelCountFromOre, [parseInput(text),1000000000000,], 82892753);

        text = `2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG
17 NVRVD, 3 JNWZP => 8 VPVL
53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL
22 VJHF, 37 MNCFX => 5 FWMGM
139 ORE => 4 NVRVD
144 ORE => 7 JNWZP
5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC
5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV
145 ORE => 6 MNCFX
1 NVRVD => 8 CXFTF
1 VJHF, 6 MNCFX => 4 RFSQX
176 ORE => 6 VJHF`;
        aoc.testCase(getOreForOneFuel, [parseInput(text),], 180697);
        aoc.testCase(getFuelCountFromOre, [parseInput(text),1000000000000,], 5586022);

        text = `171 ORE => 8 CNZTR
7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
114 ORE => 4 BHXH
14 VRPVC => 6 BMBT
6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
5 BMBT => 4 WPTQ
189 ORE => 9 KTJDG
1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
12 VRPVC, 27 CNZTR => 2 XDBXC
15 KTJDG, 12 BHXH => 5 XCVML
3 BHXH, 2 VRPVC => 7 MZWV
121 ORE => 7 VRPVC
7 XCVML => 6 RJRHP
5 BHXH, 4 VRPVC => 5 LTCX`;
        aoc.testCase(getOreForOneFuel, [parseInput(text),], 2210736);
        aoc.testCase(getFuelCountFromOre, [parseInput(text),1000000000000,], 460664);

        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (reactions) => {
            return {
                actual: getOreForOneFuel(reactions),
                expected: 220019,
            };
        },
        solvePart2: (reactions) => {
            return {
                actual: getFuelCountFromOre(reactions, 1000000000000),
                expected: 5650230,
            };
        },
    };
}();
