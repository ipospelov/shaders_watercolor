var buffer;
var myCanvas;
var xBufferSize = 2000;
var ratio = 1.25;
var yBufferSize = xBufferSize * ratio;
var frameWidth = 150;
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
        "iters": 1,
        "title": "Stage 1/4 - paper texturing"
    },
    {
        "stage": "pre-noise",
        "iters": 0,
        "title": "Stage 1/4 - paper texturing"
    },
    {
        "stage": "structure",
        "iters": 1,
        "title": "Stage 2/4 - structure"
    },
    {
        "stage": "drawing",
        "iters": 0,
        "title": "Stage 3/4 - coloring"
    },
    {
        "stage": "post-noise",
        "iters": 0,
        "title": "Stage 4/4 - loaning noise texture"
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

    palette = palettes[10];
    //palette = palettes[paletteIndex];

    //noiseSeed(1);
    noiseSeed(fxRandRanged(0, 2000));

    loadingBuffer = createGraphics(370, 30);
    loadingBuffer.textSize(20);
    loadingBuffer.stroke(255);
    loadingBuffer.fill(0);

    myScene = new sceneClass();
    //myScene = new ExtraFlowDelimiterScene();
    
    buffer.background(0);
    
    console.log('Made with 🤍 by @ivposure');

    drawFrameBorder();
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

function drawIsoline (x, y) {
    palette = palettes[10];

    if (myScene.isInFrame(x, y)) {
        return;
    }

    var r = 1;
    var xNext, yNext, angleNext, prevAngle;
    
    var pointStyle = myScene.getPointStyle(x, y);
    var currHeight = pointStyle["noise"];
    var defaultArea = pointStyle["area"];

    myScene.setDefaultArea(defaultArea);

    buffer.noFill();
    buffer.beginShape();

    var maxAlpha = 255;
    var minAlpha = 25;
    var maxWeight = 2;
    var minWeight = 0.4;

    var yFrameSize = (yBufferSize / 2) - frameWidth;
    var yRo = Math.abs(y - yBufferSize / 2);

    var xFrameSize = (xBufferSize / 2) - frameWidth;
    var xRo = Math.abs(x - xBufferSize / 2);

    if (xRo > yRo) {
        var ro = xRo;
        var frameSize = xFrameSize;
    } else {
        var ro = yRo;
        var frameSize = yFrameSize;
    }
    var randCoef =  ro / frameSize;

    var alpha = map(randCoef, 0, 1, maxAlpha, minAlpha);
    var strokeWeight = map(randCoef, 0, 1, maxWeight, minWeight);

    buffer.strokeWeight(strokeWeight);

    var color = pointStyle["color"];
    buffer.stroke(...color, alpha);
    var noiseSize = 20;
    var iters = area == 1 ? 150 : 50;

    for (i = 0; i < iters; i++) {
        var minDiff = Infinity;
        
        pointStyle = myScene.getPointStyle(x, y);
        
        var area = pointStyle["area"];
        var style = pointStyle["style"]

        if (myScene.isLeftArea(area)) {
            break;
        }

        if (area == 1) {
            var phi = getPhi(x - xBufferSize / 2, y - yBufferSize / 2);
            var ro = Math.sqrt((x - xBufferSize / 2) ** 2 + (y - yBufferSize / 2) ** 2);
    
            var randCoef = noise(ro, phi * 0.01);
            randCoef = map(randCoef, 0, 1, -1, 1) / 5;
    
            var radiusCoef = ro / (xBufferSize / 2);
    
            var [rx, ry] = getDecart(ro, phi + randCoef * radiusCoef * 1.5);
    
            var randCoef = map(ro / (xBufferSize / 2), 0, 1, 0, 0.5);
            var randX = fxRandRanged(-noiseSize, noiseSize) * randCoef;
            var randY = fxRandRanged(-noiseSize, noiseSize) * randCoef;
    
            var xDraw = rx + randX;
            var yDraw = ry + randY;
        } else if (area == 2 || area == 3) {
            var ro = Math.sqrt((x - xBufferSize / 2) ** 2 + (y - yBufferSize / 2) ** 2);

            var randCoef = map(ro / (xBufferSize / 2), 0, 1, 0.1, 0.5);
            var randX = fxRandRanged(-noiseSize, noiseSize) * randCoef;
            var randY = fxRandRanged(-noiseSize, noiseSize) * randCoef;

            var xDraw = x + randX;
            var yDraw = y + randY;
        } else {
            buffer.stroke(...color, 230);
            buffer.strokeWeight(0.8);

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
    buffer.strokeWeight(0.1);
    buffer.beginShape();

    var shift = fxRandRanged(0, 1000);
    
    if (!colorless) {
        var colors = palette[0];
        alpha /= 2;
    } else {
        var colors = [
            [255, 255, 255, 80 * alpha],
            [125, 125, 125, 5 * alpha],
            [0, 0, 0, 255 * alpha]
        ]
    }
    
    var h = noise(x * 0.01 + currIter, y * 0.01 + currIter);
    var index = Math.floor(map(h, 0, 1, 0, colors.length - 0.001));
    buffer.stroke(...colors[index], 255 * alpha);

    var xl = x, yl = y;
    var rWidth = 100, r = 1;
    buffer.beginShape();
    for (i = 0; i < 140; i++) {
        var noiseRand = noise(xl * 0.001, yl * 0.001);

        xl = xl + fxRandRanged(-rWidth, rWidth) * noiseRand;
        yl = yl + fxRandRanged(-rWidth, rWidth) * noiseRand;
        
        buffer.curveVertex(xl, yl);

        var noiseVal = noise(xl * 0.00009 + shift, yl * 0.00009 + shift);
        var ang = map(noiseVal, 0, 1, 0, Math.PI * 2) + fxRandRanged(0, Math.PI * 2);
        xl = xl + r * Math.cos(ang);
        yl = yl + r * Math.sin(ang);
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

function drawFlowBorder (x, y) {
    if (myScene.isInFrame(x, y)) {
        return;
    }

    buffer.strokeWeight(0.4);
    buffer.stroke(255);

    var noiseGetter = myScene.getFlowMarginNoise(x, y);
    if (!noiseGetter) {
        return;
    }
    var currHeight = noiseGetter.get(x, y);
    var xNext, yNext, angleStep = 15, r = 3, angleNext, prevAngle;
    buffer.beginShape();

    var nIters = fxRandRanged(170, 230);
    for (i = 0; i < nIters; i++) {
        var minDiff = Infinity;

        if (!myScene.getFlowMarginNoise(x, y)) {
            break;
        }
        if (myScene.isInFrame(x, y)) {
            break;
        }

        buffer.curveVertex(x + fxRandRanged(-1, 1), y + fxRandRanged(-1, 1));
        for (var angle = 0; angle < 360; angle += angleStep) {
            if (Math.abs(prevAngle - angle) == 180) {
                continue
            }

            var angleNorm = map(angle, 0, 360, 0, 2 * Math.PI);

            var xPretend = x + r * Math.cos(angleNorm);
            var yPretend = y + r * Math.sin(angleNorm);

            var height = noiseGetter.get(xPretend, yPretend);
            var currDiff = Math.abs(currHeight - height);

            if (currDiff < minDiff) {
                minDiff = currDiff;
                xNext = xPretend;
                yNext = yPretend;
                angleNext = angle;
            }
        }
        x = xNext;
        y = yNext;
        prevAngle = angleNext;
    }
    buffer.endShape();
}

function fillAreas (x, y) {
    palette = palettes[10];

    if (myScene.isInFrame(x, y)) {
        return;
    }

    buffer.noFill();
    buffer.strokeWeight(2);

    var shift = fxRandRanged(0, 1000);

    var xl = x, yl = y;
    var rWidth = 100, r = 1;
    buffer.beginShape(POINTS);
    for (i = 0; i < 140; i++) {
        var noiseRand = noise(xl * 0.001, yl * 0.001);

        xl = xl + fxRandRanged(-rWidth, rWidth) * noiseRand;
        yl = yl + fxRandRanged(-rWidth, rWidth) * noiseRand;

        pointStyle = myScene.getPointStyle(xl, yl);

        buffer.stroke(...pointStyle["color"]);
        
        buffer.curveVertex(xl, yl);

        var noiseVal = noise(xl * 0.00009 + shift, yl * 0.00009 + shift);
        var ang = map(noiseVal, 0, 1, 0, Math.PI * 2) + fxRandRanged(0, Math.PI * 2);
        xl = xl + r * Math.cos(ang);
        yl = yl + r * Math.sin(ang);
    }
    buffer.endShape();
}

function reinit () {
    noiseSeed(fxRandRanged(0, 2000));
    var brushStyles = [
        [0.0009, 0, 340],
        [0.0009, 0, 640],
        [0.009, 0, 30],
        //[0.00001, 0, 2410],
    ]
    var brushStyles2 = [
        [0.009],
        [0.09],
        [0.05],
        [0.0008],
    ]
    
    brushStyle1 = randomInt(0, brushStyles.length - 1);
    brushStyle2 = randomInt(0, brushStyles2.length - 1);
    
    var sceneRand = fxrand();
    sceneClass = ExtraFlowDelimiterScene;
    if (sceneRand <= 0.7) {
        sceneClass = ExtraFlowDelimiterScene;
        sceneIndex = 0;
    } else {
        sceneClass = SimpleLinesDelimeter;
        sceneIndex = 1;
    }
    
    console.log(brushStyle1, brushStyle2, sceneClass.toString());
    console.log(brushStyles[brushStyle1], brushStyles2[brushStyle2])

    myScene = new sceneClass();

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

                //save(buffer, `scene_${sceneIndex}_palette_${paletteIndex}.png`);
                console.log(currStill, nStills);
                //reinit();
            }
            return;
        }

        var stage = stages[currStage]["stage"];
        var maxStageIters = stages[currStage]["iters"];
        if (stage == "pre-noise") {
            drawNoise(xi, yi, 0.1);
        } else if (stage == "structure") {
            drawFlowBorder(xi, yi);
        } else if (stage == "drawing") {
            drawIsoline(xi, yi);
        } else if (stage == "post-noise") {
            drawNoise(xi, yi, 0.2, colorless=true);
        } else if (stage == "filling") {
            fillAreas(xi, yi);
        }

        xi += fxRandRanged(19, 21);
        if (xi > xBufferSize) {
            xi = 0;
            yi += fxRandRanged(19, 21);
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