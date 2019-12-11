/* global aoc */
let aoc08 = function() {
    "use strict";

    const checkImageCorruption = function(imgString, imgWidth, imgHeight) {
        const layerSize = imgWidth * imgHeight;
        const layerCount = imgString.length / layerSize;
        let counts = [];
        for(let i=0; i<layerCount; ++i ) {
            let layer = imgString.slice(i*layerSize, (i+1)*layerSize);
            counts.push({
                zeroes: (layer.match(/0/gu) || []).length,
                product: (layer.match(/1/gu) || []).length * (layer.match(/2/gu) || []).length,
            });
        }
        const result = counts.reduce( (minElem, elem) => (elem.zeroes < minElem.zeroes) ? elem : minElem );
        return result.product;
    };

    const renderImage = function(imgString, imgWidth, imgHeight) {
        const layerSize = imgWidth * imgHeight;
        const layerCount = imgString.length / layerSize;
        let layers = [];
        for(let i=0; i<layerCount; ++i) {
            layers.push(imgString.slice(i*layerSize, (i+1)*layerSize));
        }
        let output = [];
        let canvas = document.querySelector("#myCanvas");
        canvas.width = imgWidth * 8;
        canvas.height = imgHeight * 8;
        let ctx = canvas.getContext('2d');
        ctx.scale(8,8);
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for(let y=0; y<imgHeight; ++y) {
            for(let x=0; x<imgWidth; ++x) {
                let i = y*imgWidth + x;
                let found = false;
                for(let z=0; z<layerCount; ++z) {
                    const layer = layers[z];
                    if (layer[i] === "0") {
                        output.push("0");
                        ctx.fillStyle = "black";
                        ctx.fillRect(x,y,1,1);
                        found = true;
                        break;
                    } else if (layer[i] === "1") {
                        output.push("1");
                        ctx.fillStyle = "white";
                        ctx.fillRect(x,y,1,1);
                        found = true;
                        break;
                    } else if (layer[i] === "2") {
                        continue;
                    } else {
                        throw `Invalid pixel color ${layers[z][i]} at layer=${z} index ${i}`;
                    }
                }
                if (!found) {
                    throw `No opaque pixel found for pixel index ${i}`;
                }
            }
        }
        return output.join("");
    };
    
    let processFile = function(inElem, callback, outElem) {
        let firstFile = document.querySelector(inElem).files[0];
        let reader = new FileReader();
        reader.onload = (event) => {
            //const file = event.target.result;
            const allLines = reader.result.split(/\r\n|\n/u);
            const result = callback(allLines[0]);
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
        aoc.testCase(checkImageCorruption, ["123456789012", 3, 2,], 1);
        // Part 2 tests
        aoc.testCase(renderImage, ["0222112222120000", 2, 2,], "0110");
        
        document.querySelector("#testResults").innerHTML = "All tests passed!";
    };
    
    return {
        processFile: processFile,
        solvePart1: (imgString) => {
            return {
                actual: checkImageCorruption(imgString, 25, 6),
                expected: 2193,
            };
        },
        solvePart2: (imgString) => {
            return {
                actual: renderImage(imgString, 25, 6),
                expected: "100011111010010111101111010001100001001010000100000101011100111101110011100001001000010010100001000000100100001001010000100000010011110100101111010000",
            };
        },
    };
}();

