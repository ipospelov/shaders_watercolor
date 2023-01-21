class RectanglePainter {
    constructor (x, y, width, height, colors) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.currentX = x;
        this.currentY = y;

        this.colors = colors;
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
        let xMargin = 50;

        let nextY = this.currentY + stepLen;

        drawCurve(this.currentX, this.currentY, this.currentX, nextY, ...this.getColor());

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
    constructor (yMin, yMax, n, colors, angleMargin, overlay = false) {
        this.yMin = yMin;
        this.yMax = yMax;

        this.n = n;
        this.currentN = n;

        this.margin = (yMax - yMin) / n;

        this.nEachMax = 0;
        this.nEachCurrent = 0;

        this.overlay = overlay;
        this.colors = colors;
        this.angleMargin = angleMargin;
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

        let localOverlay = this.overlay && this.nEachCurrent == 0;
        drawWave(
            xBorderMargin,
            y - this.angleMargin, xBufferSize - xBorderMargin, y + this.angleMargin,
            ...this.getColor(),
            localOverlay
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

        var c1 = hexColor('#B57D94');
        var c2 = hexColor('#F4B67C');
        
        let col_rand = fxrand();

        if (col_rand < 0.25) {
            c1 = hexColor('#0A2647');
            c2 = hexColor('#5584AC');
        } else if (col_rand < 0.5) {
            c1 = hexColor('#3D314A');
            c2 = hexColor('#B57D94');
        } else if (col_rand < 0.75) {
            c1 = hexColor('#955670');
            c2 = hexColor('#9C818D');
        }

        let x = fxRandRanged(100, xBufferSize - 100);
        let y = fxRandRanged(100, yBufferSize - 100);
        drawBlob(x, y, c1, c2);

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
            return -1;
        }

        drawPaper();
        this.isDrawn = true;
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