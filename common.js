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
    };
}();
