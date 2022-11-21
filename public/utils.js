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