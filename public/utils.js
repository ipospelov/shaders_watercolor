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

function rgb(r, g, b) {
    return [r / 255, g / 255, b / 255];
}
