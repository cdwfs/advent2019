/* global aoc */
let aoc22 = function() {
    "use strict";

    function parseInput(text) {
        const allLines = text.split(/\r\n|\n/u).filter(line => line !== "");
        const cutRE = /^cut (-?\d+)$/u;
        const incRE = /^deal with increment (\d+)$/u;
        const newRE = /^deal into new stack$/u;
        const steps = [];
        for(const line of allLines) {
            let match = line.match(cutRE);
            if (match) {
                steps.push(["cut", parseInt(match[1]),]);
            }
            match = line.match(incRE);
            if (match) {
                steps.push(["inc", parseInt(match[1]),]);
            }
            match = line.match(newRE);
            if (match) {
                steps.push(["new",]);
            }
        }
        return steps;
    }

    function processFile(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const fileContents = reader.result;
            const steps = parseInput(fileContents);
            const result = callback(steps);
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

    function shuffleDeck(deck, steps) {
        for(const [step, arg] of steps) {
            if (step === "new") {
                deck.reverse();
            } else if (step === "cut") {
                deck = deck.slice(arg).concat(deck.slice(0,arg));
            } else if (step === "inc") {
                let newDeck = [];
                for(let i=0; i<deck.length; ++i) {
                    newDeck[(i*arg) % deck.length] = deck[i];
                }
                deck = newDeck;
            } else {
                throw `Unrecognized step ${step}`;
            }
        }
        return deck;
    }
    
    function shuffleAndFindCard(steps, cardCount, cardToFind) {
        let deck = [];
        for(let i=0; i<cardCount; ++i) {
            deck.push(i);
        }
        deck = shuffleDeck(deck, steps);
        return deck.findIndex(c => c === cardToFind);
    }

    function repeatShuffleAndFindNthCard(steps, cardCount, shuffleCount, targetCardIndex) {
        // track Nth card through each operation in reverse.
        const L = cardCount;
        let revSteps = steps.slice();
        revSteps.reverse();
        // For each "inc" step, precompute the argument that lets us efficiently invert the operation.
        for(let s=0; s<revSteps.length; ++s) {
            if (revSteps[s][0] === "inc") {
                let v=0, i=0;
                const arg = revSteps[s][1];
                while(i !== 1) {
                    v += Math.ceil((L-i) / arg);
                    i = arg - ((L-i) % arg);
                }
                revSteps[s].push(v);
            }
        }
        // Track which position the target card was in after each shuffle
        let N = targetCardIndex;
        for(let s=0; s<shuffleCount; ++s) {
            if ((s % 1000) === 0) {
                console.log(`${s}: ${N}`);
            }
            if (s > 0 && N === targetCardIndex) {
                throw `cycle found after {s} shuffles`;
            }
            for(const [step,arg,revArg] of revSteps) {
                if (N < 0 || N >= L) {
                    throw `N ${N} is out of range [0..${L})`;
                }
                if (step === "new") {
                    N = (L-1 - N);
                } else if (step === "cut") {
                    N = (N+L+arg) % L;
                } else if (step === "inc") {
                    N = (N*revArg) % L;
                }
            }
        }
        return N;
    }
    
    window.onload = function() {
        // part 1
        const deck10 = [0,1,2,3,4,5,6,7,8,9,];
        let steps = [
            ["new",],
        ];
        aoc.testCase(shuffleDeck, [deck10.slice(), steps,], [9,8,7,6,5,4,3,2,1,0,], aoc.compareArrays);

        steps = [
            ["cut", 3,],
        ];
        aoc.testCase(shuffleDeck, [deck10.slice(), steps,], [3,4,5,6,7,8,9,0,1,2,], aoc.compareArrays);
        steps = [
            ["cut", -4,],
        ];
        aoc.testCase(shuffleDeck, [deck10.slice(), steps,], [6,7,8,9,0,1,2,3,4,5,], aoc.compareArrays);

        steps = [
            ["inc", 3,],
        ];
        aoc.testCase(shuffleDeck, [deck10.slice(), steps,], [0,7,4,1,8,5,2,9,6,3,], aoc.compareArrays);

        let text = `\
deal with increment 7
deal into new stack
deal into new stack`;
        let target = [0,3,6,9,2,5,8,1,4,7,];
        aoc.testCase(shuffleDeck, [deck10.slice(), parseInput(text),], target, aoc.compareArrays);
        for(let i=0; i<target.length; ++i) {
            aoc.testCase(repeatShuffleAndFindNthCard, [parseInput(text), 10, 1, i,], target[i]);
        }

        text = `\
cut 6
deal with increment 7
deal into new stack`;
        target = [3,0,7,4,1,8,5,2,9,6,];
        aoc.testCase(shuffleDeck, [deck10.slice(), parseInput(text),], target, aoc.compareArrays);
        for(let i=0; i<target.length; ++i) {
            aoc.testCase(repeatShuffleAndFindNthCard, [parseInput(text), 10, 1, i,], target[i]);
        }

        text = `\
deal with increment 7
deal with increment 9
cut -2`;
        target = [6,3,0,7,4,1,8,5,2,9,];
        aoc.testCase(shuffleDeck, [deck10.slice(), parseInput(text),], target, aoc.compareArrays);
        for(let i=0; i<target.length; ++i) {
            aoc.testCase(repeatShuffleAndFindNthCard, [parseInput(text), 10, 1, i,], target[i]);
        }

        text = `\
deal into new stack
cut -2
deal with increment 7
cut 8
cut -4
deal with increment 7
cut 3
deal with increment 9
deal with increment 3
cut -1`;
        target = [9,2,5,8,1,4,7,0,3,6,];
        aoc.testCase(shuffleDeck, [deck10.slice(), parseInput(text),], target, aoc.compareArrays);
        for(let i=0; i<target.length; ++i) {
            aoc.testCase(repeatShuffleAndFindNthCard, [parseInput(text), 10, 1, i,], target[i]);
        }
        
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (steps) => {
            return {
                actual: shuffleAndFindCard(steps, 10007, 2019),
                expected: 3749,
            };
        },
        solvePart2: (steps) => {
            return {
                actual: repeatShuffleAndFindNthCard(steps, 119315717514047, 101741582076661, 2020),
                expected: 5214,
            };
        },
    };
}();
