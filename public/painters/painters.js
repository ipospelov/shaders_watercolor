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
    constructor (y, sceneHeight, ang, n, colors, uniforms) {
        Object.assign(this, { y, n, colors, uniforms });
        this.currentN = 0;

        this.xMargin = 100;

        this.hShift = Math.tan(ang) * (xBufferSize / 2 + this.xMargin);
        this.hStep = sceneHeight / max(1, n - 1);

        this.nEachMax = 0;
        this.nEachCurrent = 0;
    }

    getColor () {
        return this.colors[this.currentN % this.colors.length];
    }

    draw () {
        if (this.currentN >= this.n) {
            return 0;
        }

        let y = this.y - this.currentN * this.hStep;

        drawWave(
            -this.xMargin, y - this.hShift,
            xBufferSize + this.xMargin, y + this.hShift,
            ...this.getColor(),
            this.uniforms
        );

        if (this.nEachCurrent >= this.nEachMax) {
            this.nEachCurrent = 0;
            this.currentN++;
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