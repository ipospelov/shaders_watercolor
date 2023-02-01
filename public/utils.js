function fxRandRanged (minV, maxV) {
    var maxVal = Math.max(minV, maxV);
    var minVal = Math.min(minV, maxV);
    
    let diff = maxVal - minVal;
    return fxrand() * diff + minVal;
}

function symmetricalRand(val) {
    return fxRandRanged(-val, val);
}


function randomInt(minV, maxV) {
    let diff = maxV - minV + 1;
    return Math.floor(fxrand() * 0.9999 * diff + minV);
}
function randomFromRange(range) {
    return range[randomInt(0, range.length - 1)];
}

function normAngle(angle) {
    return angle / 180 * Math.PI;
}

function rgb(r, g, b) {
    return [r / 255, g / 255, b / 255];
}

function hexColor(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? rgb(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null;
  }

function createBuffer (width, height) {
    let buff = createGraphics(xBufferSize, yBufferSize, WEBGL);
	buff.pixelDensity(1);
	buff.width = width;
	buff.height = height;

    return buff;
}

function getPhi(x, y) {
    if (x > 0 & y >= 0) {
        return Math.atan(y / x);
    }
    if (x > 0 & y < 0) {
        return Math.atan(y / x) + Math.PI * 2;
    }
    if (x < 0) {
        return Math.atan(y / x) + Math.PI;
    }
    return Math.PI / 2;
}

function getDecart (ro, phi) {
    return [ro * Math.cos(phi), ro * Math.sin(phi)];
}

function outOfScene (x, y) {
    return x > xBufferSize || x < 0 || y > yBufferSize || y < 0;
}

class RandParam {
    constructor (values) {
        this.values = values;
    }

    get () {
        return randomFromRange(this.values);
    }
}

function degreeToRadian(degree) {
    return degree * Math.PI / 180;
}

function getIsolineNextPoint(xStart, yStart, margin, direction = 0) {
    let noiseMap = function (x, y) {
        let scale = 0.0005;
        return noise(x * scale, y * scale);
    }

    let currHeight = noiseMap(xStart, yStart);
    let minDiff = Infinity;
    let xNext, yNext, angleNext;

    for (let angle = -90 + direction; angle < 90 + direction; angle += 2) {
        // if (Math.abs(prevAngle - angle) == 180) {
        //     continue
        // }
        let angleNorm = degreeToRadian(angle);

        let xPretend = xStart + margin * Math.cos(angleNorm);
        let yPretend = yStart + margin * Math.sin(angleNorm);

        let height = noiseMap(xPretend, yPretend);
        let currDiff = Math.abs(currHeight - height);

        if (currDiff < minDiff) {
            minDiff = currDiff;
            xNext = xPretend;
            yNext = yPretend;
            angleNext = angle;
        }
    }

    return [xNext, yNext, angleNext];
}