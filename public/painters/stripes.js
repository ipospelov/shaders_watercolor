class StripePainter {
    constructor (x, y, ang, h, n, margin, colors, uniforms) {
        Object.assign(this, { x, y, ang, h, n, margin, colors, uniforms });
        this.nCurrent = 0;
        this.seed = fxrand();
    }

    getColor () {
        return this.colors;
    }

    draw () {
        if (this.nCurrent >= this.n) {
            return 0;
        }

        let r = this.nCurrent * this.margin;
        let [x0, y0] = getDecart(r, this.ang);
        x0 += this.x;
        y0 += this.y;

        let [x1, y1] = getDecart(this.h, this.ang + Math.PI / 2);
        x1 += x0;
        y1 += y0;

        if (outOfScene(x0, y0) & outOfScene(x1, y1)) {
            this.nCurrent++;
            return 1;
        }

        let uniforms = {...this.uniforms, "u_seed": this.seed};
        drawCurve(x0, y0, x1, y1, ...this.getColor(), uniforms);

        this.nCurrent++;
        return 1;
    }
}

class LineStripePainter extends NestedPainter {
    constructor (x, y, ang, h, stripeMargin, nStripes, nLines, margin, colors, uniforms) {
        super();

        let r = h + stripeMargin;
        for (let i = 0; i < nStripes; i++) {
            let [xp, yp] = getDecart(r * i, ang + Math.PI / 2);
            xp += x;
            yp += y;
            let painter = new StripePainter(xp, yp, ang, h, nLines, margin, colors, uniforms);
            this.painters.push(painter);
        }
    }
}


class RectanglePainter {
    constructor (x, y, w, h, axis, colors, uniforms = {}) {
        let n;
        let curveWidth = uniforms.u_width || defaultCurveWidth;
        if (axis) {
            n = 0.00007 * w / curveWidth;
        } else {
            n = 0.00007 * h / curveWidth;
        }

        Object.assign(this, { x, y, w, h, n, axis, colors, uniforms });

        this.nCurrent = 0;

        if (axis)
            this.step = w / Math.max(1, n - 1);
        else
            this.step = h / Math.max(1, n - 1);

        this.seed = fxrand();
    }

    getColor (x, y) {
        if (x > xBufferSize / 2 - 100 & x < xBufferSize / 2 + 100) {
            return palettes[1][5];
        }
        return this.colors;
    }

    draw () {
        if (this.nCurrent >= this.n) {
            return 0;
        }

        let x0, x1, y0, y1;
        if (this.axis) {
            x0 = this.x + this.step * this.nCurrent;
            x1 = x0;
            y0 = this.y;
            y1 = this.y + this.h;
        } else {
            x0 = this.x;
            x1 = x0 + this.w;
            y0 = this.y + this.step * this.nCurrent;
            y1 = y0;
        }
        
        if (outOfScene(x0, y0) & outOfScene(x1, y1)) {
            this.nCurrent++;
            return 1;
        }

        let colors = this.getColor(x0, y0);
        //let uniforms = randomFromRange(curveUniforms);
        let uniforms = {...this.uniforms, "u_seed": this.seed};

        drawCurve(x0, y0, x1, y1, ...colors, uniforms);

        this.nCurrent++;
        return 1;
    }
}

class ManyStripesPainter extends NestedPainter{
    constructor (x, y, w, h, nStripes, colors, uniforms) {
        super();
        let yMargin = 100;

        let marginSum = yMargin * (nStripes - 1);

        let hl = (h - marginSum) / max(1, nStripes);

        for (let i = 0; i < nStripes; i++) {
            let yl = (hl + yMargin) * i + y;
            let xl = x + fxRandRanged(-200, 200);
            let colors = palettes[1][i % palettes[1].length];
            let painter = new RectanglePainter(xl, yl, w, hl, 1, colors, uniforms);
            this.painters.push(painter);
        }
    }
}