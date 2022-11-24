var buffer;
var myCanvas;
var xBufferSize = 2000;
var ratio = 1.25;
var yBufferSize = xBufferSize * ratio;
var frameWidth = 150;
var windowEdgeSize;

var xi = -100;
var yi = -100;

var palette;

var isCaptured = false;
var loadingBuffer;

var myScene;

var stages = [
    {
        "stage": "pre-noise",
        "iters": 0,
        "title": "Stage 1/4 - paper texturing"
    },
    {
        "stage": "filling",
        "iters": 2,
        "title": "Stage 1/4 - paper texturing"
    },
    {
        "stage": "drawing",
        "iters": 2,
        "title": "Stage 3/4 - coloring"
    },
    {
        "stage": "filling",
        "iters": 4,
        "title": "Stage 1/4 - paper texturing"
    },
    {
        "stage": "post-noise",
        "iters": 0,
        "title": "Stage 4/4 - loaning noise texture"
    },
    {
        "stage": "filling",
        "iters": 0,
        "title": "Stage 1/4 - paper texturing"
    },
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

    palette = palettes[4];
    //palette = palettes[paletteIndex];

    //noiseSeed(1);
    noiseSeed(fxRandRanged(-2000, 2000));

    loadingBuffer = createGraphics(370, 30);
    loadingBuffer.textSize(20);
    loadingBuffer.stroke(255);
    loadingBuffer.fill(0);

    myScene = new sceneClass();
    //myScene = new ExtraFlowDelimiterScene();
    
    buffer.background(0);
    
    console.log('Made with 🤍 by @ivposure');

    //drawFrameBorder();

    // buffer.stroke(255);
    // buffer.strokeWeight(10);
    // buffer.circle(xBufferSize / 2, yBufferSize / 2, 2 * 100);

    // var [x, y] = getDecartShifted(100, Math.PI / 4, xBufferSize / 2, yBufferSize / 2);
    // buffer.circle(x, y, 10);
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
    // if (myScene.isInFrame(x, y)) {
    //     return;
    // }

    var r = 1;
    var xNext, yNext, angleNext, prevAngle;
    
    var pointStyle = myScene.getPointStyle(x, y);
    var currHeight = pointStyle["noise"];
    var defaultArea = pointStyle["area"];

    myScene.setDefaultArea(defaultArea);

    buffer.noFill();
    buffer.beginShape(POINTS);

    buffer.strokeWeight(2.5);

    var color = pointStyle["color"];
    buffer.stroke(...color, 70);

    for (i = 0; i < 50; i++) {
        var minDiff = Infinity;
        
        pointStyle = myScene.getPointStyle(x, y);
        
        var area = pointStyle["area"];
        var style = pointStyle["style"]

        if (myScene.isLeftArea(area)) {
            break;
        }

        if (area == 1) {
            // var phi = getPhi(x - xBufferSize / 2, y - yBufferSize / 2);
            // var ro = Math.sqrt((x - xBufferSize / 2) ** 2 + (y - yBufferSize / 2) ** 2);
    
            // var randCoef = noise(ro, phi * 0.01);
            // randCoef = map(randCoef, 0, 1, -1, 1) / 8;
    
            // var radiusCoef = ro / (xBufferSize / 2);
    
            // var [rx, ry] = getDecart(ro, phi + randCoef * radiusCoef);
    
            // var randCoef = map(ro / (xBufferSize / 2), 0, 1, 0, 0.5);
            // var randX = fxRandRanged(-noiseSize, noiseSize) * 1;
            // var randY = fxRandRanged(-noiseSize, noiseSize) * 1;
    
            var xDraw = x;
            var yDraw = y;
        } else if (area == 2 || area == 3) {
            // var ro = Math.sqrt((x - xBufferSize / 2) ** 2 + (y - yBufferSize / 2) ** 2);

            // var randCoef = map(ro / (xBufferSize / 2), 0, 1, 0.1, 0.5);
            // var randX = fxRandRanged(-noiseSize, noiseSize) * 1;
            // var randY = fxRandRanged(-noiseSize, noiseSize) * 1;

            var xDraw = x;
            var yDraw = y;
        } else {
            buffer.stroke(...color, 100);
            buffer.strokeWeight(1.8);

            var xDraw = x;
            var yDraw = y;
        }
        buffer.curveVertex(xDraw, yDraw);
       
        
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

function drawNoise (x, y, alpha = 1, colorless = false) {
    buffer.noFill();
    buffer.strokeWeight(5.1);
    buffer.beginShape();
    
    var colors = [
        [237, 228, 224],
        [223, 211, 195],
        [255, 255, 255],
        [125, 125, 125]
    ]
    
    var h = noise(x * 0.01 + currIter, y * 0.01 + currIter);
    var index = Math.floor(map(h, 0, 1, 0, colors.length - 0.001));
    buffer.stroke(...colors[index], 15);

    var xl = x, yl = y;
    var rWidth = 200;
    buffer.beginShape();
    for (i = 0; i < 20; i++) {
        var noiseRand = noise(xl * 0.001, yl * 0.001);

        xl = xl + fxRandRanged(-rWidth, rWidth) * noiseRand;
        yl = yl + fxRandRanged(-rWidth, rWidth) * noiseRand;
        
        buffer.curveVertex(xl, yl);
    }
    buffer.endShape();
}

function drawFrameBorder () {
    buffer.noFill();
    buffer.strokeWeight(0.4);
    buffer.stroke(255);

    for (var y of [frameWidth + 1, yBufferSize - frameWidth - 1]) {
        buffer.beginShape();
        for (var x = frameWidth + 1; x <= xBufferSize - frameWidth; x++) {
            buffer.curveVertex(x + fxRandRanged(-1, 1), y + fxRandRanged(-1, 1));
        }
        buffer.endShape();
    }

    for (var x of [frameWidth + 1, xBufferSize - frameWidth - 1]) {
        buffer.beginShape();
        for (var y = frameWidth + 1; y <= yBufferSize - frameWidth; y++) {
            buffer.curveVertex(x + fxRandRanged(-1, 1), y + fxRandRanged(-1, 1));
        }
        buffer.endShape();
    }
}

function fillAreas (x, y) {
    //palette = palettes[palettes.length - 1];

    // if (myScene.isInFrame(x, y)) {
    //     return;
    // }

    buffer.noFill();
    buffer.strokeWeight(1.5);

    var xl = x, yl = y;
    var rWidth = 50;
    buffer.beginShape(POINTS);
    for (i = 0; i < 50; i++) {
        //var noiseRand = noise(xl * 0.00001, yl * 0.00001);

        xl = xl + fxRandRanged(-rWidth, rWidth);
        yl = yl + fxRandRanged(-rWidth, rWidth);

        var color = myScene.getFillColor(xl, yl);

        buffer.stroke(...color);

        buffer.curveVertex(xl, yl);
    }
    buffer.endShape();
}

function reinit () {
    noiseSeed(fxRandRanged(0, 2000));
    
    sceneIndex = randomInt(0, scenes.length - 1);
    myScene = new scenes[sceneIndex];

    paletteIndex = randomInt(0, palettes.length - 1);
    palette = palettes[paletteIndex];

    currIter = 0;
    currStage = 0;

    buffer.background(0);
    isCaptured = false;
}

var nStills = 30;
var currStill = 0;

function draw() {      
    if (isCaptured) {
        return;
    }

    for (let i = 0; i < 80; i++) {
        if (currStage >= stages.length) {
            if (!isCaptured) {
                loadingBuffer.clear();
                image(buffer, 0, 0);
                fxpreview();
                isCaptured = true;

                if (currStill < nStills) {
                    currStill++;
                } else {
                    return;
                }

                // save(buffer, `scene_${sceneIndex}_palette_${paletteIndex}.png`);
                // console.log(currStill, nStills);
                // reinit();
            }
            return;
        }

        var stage = stages[currStage]["stage"];
        var maxStageIters = stages[currStage]["iters"];
        if (stage == "pre-noise") {
            drawNoise(xi, yi, 0.4);
        } else if (stage == "drawing") {
            drawIsoline(xi, yi);
        } else if (stage == "post-noise") {
            drawNoise(xi, yi, 0.1, colorless=true);
        } else if (stage == "filling") {
            fillAreas(xi, yi);
        }

        var step = [19, 21];
        if (stage == "pre-noise" || stage == "post-noise") {
            step = [100, 110];
        }

        xi += fxRandRanged(...step);
        if (xi > xBufferSize + 100) {
            xi = -100;
            yi += fxRandRanged(...step);
        }
        if (yi >= yBufferSize + 100) {
            yi = -100;
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