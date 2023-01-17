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

var color1 = rgb(16, 161, 157);
var color2 = rgb(85, 132, 172);

var color3 = rgb(136, 164, 124);
var color4 = rgb(85, 132, 172);

var color5 = rgb(250, 255, 175);
var color6 = rgb(0, 85, 85);

var color7 = rgb(255, 191, 0);
var color8 = rgb(85, 132, 172);

var color9 = rgb(10, 38, 71);
var color10 = rgb(44, 116, 179);


var color11 = rgb(101, 136, 100);
var color12 = rgb(61, 86, 86);

// var color3 = rgb(59, 24, 95);
// var color4 = rgb(20, 66, 114);

// var color5 = rgb(59, 24, 95);
// var color6 = rgb(192, 96, 161);

// var color7 = rgb(255, 191, 0);
// var color8 = rgb(59, 24, 95);

// var color9 = rgb(123, 40, 105);
// var color10 = rgb(130, 195, 236);
