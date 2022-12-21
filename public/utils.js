function fxRandRanged (minV, maxV) {
    var maxVal = Math.max(minV, maxV);
    var minVal = Math.min(minV, maxV);
    
    let diff = maxVal - minVal;
    return fxrand() * diff + minVal;
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
    return [ro * Math.cos(phi) + xBufferSize / 2, ro * Math.sin(phi) + yBufferSize / 2];
}

function getDecartShifted(ro, phi, x0, y0) {
    return [ro * Math.cos(phi) + x0, ro * Math.sin(phi) + y0];
}

class Line {
    constructor (phi, x0, y0) {
        this.k = Math.tan(phi);
        this.x0 = x0;
        this.y0 = y0;
    }

    isGreater (x, y) {
        var xn = x - xBufferSize / 2;
        var yn = y - yBufferSize / 2;
        if (yn - this.y0 > this.k * (xn - this.x0)) {
            return 0;
        }
        return 1;
    }
}

function inCircle(minR, maxR, xCenter, yCenter, x, y) {
    var x = x - xBufferSize / 2;
    var y = y - yBufferSize / 2;
    var r2 = (x - xCenter) ** 2 + (y - yCenter) ** 2;
    if (r2 < maxR ** 2 & r2 > minR ** 2) {
        return true;
    }

    return false;
}

function rgb(r, g, b) {
    return [r / 255, g / 255, b / 255];
}