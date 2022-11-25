var buffer;
var myCanvas;
var xBufferSize = 2000;
var ratio = 1.25;
var yBufferSize = xBufferSize * ratio;
var frameWidth = 100;
var windowEdgeSize;

var xi = 0;
var yi = 0;

var palette;

var isCaptured = false;
var loadingBuffer;

var myScene;

var stages = [
    {
        "stage": "filling",
        "iters": 2,
        "title": "Stage 1/3 - coloring",
        "step": [19, 21]
    },
    {
        "stage": "drawing",
        "iters": 1,
        "title": "Stage 2/3 - texturing",
        "step": [19, 21]
    },
    {
        "stage": "filling",
        "iters": 3,
        "title": "Stage 3/3 - coloring",
        "step": [19, 21]
    }
]
var currIter = 0;
var currStage = 0;

function setup() {
    frameRate(60);

    var newW, newH;
    if (windowHeight / windowWidth >= ratio) {
        newW = windowWidth;
        newH = windowWidth * ratio;
    } else {
        newW = windowHeight / ratio;
        newH = windowHeight;
    }

    myCanvas = createCanvas(newW, newH);
    myCanvas.id('mycanvas');

    buffer = createGraphics(xBufferSize, yBufferSize);
    buffer.pixelDensity(1);
    buffer.width = newW;
    buffer.height = newH;

    myCanvas.style('display', 'block');

    palette = palettes[paletteIndex];
    noiseSeed(fxRandRanged(-2000, 2000));

    loadingBuffer = createGraphics(370, 30);
    loadingBuffer.pixelDensity(2);
    loadingBuffer.textSize(20);
    loadingBuffer.stroke(0);
    loadingBuffer.strokeWeight(4);
    loadingBuffer.fill(255);

    myScene = new sceneClass();
    
    buffer.background(0);
    
    console.log('Made with 🤍 by @ivposure');
};

function windowResized() {
    var newW, newH;
    if (windowHeight / windowWidth >= ratio) {
        newW = windowWidth;
        newH = windowWidth * ratio;
    } else {
        newW = windowHeight / ratio;
        newH = windowHeight;
    }

    resizeCanvas(newW, newH);
    buffer.width = newW;
    buffer.height = newH;

    image(buffer, 0, 0);
};

function drawIsoline (x, y) {
    var r = 1;
    var xNext, yNext;
    
    var pointStyle = myScene.getPointStyle(x, y);
    var defaultArea = pointStyle["area"];

    myScene.setDefaultArea(defaultArea);

    buffer.noFill();
    buffer.beginShape(POINTS);

    buffer.strokeWeight(2);

    var color = pointStyle["color"];
    buffer.stroke(color, 150);

    for (i = 0; i < 100; i++) {        
        pointStyle = myScene.getPointStyle(x, y);
        var area = pointStyle["area"];
        if (myScene.isLeftArea(area)) {
            break;
        }

        buffer.curveVertex(x, y);
       
        var noiseVal = pointStyle["noise"];
        var ang = map(noiseVal, 0, 1, 0, Math.PI * 2);
        xNext = x + r * Math.cos(ang);
        yNext = y + r * Math.sin(ang);

        x = xNext;
        y = yNext;
    }
    buffer.endShape();
}

function drawFrameBorder () {
    var x1 = frameWidth;
    var x2 = xBufferSize - frameWidth;
    var y = frameWidth;

    buffer.strokeWeight(1);
    buffer.stroke(0);

    var iters = 800;
    var noiseShift = 200;
    
    buffer.beginShape(POINTS);
    for (var i = 0; i < iters; i++) {
        for (var x = x1; x <= x2; x += 10) {
            var yt = y - fxrand() * fxrand() * fxrand() * noiseShift;
            var xr = Math.max(frameWidth - yt, 5);
            var xt = x + fxRandRanged(-xr, xr);
            buffer.curveVertex(xt, yt);
        }
    }
    buffer.endShape();

    var x1 = frameWidth;
    var x2 = xBufferSize - frameWidth;
    var y = yBufferSize - frameWidth;
    
    buffer.beginShape(POINTS);
    for (var i = 0; i < iters; i++) {
        for (var x = x1; x <= x2; x += 10) {
            var yt = y + fxrand() * fxrand() * fxrand() * noiseShift;
            var xr = Math.max(yt - (yBufferSize - frameWidth), 5);
            var xt = x + fxRandRanged(-xr, xr);
            buffer.curveVertex(xt, yt);
        }
    }
    buffer.endShape();

    var x = frameWidth;
    var y1 = frameWidth;
    var y2 = yBufferSize - frameWidth;
    
    buffer.beginShape(POINTS);
    for (var i = 0; i < iters; i++) {
        for (var y = y1; y <= y2; y += 10) {
            var xt = x - fxrand() * fxrand() * fxrand() * noiseShift;
            var yr = Math.max(frameWidth - xt, 5);
            var yt = y + fxRandRanged(-yr, yr);
            buffer.curveVertex(xt, yt);
        }
    }
    buffer.endShape();

    var x = xBufferSize - frameWidth;
    var y1 = frameWidth;
    var y2 = yBufferSize - frameWidth;
    
    buffer.beginShape(POINTS);
    for (var i = 0; i < iters; i++) {
        for (var y = y1; y <= y2; y += 10) {
            var xt = x + fxrand() * fxrand() * fxrand() * noiseShift;
            var yr = Math.max(xt - (xBufferSize - frameWidth), 5);
            var yt = y + fxRandRanged(-yr, yr);
            buffer.curveVertex(xt, yt);
        }
    }
    buffer.endShape();
}

function fillAreas (x, y) {
    buffer.noFill();

    if (currIter >= 2) {
        buffer.strokeWeight(2);    
    } else {
        buffer.strokeWeight(2.6);
    }

    var xl = x, yl = y;
    var rWidth = 30;
    buffer.beginShape(POINTS);
    for (i = 0; i < 40; i++) {
        xl = xl + fxRandRanged(-rWidth, rWidth);
        yl = yl + fxRandRanged(-rWidth, rWidth);

        if (xl < 0 || xl > xBufferSize) {
            break;
        }
        if (yl < 0 || yl > yBufferSize) {
            break;
        }

        var color = myScene.getFillColor(xl, yl);
        buffer.stroke(...color);
        buffer.curveVertex(xl, yl);
    }
    buffer.endShape();
}

var nStills = 30;
var currStill = 0;

function draw() {      
    if (isCaptured) {
        return;
    }

    for (let i = 0; i < 120; i++) {
        if (currStage >= stages.length) {
            if (!isCaptured) {
                loadingBuffer.clear();
                drawFrameBorder();
                image(buffer, 0, 0);
                fxpreview();
                isCaptured = true;

                if (currStill < nStills) {
                    currStill++;
                } else {
                    return;
                }
            }
            return;
        }

        var stage = stages[currStage]["stage"];
        var maxStageIters = stages[currStage]["iters"];
        if (stage == "drawing") {
            drawIsoline(xi, yi);
        } else if (stage == "filling") {
            fillAreas(xi, yi);
        }

        var step = stages[currStage]["step"];

        xi += fxRandRanged(...step);
        if (xi > xBufferSize) {
            xi = 0;
            yi += fxRandRanged(...step);
        }
        if (yi >= yBufferSize) {
            yi = 0;
            currIter++;
        }

        if (maxStageIters <= currIter) {
            currIter = 0;
            currStage++;

        }
    }
    image(buffer, 0, 0);

    if (currStage < stages.length) {
        var title = stages[currStage]["title"];
        var loaded = (Math.max(1, yi) / yBufferSize) * 1 / maxStageIters + currIter / maxStageIters;
        loaded = Math.round(loaded * 100);
        loadingBuffer.clear();
        loadingBuffer.text(`${title} ${loaded}%`, 5, 23);
        image(loadingBuffer, 0, 0);
    }
};

function keyTyped() {
    if (key === 's') {
        save(buffer, 'corriente.png');
    }
};