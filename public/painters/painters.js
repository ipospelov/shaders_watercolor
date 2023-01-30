class NestedPainter {
    constructor () {
        this.nCurrent = 0;
        this.painters = [];
    }

    draw () {
        if (this.nCurrent >= this.painters.length) {
            return 0;
        }

        let isDrawn = this.painters[this.nCurrent].draw();
        if (!isDrawn) {
            this.nCurrent++;
        }
        return 1;
    }
}

class FlowPainter {
    constructor () {
        this.noise = new NoiseCache(0.0002, 0);

        this.xStart = xBufferSize / 2 - 600;

        this.yStart = 1000;

        this.xCurrent = this.xStart;
        this.yCurrent = this.yStart;

        this.xStep = 30;

        this.r = 100;
        this.rStep = 100;

        this.numYMax = 17;
        this.numXMax = 15;

        this.numYCurrent = 0;
        this.numXCurrent = 0;

        this.seed = fxrand();
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

        drawCurve(this.xCurrent, this.yCurrent, xNext, yNext, ...palettes[0][1], {
            //"u_seed": fxrand(),
            "u_amplitude": .5,
            "u_frequency": 50,
            "u_fbm_n": 3,
            "u_fbm_frequency": 2,
            "u_fbm_amplitude": 0.15,
        });

        let rs = this.rStep //+ fxRandRanged(-50, 50);

        this.xCurrent = xNext + rs * Math.cos(ang);
        this.yCurrent = yNext + rs * Math.sin(ang);
        this.numYCurrent++;

        return 1;
    }
}

class WavePainter {
    constructor (y, sceneHeight, ang, n, colors, uniforms) {
        Object.assign(this, { y, n, colors, uniforms });
        this.currentN = 0;

        this.xMargin = 150;

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
            "u_size": 0.3 + fxrand() * 0.4
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
        let r = fxRandRanged(0, yBufferSize) * fxrand() * fxrand() + 200 * fxrand();

        let [x, y] = getDecart(r, ang);

        x += this.x;
        y += this.y;

        let [c1, c2] = randomFromRange(palettes[0]);

        let uniforms = {
            "u_size": fxRandRanged(0.5, 0.6),
            "u_radius": fxRandRanged(10, 40),
            "u_noise_multiplier": fxRandRanged(0.3, 0.9)
        }

        drawBlob(x, y, c1, c2, uniforms);

        this.nCurrent++;

        return 1;
    }
}

class SquarePainter {
    constructor (x, y, h, colors, uniforms) {
        Object.assign(this, { colors, uniforms });
        this.nCurrent = 0;
        this.coords = [
            [x, y, x + h, y],
            [x + h, y, x + h, y + h],
            [x, y + h, x + h, y + h],
            [x, y, x, y + h]
        ]
    }

    draw () {
        if (this.nCurrent >= this.coords.length) {
            return 0;
        }

        let uniforms = {...this.uniforms, "u_seed": fxrand()};
        drawCurve(...this.coords[this.nCurrent], ...this.colors, uniforms);

        this.nCurrent++;
        return 1;
    }
}

class FilledSquarePainter extends NestedPainter{
    constructor (x, y, h, step, n, colors, uniforms) {
        super();

        for (let i = 0; i < n; i++) {
            let xl = x + step * i;
            let yl = y + step * i;
            let hl = h - step * 2 * i;
            let painter = new SquarePainter(xl, yl, hl, colors, uniforms);
            this.painters.push(painter);
        }
    }
}

class LinePainter {
    constructor (x0, y0, x1, y1, colors, uniforms) {
        Object.assign(this, { x0, y0, x1, y1, colors, uniforms });
        this.isDrawn = false;
    }

    draw () {
        if (this.isDrawn) {
            return 0;
        }

        drawCurve(this.x0, this.y0, this.x1, this.y1, ...this.colors, this.uniforms);
        this.isDrawn = true;
        return 0;
    }
}