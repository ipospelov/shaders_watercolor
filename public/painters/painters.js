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

        let [c1, c2] = randomFromRange(palettes[1]);

        // let x = fxRandRanged(100, xBufferSize - 100);
        // let y = fxRandRanged(100, yBufferSize - 100);
        let uniforms = {
            "u_size": 0.3 + fxrand() * 0.4
        }

        // let [c1, c2] = palettes[1][0];

        let x = fxRandRanged(100, xBufferSize - 100);
        let y = fxRandRanged(100, yBufferSize - 100);
        // let uniforms = {
        //     "u_size": 1.3,
        //     //"u_seed": 0.2,
        // }

        drawBlob(x, y, c1, c2, uniforms);
        
        this.currentN++;

        return 1;
    }
}

class BlobPainter {
    constructor (x, y, colors, uniforms) {
        Object.assign(this, { x, y, colors, uniforms });
        this.isDrawn = false;
    }

    draw () {
        if (this.isDrawn) {
            return 0;
        }

        drawBlob(this.x, this.y, ...this.colors, this.uniforms);
        this.isDrawn = true;
        return 0;
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

class ContinuousLinePainter extends NestedPainter {
    constructor (colors) {
        super();
        this.uniforms = {
            // "u_seed": 0.1,
            "u_width": 0.001,
            // "u_blur": 0.001,
            "u_amplitude": .5,
            "u_frequency": 17,
            "u_fbm_frequency": 1.5,
            "u_fbm_amplitude": 0.3,
        }

        let x0 = xBufferSize / 2;
        let y0 = 200;

        for (let i = 0; i < 5; i++) {
            let x1 = x0;
            let y1 = y0 + 400;
            this.painters.push(
                new LinePainter(x0, y0, x1, y1, colors, this.uniforms),
                new BlobPainter(x1, y1, colors, {})
            )

            x0 = x1;
            y0 = y1;
        }
    }
}

// class 