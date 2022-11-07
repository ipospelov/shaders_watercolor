var buffer;
var myCanvas;
var bufferSize = 2000;
var frameWidth = 150;
var windowEdgeSize;

var xi = 0;
var yi = 0;
var nIters = 6;
var nCurr = 0;

var palette;

var isCaptured = false;
var loadingBuffer;

var myScene;

var ranges = [
    [15, 15],
    [20, 20],
    [17, 15],
    [15, 17],
    [21, 19],
    [19, 21],
]

function setup() {
    frameRate(60);

    windowEdgeSize = Math.min(windowWidth, windowHeight);
    myCanvas = createCanvas(windowEdgeSize, windowEdgeSize);
    buffer = createGraphics(bufferSize, bufferSize);
    buffer.pixelDensity(1);

    myCanvas.style('display', 'block');

    buffer.width = windowEdgeSize;
    buffer.height = windowEdgeSize;

    palette = palettes[paletteIndex];

    //noiseSeed(1);
    noiseSeed(fxRandRanged(0, 200));

    loadingBuffer = createGraphics(160, 30);
    loadingBuffer.background(0);
    loadingBuffer.textSize(24);
    loadingBuffer.stroke(255);
    loadingBuffer.noFill();

    myScene = new sceneClass();
    
    buffer.background(0);
    console.log('Made with 🤍 by @ivposure');
};

function windowResized() {
    windowEdgeSize = Math.min(windowWidth, windowHeight);
    resizeCanvas(windowEdgeSize, windowEdgeSize);

    buffer.width = windowEdgeSize;
    buffer.height = windowEdgeSize;

    image(buffer, 0, 0);
};

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

function drawIsoline (x, y) {
    if (myScene.isInFrame(x, y)) {
        return;
    }

    var r = 3;
    var xNext, yNext, angleNext, prevAngle;
    
    var pointStyle = myScene.getPointStyle(x, y);
    var currHeight = pointStyle["noise"];
    var defaultArea = pointStyle["area"];

    myScene.setDefaultArea(defaultArea);

    buffer.noFill();
    //buffer.strokeWeight(0.8);
    buffer.beginShape();
    
    var ro = Math.sqrt((x - bufferSize / 2)** 2 + (y - bufferSize / 2) ** 2);
    var randCoef = ro / (bufferSize / 2);
    var alpha = map(randCoef, 0, 1, 255, 35);

    var sw = map(randCoef, 0, 1, 3, 1);

    buffer.strokeWeight(sw);

    buffer.stroke(...pointStyle["color"], alpha);

    for (i = 0; i < 50; i++) {
        var minDiff = Infinity;
        
        pointStyle = myScene.getPointStyle(x, y);
        
        var area = pointStyle["area"];
        var style = pointStyle["style"]

        if (myScene.isLeftArea(area)) {
            break;
        }

        //var phi = getPhi(x - bufferSize / 2, y - bufferSize / 2);
        //var randCoef = noise(ro * 0.0001, phi * 0.001);

        var ro = Math.sqrt((x - bufferSize / 2)** 2 + (y - bufferSize / 2) ** 2);
        var randCoef = ro / (bufferSize / 2);
        var rx = fxRandRanged(-20, 20) * randCoef;
        var ry = fxRandRanged(-20, 20) * randCoef;

        buffer.curveVertex(x + rx, y + ry);
        if (style == "flow") {
            var noiseVal = pointStyle["noise"];
            var ang = map(noiseVal, 0, 1, 0, Math.PI * 2);
            xNext = x + r * Math.cos(ang);
            yNext = y + r * Math.sin(ang);
        } else {
            for (var angle = 0; angle < 360; angle += 20) {
                if (Math.abs(prevAngle - angle) == 180) {
                    continue
                }
                var angleNorm = map(angle, 0, 360, 0, 2 * Math.PI);

                var xPretend = x + r * Math.cos(angleNorm);
                var yPretend = y + r * Math.sin(angleNorm);

                var height = myScene.getHeight(xPretend, yPretend, area);
                var currDiff = Math.abs(currHeight - height);

                if (currDiff < minDiff) {
                    minDiff = currDiff;
                    xNext = xPretend;
                    yNext = yPretend;
                    angleNext = angle;
                }
            }  
        }

        x = xNext;
        y = yNext;
        prevAngle = angleNext;
    }
    buffer.endShape();
}

function draw() {      
    if (nCurr >= nIters) {
        if (!isCaptured) {
            fxpreview();
            isCaptured = true;
        }
        return;
    }

    var range = ranges[nCurr];
    for (let i = 0; i < 80; i++) {
        if (nCurr % 2 == 0) {
            drawIsoline(xi, yi);
        } else {
            drawIsoline(yi, xi);
        }
        
        xi += fxRandRanged(...range);
        if (xi > bufferSize) {
            xi = fxRandRanged(-10, 0) ;
            yi += fxRandRanged(...range);
        }
        if (yi >= bufferSize + 100) {
            yi = fxRandRanged(-10, 0);
            nCurr++;
            if (nCurr >= nIters) {
                break;
            }
        }
    }

    image(buffer, 0, 0);
    if (nCurr < nIters) {
        var loaded = (Math.max(1, yi) / (bufferSize + 100)) * 1 / nIters + nCurr / nIters;
        loaded = Math.round(loaded * 100);
        loadingBuffer.background(0);
        loadingBuffer.text(`Loading ${loaded}%`, 5, 23);
        image(loadingBuffer, 0, 0);
    }
};

function keyTyped() {
    if (key === 's') {
        saveCanvas(myCanvas, 'flowers', 'png');
    }
};