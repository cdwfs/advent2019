/* global BigInt */
let aoc = function() {
    "use strict";
    return {
        // Run func(...args) and compare result to expected using compareFunc, modifying #testResults HTML on failure.
        testCase: function(func, args, expected, compareFunc = (a,b) => a === b) {
            let actual = func(...args); // spread syntax!
            if (!compareFunc(actual, expected)) {
                document.querySelector("#testResults").innerHTML = `TEST FAILURE:<BR> ${func.name}(${args}) is ${actual}<BR>(expected ${expected})`;
                throw "Unit test failure";
            }
        },

        manhattanDistance: function(x1, y1, x2, y2) {
            return Math.abs(x2-x1) + Math.abs(y2-y1);
        },

        // Compares two arrays by value for equality
        compareArrays: function(arr1, arr2) {
            return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
        },
        
        // Returns a copy of an array with duplicate elements removed. Original order is not necessarily preserved.
        uniqueArray: function(arr) {
            let j = {};
            arr.forEach( function(v) {
                j[v+ '::' + typeof v] = v;
            });
            return Object.keys(j).map(function(v){
                return j[v];
            });
        },

        // Returns a pre-primed coroutine from f(...args).
        // f must be a function*(). It will be run until the first yield
        // statement before it returns.
        coroutine: function(f, args) {
            let o = f(...args); // instantiate coroutine
            o.next(); // execute until first yield
            return x => o.next(x);
        },

        gcd: function(...args) {
            const gcd2 = function(a,b) {
                a = Math.abs(a);
                b = Math.abs(b);
                while(b > 0) {
                    const t = b;
                    b = a % b;
                    a = t;
                }
                return a;
            };
            return args.reduce( (result, n) => gcd2(result, n) );
        },
        
        lcm: function(...args) {
            const lcm2 = (a,b) => Math.abs(a*b) / aoc.gcd(a,b);
            return args.reduce( (result, n) => lcm2(result, n) );
        },

        // isHigherFunc(a,b) returns true if A is higher priority than B.
        createPriorityQueue: function(isHigherFunc) {
            const baseIndex = 1;
            let isHigher = isHigherFunc;
            let elems = [null,];
            let size = () => elems.length - baseIndex;
            let isEmpty = () => size() <= 0;
            let parent = (i) => Math.floor(i/2);
            let heapify = function(i) {
                // Assumes i has already been biased by baseIndex.
                let val = elems[i];
                while (i <= parent(size())) {
                    // Compare to highest-priority child
                    let child = 2*i;
                    if (child < size() && isHigher(elems[child+1], elems[child])) {
                        ++child;
                    }
                    if (isHigher(val, elems[child])) {
                        break;
                    }
                    elems[i] = elems[child];
                    i = child;
                }
                elems[i] = val;
            };
            let push = function(...es) {
                for(let e of es) {
                    let i = elems.length;
                    elems.push(e);
                    while (i > baseIndex) {
                        const p = parent(i);
                        if (isHigher(elems[p], e)) {
                            break;
                        }
                        elems[i] = elems[p];
                        i = p;
                    }
                    elems[i] = e;
                    //validate();
                }
            };
            let peek = function() {
                if (isEmpty()) {
                    throw "Can't peek an empty heap!";
                }
                return elems[baseIndex];
            };
            let pop = function() {
                if (isEmpty()) {
                    throw "Can't pop an empty heap!";
                }
                let top = elems[baseIndex];
                let back = elems.pop();
                if (!isEmpty()) {
                    elems[baseIndex] = back;
                    heapify(baseIndex);
                }
                //validate();
                return top;
            };
            let validate = function() {
                for(let i=baseIndex+1; i<elems.length; ++i) {
                    if (isHigher(elems[i], elems[parent(i)])) {
                        throw `PQ invariant failure!`;
                    }
                }
            };
            return {
                size: size,
                empty: isEmpty,
                push: push,
                peek: peek,
                pop: pop,
                validate: validate,
            };
        },

        // Like a % b, but works if a is negative.
        // e.g. -1 % 10 is -1, but mod(-1,10) is 9.
        mod: function(a,b) {
            const m = a % b;
            return (m < 0) ? m+b : m;
        },

        // Compute pow(a,b) mod m. a,b, and m must all be numbers or all be bigints
        modpow: function(a,b,m) {
            function bigpow(a, b, m) {
                if (b < 0n) {
                    throw `exponent ${b} must be >= 0`;
                } else if (b === 0n) {
                    return 1n;
                } else if (b === 1n) {
                    return a;
                } else if (b % 2n === 0n) {
                    return bigpow((a * a) % m, b / 2n, m);
                } else {
                    return (a * bigpow((a * a) % m, (b - 1n) / 2n, m)) % m;
                }
            }
            if (typeof(a) === "bigint" && typeof(b) === "bigint" && typeof(m) === "bigint") {
                return bigpow(a,b,m);
            } else if (typeof(a) === "number" && typeof(b) === "number" && typeof(m) === "number") {
                return parseInt(bigpow(BigInt(a),BigInt(b),BigInt(m)));
            } else {
                throw `a, b, m must either all be number or all be bigints.`;
            }
        },
    };
}();
