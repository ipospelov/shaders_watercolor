class RectanglePainter {
    constructor (x, y, width, height) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.currentX = x;
        this.currentY = y;
    }

    draw () {
        if (this.currentX >= this.width + this.x) {
            return 0;
        }

        let stepLen = 500// + fxRandRanged(-50, 50);
        let yMargin = 100// + fxRandRanged(-30, 30);
        let xMargin = 50;

        let nextY = this.currentY + stepLen;

        let percentage = (this.currentX - this.x) / (this.width - this.x);

        var c1 = color9;
        var c2 = color10;
        if (percentage > 0.5 && percentage < 0.9) {
            c1 = color11;
            c2 = color12;
        }

        drawCurve(this.currentX, this.currentY, this.currentX, nextY, c1, c2);

        this.currentY = nextY + yMargin;
        if (this.currentY >= this.height + this.y) {
            this.currentY = this.y;
            this.currentX += xMargin;
        }
        return 1;
    }
}

class WavePainter {
    constructor (yMin, yMax, n, colors, overlay = false) {
        this.yMin = yMin;
        this.yMax = yMax;

        this.n = n;
        this.currentN = n;

        this.margin = (yMax - yMin) / n;

        this.nEachMax = 10;
        this.nEachCurrent = 0;

        this.overlay = overlay;
        this.colors = colors;
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
        let angleMargin = -200;
        drawWave(
            xBorderMargin,
            y - angleMargin, xBufferSize - xBorderMargin, y + angleMargin,
            ...this.getColor(),
            this.overlay
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

        var c1 = color1;
        var c2 = color2;
        
        let col_rand = fxrand();

        if (col_rand < 0.3) {
            c1 = color3;
            c2 = color4;
        } else if (col_rand < 0.7) {
            c1 = color7;
            c2 = color8;
        }

        let x = fxRandRanged(100, xBufferSize - 100);
        let y = fxRandRanged(500, yBufferSize - 100);
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