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
        "stage": "pre-noise",
        "iters": 0,
        "title": "Stage 1/4 - paper texturing"
    },
    {
        "stage": "drawing",
        "iters": 13,
        "title": "Stage 3/4 - coloring"
    },
    {
        "stage": "post-noise",
        "iters": 2,
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

    palette = palettes[0];
    //palette = palettes[paletteIndex];

    //noiseSeed(1);
    noiseSeed(fxRandRanged(0, 2000));

    loadingBuffer = createGraphics(370, 30);
    loadingBuffer.textSize(20);
    loadingBuffer.stroke(255);
    loadingBuffer.fill(0);

    //myScene = new sceneClass();
    myScene = new ExtraFlowDelimiterScene();
    
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
    buffer.beginShape();
    
    var ro = Math.sqrt((x - xBufferSize / 2)** 2 + (y - yBufferSize / 2) ** 2);
    var randCoef = ro / (yBufferSize / 2);

    if (ro > yBufferSize / 2) {
        var alpha = 30;
        var sw = 0.4;
    } else {
        var alpha = map(randCoef, 0, 1, 255, 25);
        var sw = map(randCoef, 0, 1, 0.3, 0.1);
    }

    buffer.strokeWeight(sw);

    buffer.stroke(...pointStyle["color"], alpha);

    var noiseSize = 20;
    for (i = 0; i < 50; i++) {
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
            randCoef = map(randCoef, 0, 1, -1, 1) / 8;
    
            var radiusCoef = ro / (xBufferSize / 2);
    
            var [rx, ry] = getDecart(ro, phi + randCoef * radiusCoef);
    
    
            var randCoef = map(ro / (xBufferSize / 2), 0, 1, 0, 0.5);
            var randX = fxRandRanged(-noiseSize, noiseSize) * randCoef;
            var randY = fxRandRanged(-noiseSize, noiseSize) * randCoef;
    
            buffer.curveVertex(rx + randX, ry + randY);
        } else if (area == 2 || area == 3) {
            var randCoef = map(ro / (xBufferSize / 2), 0, 1, 0, 0.5);
            var randX = fxRandRanged(-noiseSize, noiseSize) * randCoef;
            var randY = fxRandRanged(-noiseSize, noiseSize) * randCoef;

            buffer.curveVertex(x + randX, y + randY);
        } else {
            buffer.curveVertex(x, y);
        }
       
        
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
    buffer.strokeWeight(0.5);
    buffer.beginShape();

    var shift = fxRandRanged(0, 1000);
    
    if (currIter == 0 & !colorless) {
        var colors = palette;
        alpha /= 2;
    } else {
        var colors = [
            [237, 228, 224, 100 * alpha],
            [223, 211, 195, 50 * alpha],
            [255, 255, 255, 80 * alpha],
            [125, 125, 125, 5 * alpha],
            [0, 0, 0, 255 * alpha]
        ]
    }
    
    var h = noise(x * 0.001 + currIter, y * 0.001 + currIter);
    var index = Math.floor(map(h, 0, 1, 0, colors.length - 0.001));
    buffer.stroke(...colors[index], 255 * alpha);

    var xl = x, yl = y;
    var rWidth = 30, r = 15;
    buffer.beginShape();
    for (i = 0; i < 40; i++) {
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
    buffer.strokeWeight(5);
    buffer.stroke(10);

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

function reinit () {
    noiseSeed(fxRandRanged(0, 2000));
    var brushStyles = [
        [0.0009, 0, 340],
        [0.0009, 0, 640],
        [0.009, 0, 30],
        [0.00001, 0, 2410],
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
    sceneClass = DoubleFlowDelimiterScene;
    if (sceneRand <= 0.02) {
        sceneClass = SinScene;
        sceneIndex = 0;
    } else if (sceneRand <= 0.04) {
        sceneClass = HighFrequencySinScene;
        sceneIndex = 1;
    // } else if (sceneRand <= 0.05) {
    //     sceneClass = HorizontalScene;
    } else if (sceneRand <= 0.3) {
        sceneClass = ManySpiralScene;
        sceneIndex = 2;
    } else if (sceneRand <= 0.5) {
        sceneClass = SnailSpiralScene;
        sceneIndex = 3;
    // } else if (sceneRand <= 0.6) {
    //     sceneClass = ExtraSpiralScene;
    //     sceneIndex = 4;
    // } else if (sceneRand <= 0.425) {
    //     sceneClass = FlowDelimiterScene;
    // } else if (sceneRand <= 0.65) {
    //     sceneClass = FlowDelimiterScene2;
    } else if (sceneRand <= 0.75) {
        sceneClass = DoubleFlowDelimiterScene;
        sceneIndex = 5;
    } else  {
        sceneClass = ExtraFlowDelimiterScene;
        sceneIndex = 6;
    }
    //  else {
    //     sceneClass = FlowDelimiterScene3;
    // }
    
    paletteIndex = randomInt(0, palettes.length - 1);
    
    window.$fxhashFeatures = {
        "Brush style 1": brushStyle1 + 1,
        "Brush style 2": brushStyle2 + 1,
        "Scene generator": sceneClass.toString(),
    }
    console.log(brushStyle1, brushStyle2, sceneClass.toString());
    console.log(brushStyles[brushStyle1], brushStyles2[brushStyle2])
    
    var delRand = fxrand();
    var delIndex = 0;
    if (delRand < 0.05) {
        delIndex = 3;
    } else if (delRand < 0.1) {
        delIndex = 2;
    } else if (delRand < 0.25){
        delIndex = 1;
    } else {
        delIndex = 0;
    } 

    myScene = new sceneClass();
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

                // if (currStill < nStills) {
                //     currStill++;
                // } else {
                //     return;
                // }

                //save(buffer, `scene_${sceneIndex}_palette_${paletteIndex}.png`);
                //reinit();
            }
            return;
        }

        var stage = stages[currStage]["stage"];
        var maxStageIters = stages[currStage]["iters"];
        if (stage == "pre-noise") {
            drawNoise(xi, yi, 0.11);
        } else if (stage == "drawing") {
            drawIsoline(xi, yi);
        } else if (stage == "post-noise") {
            drawNoise(xi, yi, 0.08, colorless=true);
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