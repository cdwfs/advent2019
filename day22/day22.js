/* global aoc, BigInt */
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

    // Compute the multiplicative modulo inverse of x -- that is, 1/x mod m.
    function modinv(x, m) {
        if (typeof(x) === "bigint" && typeof(m) === "bigint") {
            return aoc.modpow(x, m-2n, m);
        } else {
            return aoc.modpow(x, m-2, m);
        }
    }

    function repeatShuffleAndFindNthCard(steps, cardCount, shuffleCount, targetCardIndex) {
        const L = BigInt(cardCount);
        // Each deck state is representable as [start, increment] where all math is mod deck size L.
        // Each of the three shuffle operations can be representated as operations on the [start, increment] pair.
        // We can concatenate several steps down to a single [start, increment].
        let [start, inc] = [0n,1n,];
        for(const [step, arg] of steps) {
            const N = BigInt(arg || 0);
            if (step === "new") {
                [start, inc] = [
                    aoc.mod(start - inc, L),
                    aoc.mod(-inc, L),
                ];
            } else if (step === "cut") {
                start = aoc.mod(start + inc * N, L);
            } else if (step === "inc") {
                const X = modinv(N, L);
                inc = aoc.mod(X*inc, L);
            } else {
                throw `Unrecognized step ${step}`;
            }
            console.assert(start >= 0n && start < L, `start out of range`);
            console.assert(inc >= 0n && inc < L, `inc out of range`);
        }
        // Now to repeat for a huge number of shuffles.
        const R = BigInt(shuffleCount);
        [start, inc] = [
            aoc.mod(start * (1n - aoc.modpow(inc, R, L)) * modinv(aoc.mod(1n-inc, L), L), L),
            aoc.modpow(inc, R, L),
        ];
        console.assert(start >= 0n && start < L, `start out of range`);
        console.assert(inc >= 0n && inc < L, `inc out of range`);
        // Compute the index of the target slot
        const T = BigInt(targetCardIndex);
        return parseInt(aoc.mod(start + T*inc, L));
    }
    
    window.onload = function() {
        // mod() unit tests
        aoc.testCase(aoc.mod, [55, 10,], 5);
        aoc.testCase(aoc.mod, [10, 10,], 0);
        aoc.testCase(aoc.mod, [-1, 10,], 9);
        aoc.testCase(aoc.mod, [-10, 10,], 0);
        aoc.testCase(aoc.mod, [-10n, 10n,], 0n);
        // modpow() unit tests
        aoc.testCase(aoc.modpow, [2,4,10,], 6);
        aoc.testCase(aoc.modpow, [79n, 119315717514047n-2n, 119315717514047n,], 3020651076305n);
        aoc.testCase(aoc.modpow, [79, 119315717514047-2, 119315717514047,], 3020651076305);
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

        text = `\
cut 6
deal with increment 7
deal into new stack`;
        target = [3,0,7,4,1,8,5,2,9,6,];
        aoc.testCase(shuffleDeck, [deck10.slice(), parseInput(text),], target, aoc.compareArrays);

        text = `\
deal with increment 7
deal with increment 9
cut -2`;
        target = [6,3,0,7,4,1,8,5,2,9,];
        aoc.testCase(shuffleDeck, [deck10.slice(), parseInput(text),], target, aoc.compareArrays);

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

        // part 2
        const deck11 = [0,1,2,3,4,5,6,7,8,9,10,]; // needs a new deck with prime length
        text = `\
deal with increment 7
deal into new stack
deal into new stack`;
        target = [0,8,5,2,10,7,4,1,9,6,3,];
        aoc.testCase(shuffleDeck, [deck11.slice(), parseInput(text),], target, aoc.compareArrays);
        for(let i=0; i<target.length; ++i) {
            aoc.testCase(repeatShuffleAndFindNthCard, [parseInput(text), target.length, 1, i,], target[i]);
        }

        text = `\
cut 6
deal with increment 7
deal into new stack`;
        target = [9,1,4,7,10,2,5,8,0,3,6,];

        for(let i=0; i<target.length; ++i) {
            aoc.testCase(repeatShuffleAndFindNthCard, [parseInput(text), target.length, 1, i,], target[i]);
        }
        
        text = `\
deal with increment 7
deal with increment 9
cut -2`;
        target = [8,4,0,7,3,10,6,2,9,5,1,];

        for(let i=0; i<target.length; ++i) {
            aoc.testCase(repeatShuffleAndFindNthCard, [parseInput(text), target.length, 1, i,], target[i]);
        }
        target = [9,3,8,2,7,1,6,0,5,10,4,];
        for(let i=0; i<target.length; ++i) {
            aoc.testCase(repeatShuffleAndFindNthCard, [parseInput(text), target.length, 2, i,], target[i]);
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
        target = shuffleDeck(deck11.slice(), parseInput(text));
        for(let i=0; i<target.length; ++i) {
            aoc.testCase(repeatShuffleAndFindNthCard, [parseInput(text), target.length, 1, i,], target[i]);
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
                expected: 77225522112241,
            };
        },
    };
}();
