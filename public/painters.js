class RectanglePainter {
    constructor (x, y, width, height, colors, uniforms) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.currentX = x;
        this.currentY = y;

        this.colors = colors;
        this.uniforms = uniforms;
    }

    getColor () {
        return this.colors[0];
    }

    draw () {
        if (this.currentX >= this.width + this.x) {
            return 0;
        }

        let stepLen = 500// + fxRandRanged(-50, 50);
        let yMargin = 100// + fxRandRanged(-30, 30);
        let xMargin = 80;

        let nextY = this.currentY + stepLen;

        drawCurve(this.currentX, this.currentY, this.currentX, nextY, ...this.getColor(), this.uniforms);

        this.currentY = nextY + yMargin;
        if (this.currentY >= this.height + this.y) {
            this.currentY = this.y;
            this.currentX += xMargin;
        }
        return 1;
    }
}

class FlowPainter {
    constructor () {
        this.noise = new NoiseCache(0.0005);

        this.xStart = xBufferSize / 2 - 200;

        this.yStart = 100;

        this.xCurrent = this.xStart;
        this.yCurrent = this.yStart;

        this.xStep = 30;

        this.r = 300;
        this.rStep = 100;

        this.numYMax = 7;
        this.numXMax = 5;

        this.numYCurrent = 0;
        this.numXCurrent = 0;
    }

    draw () {
        if (this.numXCurrent >= this.numXMax) {
            return 0;
        }

        if (this.numYCurrent >= this.numYMax) {
            this.xStart += this.xStep;
            this.xCurrent = this.xStart;
            this.yCurrent = this.yStart;
            this.numYCurrent = 0;
            this.numXCurrent++;
        }

        var noiseVal = this.noise.get(this.xCurrent, this.yCurrent);
        var ang = map(noiseVal, 0, 1, 0, Math.PI);

        let xNext = this.xCurrent + this.r * Math.cos(ang);
        let yNext = this.yCurrent + this.r * Math.sin(ang);

        drawCurve(this.xCurrent, this.yCurrent, xNext, yNext, color1, color2);

        this.xCurrent = xNext + this.rStep * Math.cos(ang);
        this.yCurrent = yNext + this.rStep * Math.sin(ang);
        this.numYCurrent++;

        return 1;
    }
}

class WavePainter {
    constructor (yMin, yMax, n, colors, angleMargin, uniforms) {
        this.yMin = yMin;
        this.yMax = yMax;

        this.n = n;
        this.currentN = n;

        this.margin = (yMax - yMin) / n;

        this.nEachMax = 0;
        this.nEachCurrent = 0;

        this.colors = colors;
        this.angleMargin = angleMargin;

        this.uniforms = uniforms;
    }

    getColor () {
        return this.colors[(this.n - this.currentN) % this.colors.length];
    }

    draw () {
        if (this.currentN == 0) {
            return 0;
        }

        let y = this.yMin + this.currentN * this.margin;

        let xBorderMargin = -100;

        drawWave(
            xBorderMargin,
            y - this.angleMargin, xBufferSize - xBorderMargin, y + this.angleMargin,
            ...this.getColor(),
            this.uniforms
        );

        if (this.nEachCurrent >= this.nEachMax) {
            this.nEachCurrent = 0;
            this.currentN--;
        } else {
            this.nEachCurrent++;
        }
        
        return 1;
    }
}

class BlobsPainter {
    constructor (n) {
        this.n = n;
        this.currentN = 0;
    }

    draw () {
        if (this.currentN >= this.n) {
            return 0;
        }

        let [c1, c2] = randomFromRange(palettes[0]);

        let x = fxRandRanged(100, xBufferSize - 100);
        let y = fxRandRanged(100, yBufferSize - 100);
        let uniforms = {
            "u_size": 0.3 + fxrand() * 0.3
        }
        drawBlob(x, y, c1, c2, uniforms);

        this.currentN++;

        return 1;
    }
}

class PaperPainted {
    constructor () {
        this.isDrawn = false;
    }

    draw () {
        if (this.isDrawn) {
            return 0;
        }

        drawPaper();
        this.isDrawn = true;
    }
}

class LeafPainter {
    constructor (x0, y0, x1, y1, n, uniforms) {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;

        this.n = n;
        this.uniforms = uniforms;

        this.nCurrent = 0;
    }

    draw () {
        if (this.nCurrent >= this.n) {
            return 0;
        }
        if (outOfScene(this.x0, this.y0) & outOfScene(this.x1, this.y1)) {
            return 0;
        }

        let colRand = fxrand();
        let [c1, c2] = palettes[0][3];
        if (colRand < 0.5) {
            [c1, c2] = palettes[0][4];
        }

        let uniforms = {...this.uniforms, "u_seed": fxrand()};
        drawCurve(this.x0, this.y0, this.x1, this.y1, c1, c2, uniforms);
        this.nCurrent++;

        return 1;
    }
}

class LeafLinePainter {
    constructor (x, y, r, ang, nLines, uniforms) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.ang = ang;

        this.nLines = nLines;
        this.uniforms = uniforms;

        this.nCurrentLines = 0;

        this.setLeafPainter();
    }

    setLeafPainter () {
        let [x, y] = getDecart(this.r, this.ang);
        x += this.x;
        y += this.y;

        let n = fxRandRanged(3, 7);
        this.leafPainter = new LeafPainter(this.x, this.y, x, y, n, this.uniforms);
        this.x = x;
        this.y = y;
    }

    draw () {
        if (this.nCurrentLines >= this.nLines) {
            return 0;
        }

        let isDrawn = this.leafPainter.draw();
        if (!isDrawn) {
            this.nCurrentLines++;
            this.setLeafPainter();
        }
        return 1;
    }
}

class FlowerPainter {
    constructor (x, y, ang0, ang1, r, nLeafs, uniforms) {
        this.xc = x;
        this.yc = y;

        this.ang0 = ang0;
        this.ang1 = ang1;
        this.r = r;

        this.nLeafs = nLeafs;
        this.nCurrentLeafs = 0;

        this.uniforms = uniforms;

        this.leafPainter = this.getLeafPainter();
    }

    getLeafPainter () {
        let angStep = (this.ang1 - this.ang0) / this.nLeafs;
        let ang = this.ang0 + angStep * this.nCurrentLeafs;

        let r = this.r + fxRandRanged(-this.r / 10, -this.r / 10);
        return new LeafLinePainter(this.xc, this.yc, r, ang, 6, this.uniforms);
    }

    draw () {
        if (this.nCurrentLeafs >= this.nLeafs) {
            return 0;
        }

        let isDrawn = this.leafPainter.draw();
        if (!isDrawn) {
            this.nCurrentLeafs++;
            this.leafPainter = this.getLeafPainter();
        }
        return 1;
    }
}

class CircledBlobsPainter {
    constructor (x, y, n) {
        this.x = x;
        this.y = y;
        this.n = n;
        this.nCurrent = 0;
    }

    draw () {
        if (this.nCurrent >= this.n) {
            return 0;
        }

        let ang = fxRandRanged(0, 2 * Math.PI);
        let r = fxRandRanged(0, yBufferSize) * fxrand() * fxrand() + 700 * fxrand();

        let [x, y] = getDecart(r, ang);

        x += this.x;
        y += this.y;

        let [c1, c2] = randomFromRange(palettes[0]);

        let uniforms = {
            "u_size": fxRandRanged(0.5, 1.3),
            "u_radius": fxRandRanged(10, 40),
            "u_noise_multiplier": fxRandRanged(0.3, 0.9)
        }

        drawBlob(x, y, c1, c2, uniforms);

        this.nCurrent++;

        return 1;
    }
}

class PipelinePainter {
    constructor (painters) {
        this.painter_objs = painters;
        this.n = 0;
    } 

    draw () {
        if (this.n >= this.painter_objs.length) {
            return;
        }

        if (!this.painter_objs[this.n].draw()) {
            this.n++;
        }
    }
}